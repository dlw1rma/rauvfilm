import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { safeParseInt, sanitizeString, normalizePhone, validateLength } from "@/lib/validation";
import { encrypt, decrypt } from "@/lib/encryption";

// GET: 예약 목록 조회
export async function GET(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 30, 60 * 1000); // 1분에 30회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const page = safeParseInt(searchParams.get("page"), 1, 1, 1000);
    const limit = safeParseInt(searchParams.get("limit"), 10, 1, 100);
    const skip = (page - 1) * limit;

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          isPrivate: true,
          createdAt: true,
          reply: {
            select: { id: true },
          },
        },
      }),
      prisma.reservation.count(),
    ]);

    const formattedReservations = reservations.map((r: typeof reservations[number]) => ({
      id: r.id,
      title: r.title,
      author: decrypt(r.author) || '', // 복호화
      isPrivate: r.isPrivate,
      createdAt: r.createdAt,
      hasReply: !!r.reply,
    }));

    return NextResponse.json({
      reservations: formattedReservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "예약 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 예약 작성
export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용 (예약 생성은 더 엄격하게)
    const rateLimitResponse = rateLimit(request, 5, 15 * 60 * 1000); // 15분에 5회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const {
      title,
      content,
      author,
      password,
      isPrivate,
      // 필수 작성항목(공통)
      brideName,
      bridePhone,
      groomName,
      groomPhone,
      receiptPhone,
      depositName,
      productEmail,
      productType,
      partnerCode,
      referralNickname,
      foundPath,
      termsAgreed,
      faqRead,
      // 개인정보 활용 동의
      privacyAgreed,
      // 해외 거주 (비밀번호=이메일, SMS 미발송)
      overseasResident,
      // 본식DVD 예약 고객님 필수 추가 작성 항목
      weddingDate,
      weddingTime,
      venueName,
      venueFloor,
      guestCount,
      makeupShoot,
      paebaekShoot,
      receptionShoot,
      mainSnapCompany,
      makeupShop,
      dressShop,
      deliveryAddress,
      usbOption,
      seonwonpan,
      gimbalShoot,
      // 본식DVD 주 재생매체
      playbackDevice,
      // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
      eventType,
      shootLocation,
      shootDate,
      shootTime,
      shootConcept,
      // 할인사항 (체크박스)
      discountCouple,
      discountReview,
      discountNewYear,
      discountReviewBlog,
      // 특이사항
      specialNotes,
      // 커스텀 촬영 요청 필드
      customShootingRequest,
      customStyle,
      customEditStyle,
      customMusic,
      customLength,
      customEffect,
      customContent,
      customSpecialRequest,
      // 르메그라피 제휴 할인
      lemeGraphyDiscount,
    } = body;

    // 입력 검증 및 길이 제한
    const sanitizedTitle = sanitizeString(title, 200);
    const sanitizedAuthor = sanitizeString(author, 50);
    const sanitizedBrideName = sanitizeString(brideName, 50);
    const sanitizedGroomName = sanitizeString(groomName, 50);
    const normalizedBridePhone = normalizePhone(bridePhone || "");
    const normalizedGroomPhone = normalizePhone(groomPhone || "");

    // 유효성 검사
    if (!sanitizedTitle || !sanitizedAuthor || !password) {
      return NextResponse.json(
        { error: "제목, 계약자 성함, 비밀번호는 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (!validateLength(password, 4, 100)) {
      return NextResponse.json(
        { error: "비밀번호는 4자 이상 100자 이하여야 합니다." },
        { status: 400 }
      );
    }

    const isOverseas = !!overseasResident;
    if (!sanitizedBrideName || !sanitizedGroomName) {
      return NextResponse.json(
        { error: "신부님/신랑님 성함은 필수 항목입니다." },
        { status: 400 }
      );
    }
    if (!isOverseas && (!normalizedBridePhone || !normalizedGroomPhone)) {
      return NextResponse.json(
        { error: "신부님/신랑님 전화번호는 필수 항목입니다. (해외 거주 시 '해외 거주' 체크)" },
        { status: 400 }
      );
    }
    if (!isOverseas && (normalizedBridePhone.length < 10 || normalizedGroomPhone.length < 10)) {
      return NextResponse.json(
        { error: "전화번호 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }
    if (isOverseas && !productEmail) {
      return NextResponse.json(
        { error: "해외 거주 시 이메일 주소는 필수입니다." },
        { status: 400 }
      );
    }

    if (!termsAgreed || !faqRead || !privacyAgreed) {
      return NextResponse.json(
        { error: "약관 동의 및 개인정보 활용 동의는 필수입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 잔금 및 할인 계산
    const totalAmount = body.totalAmount || 0; // 정가 (클라이언트에서 전달받거나 기본값 0)
    const depositAmount = 100000; // 예약금 10만원 고정
    let referralDiscount = 0; // 짝꿍 할인
    let reviewDiscount = 0; // 후기 할인 (후기 링크가 있을 때만)
    
    // referralCode 자동 생성 (예식날짜+성함)
    let referralCode: string | null = null;
    if (weddingDate && author) {
      try {
        // 예식날짜를 YYYYMMDD 형식으로 변환
        let dateStr: string;
        if (typeof weddingDate === 'string') {
          // "2025-05-20" 형식 또는 "20250520" 형식 모두 처리
          dateStr = weddingDate.replace(/-/g, '').substring(0, 8);
          if (dateStr.length !== 8) {
            // Date 객체로 파싱 시도
            const date = new Date(weddingDate);
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
        
        if (dateStr && author) {
          // YYMMDD 형식으로 변환 (앞의 20 제거)
          const yy = dateStr.slice(2, 4);
          const mmdd = dateStr.slice(4, 8);
          // 닉네임이 있으면 닉네임 사용, 없으면 계약자 이름 사용
          const codeName = (referralNickname && typeof referralNickname === 'string' && referralNickname.trim())
            ? referralNickname.trim()
            : author;
          const cleanName = codeName.replace(/\s/g, '');
          referralCode = `${yy}${mmdd} ${cleanName}`;
          
          // 중복 체크 - 중복이 있어도 형식 유지 (숫자 붙이지 않음)
          // 같은 날짜, 같은 이름이면 같은 코드 사용
        }
      } catch (error) {
        console.error("Error generating referral code:", error);
        // referralCode 생성 실패해도 계속 진행
      }
    }

    // 짝꿍 할인: 예약 생성 시 유효한 partnerCode가 있으면 1만원 즉시 적용
    if (discountCouple && partnerCode && typeof partnerCode === "string") {
      const trimmedCode = String(partnerCode).trim();
      if (trimmedCode.length >= 2) {
        const referrerRes = await prisma.reservation.findUnique({
          where: { referralCode: trimmedCode },
          select: { id: true, status: true, weddingDate: true },
        });
        if (referrerRes && referrerRes.status === "CONFIRMED" && referrerRes.weddingDate) {
          try {
            let wd: Date;
            if (typeof referrerRes.weddingDate === "string") {
              const ds = referrerRes.weddingDate.replace(/-/g, "").substring(0, 8);
              if (ds.length === 8) {
                wd = new Date(
                  parseInt(ds.slice(0, 4), 10),
                  parseInt(ds.slice(4, 6), 10) - 1,
                  parseInt(ds.slice(6, 8), 10)
                );
              } else {
                wd = new Date(referrerRes.weddingDate);
              }
            } else {
              wd = new Date(referrerRes.weddingDate);
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            wd.setHours(0, 0, 0, 0);
            if (wd >= today) {
              referralDiscount = 10000;
            }
          } catch {
            // 날짜 파싱 실패 시 할인 미적용
          }
        }
      }
    }

    // 르메그라피 제휴 할인 (15만원)
    const lemeGraphyDiscountAmount = lemeGraphyDiscount || 0;

    // 할인 총액 계산 (신년/후기/짝꿍/르메그라피 등)
    const discountAmount = referralDiscount + reviewDiscount + lemeGraphyDiscountAmount;

    // 최종 잔금 계산: 정가 - 예약금 - 할인들
    const finalBalance = Math.max(0, totalAmount - depositAmount - discountAmount);

    const reservation = await prisma.reservation.create({
      data: {
        title: sanitizedTitle,
        content: sanitizeString(content, 5000) || "",
        author: encrypt(sanitizedAuthor) ?? sanitizedAuthor, // 암호화 (실패 시 원본, author 필수)
        password: hashedPassword,
        isPrivate: isPrivate !== undefined ? isPrivate : true, // 기본값 true (비밀글만)
        // 필수 작성항목(공통) - 개인정보 암호화
        brideName: encrypt(sanitizedBrideName) || null,
        bridePhone: isOverseas ? null : (encrypt(normalizedBridePhone) || null),
        groomName: encrypt(sanitizedGroomName) || null,
        groomPhone: isOverseas ? null : (encrypt(normalizedGroomPhone) || null),
        receiptPhone: isOverseas ? null : (encrypt(receiptPhone ? normalizePhone(receiptPhone) : null) || null),
        depositName: depositName || null,
        productEmail: encrypt(productEmail) || null, // 이메일 암호화
        productType: productType || null,
        // 짝궁할인을 체크하지 않으면 짝궁코드 저장하지 않음
        partnerCode: discountCouple ? (partnerCode || null) : null,
        foundPath: foundPath || null,
        termsAgreed: termsAgreed || false,
        faqRead: faqRead || false,
        // 개인정보 활용 동의
        privacyAgreed: privacyAgreed || false,
        overseasResident: isOverseas,
        // 본식DVD 예약 고객님 필수 추가 작성 항목
        weddingDate: weddingDate || null,
        weddingTime: weddingTime || null,
        venueName: venueName || null,
        venueFloor: venueFloor || null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        makeupShoot: makeupShoot || false,
        paebaekShoot: paebaekShoot || false,
        receptionShoot: receptionShoot || false,
        mainSnapCompany: mainSnapCompany || null,
        makeupShop: makeupShop || null,
        dressShop: dressShop || null,
        deliveryAddress: encrypt(deliveryAddress) || null, // 주소 암호화
        usbOption: usbOption || false,
        seonwonpan: seonwonpan || false,
        gimbalShoot: gimbalShoot || false,
        // 본식DVD 주 재생매체
        playbackDevice: playbackDevice || null,
        // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
        eventType: eventType || null,
        shootLocation: shootLocation || null,
        shootDate: shootDate || null,
        shootTime: shootTime || null,
        shootConcept: shootConcept || null,
        // 할인사항 (체크박스) - 가성비형·르메그라피 제휴 시 신년할인 적용 불가
        discountCouple: discountCouple || false,
        discountReview: discountReview || false,
        discountNewYear: (() => {
          if (productType === "가성비형") return false; // 가성비형은 신년할인 적용 대상 아님
          const isLeme = (mainSnapCompany || "").toLowerCase().includes("르메그라피") || (mainSnapCompany || "").toLowerCase().includes("leme");
          const lemeProduct = productType === "기본형" || productType === "시네마틱형";
          if (isLeme && lemeProduct) return false;
          return discountNewYear !== undefined ? discountNewYear : true;
        })(),
        discountReviewBlog: discountReviewBlog || false,
        // 특이사항
        specialNotes: specialNotes || null,
        // 커스텀 촬영 요청 필드
        customShootingRequest: customShootingRequest || false,
        customStyle: Array.isArray(customStyle) ? customStyle.join(", ") : customStyle || null,
        customEditStyle: Array.isArray(customEditStyle) ? customEditStyle.join(", ") : customEditStyle || null,
        customMusic: Array.isArray(customMusic) ? customMusic.join(", ") : customMusic || null,
        customLength: Array.isArray(customLength) ? customLength.join(", ") : customLength || null,
        customEffect: Array.isArray(customEffect) ? customEffect.join(", ") : customEffect || null,
        customContent: Array.isArray(customContent) ? customContent.join(", ") : customContent || null,
        customSpecialRequest: customSpecialRequest || null,
        // 잔금 및 할인 시스템
        totalAmount,
        depositAmount,
        discountAmount,
        referralDiscount,
        reviewDiscount,
        finalBalance,
        referralCode,
        referredBy: partnerCode || null,
        referredCount: 0,
      },
    });

    // 예약관리(Booking) 동기화 생성 - 항상 생성
    try {
      let defaultProduct = await prisma.product.findFirst({ where: {} });
      if (!defaultProduct) {
        defaultProduct = await prisma.product.create({
          data: { name: "기본 상품", price: 0, description: "자동 생성", isActive: true },
        });
      }
      {
        // 예식일 처리: 없으면 기본값 사용
        let weddingDateObj: Date;
        if (weddingDate) {
          weddingDateObj = new Date(weddingDate);
          if (isNaN(weddingDateObj.getTime())) {
            weddingDateObj = new Date("2099-12-31");
          }
        } else {
          weddingDateObj = new Date("2099-12-31");
        }

        // 전화번호 처리: 해외거주면 이메일, 없으면 플레이스홀더
        let phoneForBooking: string;
        if (isOverseas) {
          phoneForBooking = productEmail || "no-email@placeholder.local";
        } else {
          phoneForBooking = normalizedBridePhone || normalizedGroomPhone || "00000000000";
        }

        const booking = await prisma.booking.create({
          data: {
            customerName: sanitizedAuthor,
            customerPhone: phoneForBooking,
            customerEmail: productEmail || null,
            weddingDate: weddingDateObj,
            weddingVenue: venueName || "미정",
            weddingTime: weddingTime || null,
            productId: defaultProduct.id,
            listPrice: totalAmount || defaultProduct.price,
            depositAmount: depositAmount || 100000,
            eventDiscount: discountAmount || 0,
            referralDiscount: referralDiscount || 0,
            reviewDiscount: reviewDiscount || 0,
            finalBalance: finalBalance || Math.max(0, (totalAmount || defaultProduct.price) - (depositAmount || 100000) - (discountAmount || 0)),
            status: reservation.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
            reservationId: reservation.id,
            referredBy: discountCouple && partnerCode ? partnerCode : null,
          },
        });

        // Reservation에 bookingId 연결
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { bookingId: booking.id },
        });
      }
    } catch (syncError) {
      console.error('예약관리 동기화 생성 오류 (계속 진행):', syncError);
      // 동기화 실패해도 Reservation 생성은 성공으로 처리
    }

    return NextResponse.json(
      { message: "예약 문의가 등록되었습니다.", id: reservation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "예약 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
