import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { safeParseInt, normalizePhone } from "@/lib/validation";
import { encrypt, decrypt } from "@/lib/encryption";
import { getCustomerSession } from "@/lib/customerAuth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 예약 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 30, 60 * 1000); // 1분에 30회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(request.url);
    const passwordParam = searchParams.get("password");

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { viewCount: { increment: 1 } },
    });

    // 비밀번호 제외하고 반환
    const { password, ...reservationWithoutPassword } = reservation;

    // 개인정보 복호화
    const decryptedReservation = {
      ...reservationWithoutPassword,
      author: decrypt(reservation.author),
      brideName: decrypt(reservation.brideName),
      groomName: decrypt(reservation.groomName),
      bridePhone: decrypt(reservation.bridePhone),
      groomPhone: decrypt(reservation.groomPhone),
      receiptPhone: decrypt(reservation.receiptPhone),
      productEmail: decrypt(reservation.productEmail),
      deliveryAddress: decrypt(reservation.deliveryAddress),
    };

    // 비밀글인 경우
    if (reservation.isPrivate) {
      // 마이페이지 세션 확인 (자신의 예약글인지 확인)
      let isOwner = false;
      try {
        const session = await getCustomerSession();
        if (session && session.reservationId === reservationId) {
          // 자신의 예약글이면 자동으로 열람 가능
          isOwner = true;
        } else if (session) {
          // 다른 예약글이지만 같은 사용자인지 확인 (이름과 전화번호로)
          const currentReservation = await prisma.reservation.findUnique({
            where: { id: session.reservationId },
            select: {
              author: true,
              brideName: true,
              bridePhone: true,
              groomName: true,
              groomPhone: true,
            },
          });

          if (currentReservation) {
            const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');
            const decryptedCurrentAuthor = decrypt(currentReservation.author) || '';
            const decryptedCurrentBrideName = decrypt(currentReservation.brideName) || '';
            const decryptedCurrentGroomName = decrypt(currentReservation.groomName) || '';
            const decryptedCurrentBridePhone = decrypt(currentReservation.bridePhone) || '';
            const decryptedCurrentGroomPhone = decrypt(currentReservation.groomPhone) || '';

            const normalizedCurrentBridePhone = normalizePhone(decryptedCurrentBridePhone);
            const normalizedCurrentGroomPhone = normalizePhone(decryptedCurrentGroomPhone);

            const rAuthor = decryptedReservation.author || '';
            const rBrideName = decryptedReservation.brideName || '';
            const rGroomName = decryptedReservation.groomName || '';
            const rBridePhone = decryptedReservation.bridePhone || '';
            const rGroomPhone = decryptedReservation.groomPhone || '';

            const rNormalizedBridePhone = normalizePhone(rBridePhone);
            const rNormalizedGroomPhone = normalizePhone(rGroomPhone);

            // 소유권 확인
            const authorMatch = rAuthor === decryptedCurrentAuthor && 
              (rNormalizedBridePhone === normalizedCurrentBridePhone || 
               rNormalizedGroomPhone === normalizedCurrentGroomPhone ||
               rNormalizedBridePhone === normalizedCurrentGroomPhone ||
               rNormalizedGroomPhone === normalizedCurrentBridePhone);
            const brideMatch = rBrideName === decryptedCurrentBrideName && 
              rNormalizedBridePhone === normalizedCurrentBridePhone;
            const groomMatch = rGroomName === decryptedCurrentGroomName && 
              rNormalizedGroomPhone === normalizedCurrentGroomPhone;

            if (authorMatch || brideMatch || groomMatch) {
              isOwner = true;
            }
          }
        }
      } catch (error) {
        // 세션 확인 실패 시 무시하고 계속 진행
        console.error('세션 확인 오류:', error);
      }

      // 자신의 예약글이면 자동으로 열람 가능
      if (isOwner) {
        const eventSnapApplications = await prisma.eventSnapApplication.findMany({
          where: { reservationId: reservationId },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({
          ...decryptedReservation,
          eventSnapApplications,
          isLocked: false,
        });
      }

      // 비밀번호가 제공된 경우 검증
      if (passwordParam) {
        const isPasswordValid = await bcrypt.compare(passwordParam, reservation.password);
        if (isPasswordValid) {
          const eventSnapApplications = await prisma.eventSnapApplication.findMany({
            where: { reservationId: reservationId },
            orderBy: { createdAt: "desc" },
          });
          return NextResponse.json({
            ...decryptedReservation,
            eventSnapApplications,
            isLocked: false,
          });
        }
      }

      // 비밀번호 없거나 불일치 - 잠금 상태로 반환 (내용 숨김)
      return NextResponse.json({
        id: reservation.id,
        title: reservation.title,
        author: decryptedReservation.author, // 복호화된 이름만 표시
        isPrivate: true,
        isLocked: true,
        overseasResident: !!reservation.overseasResident,
        createdAt: reservation.createdAt,
        content: "비밀글입니다. 비밀번호를 입력해주세요.",
        phone: null,
        email: null,
        weddingDate: null,
        location: null,
      });
    }

    const eventSnapApplications = await prisma.eventSnapApplication.findMany({
      where: { reservationId: reservationId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      ...decryptedReservation,
      eventSnapApplications,
      isLocked: false,
    });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "예약 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 예약 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 10, 15 * 60 * 1000); // 15분에 10회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { password } = body;

    // 기존 예약 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, reservation.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 전화번호 정규화 (하이픈 제거)
    const normalizePhoneNumber = (phone: string | null | undefined): string | null => {
      if (!phone) return null;
      return phone.replace(/[^0-9]/g, '');
    };

    // 상품 종류별 기본 가격 (할인 전 가격)
    const getProductBasePrice = (productType: string | null): number => {
      switch (productType) {
        case '가성비형':
          return 340000; // 할인 전 34만원
        case '기본형':
          return 600000; // 할인 전 60만원
        case '시네마틱형':
          return 950000; // 할인 전 95만원
        case '야외스냅':
          return 0; // 가격 정보 필요 시 추가
        case '프리웨딩':
          return 0; // 가격 정보 필요 시 추가
        default:
          return 0;
      }
    };

    // 추가 옵션 가격 계산
    const calculateAdditionalOptions = (options: any): number => {
      let additionalPrice = 0;
      if (options.makeupShoot) additionalPrice += 200000; // 메이크업 촬영
      if (options.paebaekShoot) additionalPrice += 50000; // 폐백 촬영
      if (options.receptionShoot) additionalPrice += 50000; // 피로연 촬영
      return additionalPrice;
    };

    // 상품이 변경되었거나 추가 옵션이 변경된 경우 totalAmount 재계산
    const newProductType = body.productType || reservation.productType;
    const productChanged = newProductType !== reservation.productType;
    const optionsChanged = 
      (body.makeupShoot !== undefined && body.makeupShoot !== reservation.makeupShoot) ||
      (body.paebaekShoot !== undefined && body.paebaekShoot !== reservation.paebaekShoot) ||
      (body.receptionShoot !== undefined && body.receptionShoot !== reservation.receptionShoot);

    // 가성비형으로 변경되면 신년할인과 예약후기 할인 제거
    if (productChanged && newProductType === '가성비형') {
      body.discountNewYear = false;
      body.discountReviewBlog = false;
    }

    let newTotalAmount = reservation.totalAmount || 0;
    if (productChanged || optionsChanged) {
      const basePrice = getProductBasePrice(newProductType);
      const additionalPrice = calculateAdditionalOptions({
        makeupShoot: body.makeupShoot !== undefined ? body.makeupShoot : reservation.makeupShoot,
        paebaekShoot: body.paebaekShoot !== undefined ? body.paebaekShoot : reservation.paebaekShoot,
        receptionShoot: body.receptionShoot !== undefined ? body.receptionShoot : reservation.receptionShoot,
      });
      newTotalAmount = basePrice + additionalPrice;
    }

    // 업데이트 데이터 준비
    const updateData: any = {
      title: body.title || reservation.title,
      author: body.author ? encrypt(body.author) : reservation.author,
      brideName: body.brideName ? encrypt(body.brideName) : reservation.brideName,
      bridePhone: body.bridePhone ? encrypt(normalizePhoneNumber(body.bridePhone)) : reservation.bridePhone,
      groomName: body.groomName ? encrypt(body.groomName) : reservation.groomName,
      groomPhone: body.groomPhone ? encrypt(normalizePhoneNumber(body.groomPhone)) : reservation.groomPhone,
      receiptPhone: body.receiptPhone ? encrypt(normalizePhoneNumber(body.receiptPhone)) : reservation.receiptPhone,
      depositName: body.depositName || null,
        productEmail: body.productEmail ? encrypt(body.productEmail) : reservation.productEmail,
        productType: body.productType || null,
        foundPath: body.foundPath || null,
      weddingDate: body.weddingDate || null,
      weddingTime: body.weddingTime || null,
      venueName: body.venueName || null,
      venueFloor: body.venueFloor || null,
      guestCount: body.guestCount ? parseInt(body.guestCount) : null,
      makeupShoot: body.makeupShoot || false,
      paebaekShoot: body.paebaekShoot || false,
      receptionShoot: body.receptionShoot || false,
      mainSnapCompany: body.mainSnapCompany || null,
      makeupShop: body.makeupShop || null,
      dressShop: body.dressShop || null,
      deliveryAddress: body.deliveryAddress ? encrypt(body.deliveryAddress) : reservation.deliveryAddress,
      usbOption: body.usbOption || false,
      seonwonpan: body.seonwonpan || false,
      gimbalShoot: body.gimbalShoot || false,
      playbackDevice: body.playbackDevice || null,
      eventType: body.eventType || null,
      shootLocation: body.shootLocation || null,
      shootDate: body.shootDate || null,
      shootTime: body.shootTime || null,
      shootConcept: body.shootConcept || null,
      discountCouple: body.discountCouple || false,
      discountReview: body.discountReview || false,
      // 가성비형이면 신년할인과 예약후기 할인 제거
      discountNewYear: newProductType === '가성비형' ? false : (body.discountNewYear !== undefined ? body.discountNewYear : (reservation.discountNewYear !== undefined ? reservation.discountNewYear : true)),
      discountReviewBlog: newProductType === '가성비형' ? false : (body.discountReviewBlog || false),
      specialNotes: body.specialNotes || null,
      customShootingRequest: body.customShootingRequest || false,
      customStyle: body.customStyle || null,
      customEditStyle: body.customEditStyle || null,
      customMusic: body.customMusic || null,
      customLength: body.customLength || null,
      customEffect: body.customEffect || null,
      customContent: body.customContent || null,
      customSpecialRequest: body.customSpecialRequest || null,
      // 상품 변경 시 totalAmount 업데이트
      totalAmount: newTotalAmount,
    };

    // 할인 금액 재계산 (totalAmount가 변경된 경우)
    if (productChanged || optionsChanged) {
      const depositAmount = reservation.depositAmount || 100000;
      let discountAmount = 0;
      
      // 신년 할인 (가성비형이면 제외)
      const finalDiscountNewYear = newProductType === '가성비형' ? false : (body.discountNewYear !== undefined ? body.discountNewYear : reservation.discountNewYear);
      if (finalDiscountNewYear) {
        discountAmount += 50000;
      }
      
      // 르메그라피 제휴 할인 (메인스냅이 르메그라피이고 기본형/시네마틱형인 경우)
      const mainSnapCompany = body.mainSnapCompany || reservation.mainSnapCompany || '';
      const isLemeGraphy = mainSnapCompany.toLowerCase().includes('르메그라피') || mainSnapCompany.toLowerCase().includes('leme');
      if (isLemeGraphy && (newProductType === '기본형' || newProductType === '시네마틱형')) {
        discountAmount += 150000;
      }
      
      // 짝꿍 할인 (예약 확정 후 적용되므로 여기서는 계산만)
      // 후기 할인 (후기 제출 후 적용되므로 여기서는 계산만)
      
      updateData.discountAmount = discountAmount;
      updateData.finalBalance = Math.max(0, newTotalAmount - depositAmount - discountAmount - (reservation.referralDiscount || 0) - (reservation.reviewDiscount || 0));
    }

    // 짝궁할인 처리
    if (body.discountCouple) {
      // 짝궁할인을 체크한 경우
      if (reservation.partnerCode) {
        // 이미 입력된 경우 - 기존 값 유지
        updateData.partnerCode = reservation.partnerCode;
      } else if (body.partnerCode) {
        // 새로 입력한 경우 - 입력한 값 사용
        updateData.partnerCode = body.partnerCode;
      } else if (!reservation.referralCode) {
        // 짝궁할인을 신청하지 않았다가 신청한 경우 referralCode 생성
        const decryptedAuthor = decrypt(reservation.author) || '';
        
        if (reservation.weddingDate && decryptedAuthor) {
          try {
            // weddingDate를 YYYYMMDD 형식으로 변환
            let dateStr: string;
            if (typeof reservation.weddingDate === 'string') {
              dateStr = reservation.weddingDate.replace(/-/g, '').substring(0, 8);
              if (dateStr.length !== 8) {
                const date = new Date(reservation.weddingDate);
                if (!isNaN(date.getTime())) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  dateStr = `${year}${month}${day}`;
                } else {
                  dateStr = '';
                }
              }
            } else {
              dateStr = '';
            }

            if (dateStr) {
              // YYMMDD 형식으로 변환 (앞의 20 제거)
              const yy = dateStr.slice(2, 4);
              const mmdd = dateStr.slice(4, 8);
              // 이름에서 공백 제거
              const cleanName = decryptedAuthor.replace(/\s/g, '');
              const referralCode = `${yy}${mmdd} ${cleanName}`;
              updateData.referralCode = referralCode;
            }
          } catch (e) {
            console.error("Error generating referralCode:", e);
          }
        }
      }
    } else {
      // 짝궁할인을 체크하지 않은 경우 - partnerCode를 null로 저장
      updateData.partnerCode = null;
    }

    // 업데이트 - 개인정보는 암호화하여 저장
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData,
    });

    return NextResponse.json({
      message: "예약 문의가 수정되었습니다.",
      id: updatedReservation.id,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "예약 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 예약 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting 적용 (삭제는 더 엄격하게)
    const rateLimitResponse = rateLimit(request, 5, 15 * 60 * 1000); // 15분에 5회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { password, adminDelete } = body;

    // 기존 예약 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관리자 삭제인 경우 관리자 인증 강제
    if (adminDelete) {
      const { requireAdminAuth } = await import("@/lib/auth");
      const authResponse = await requireAdminAuth(request);
      if (authResponse) {
        return authResponse; // 인증 실패
      }
    } else {
      // 일반 사용자 삭제는 비밀번호 확인
      if (!password) {
        return NextResponse.json(
          { error: "비밀번호를 입력해주세요." },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(password, reservation.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
    }

    // 삭제
    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return NextResponse.json({ message: "예약 문의가 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { error: "예약 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
