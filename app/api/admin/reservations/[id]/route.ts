import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt } from "@/lib/validation";
import { decrypt, encrypt } from "@/lib/encryption";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 관리자용 예약 상세 조회 (모든 필드 포함)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 인증 확인
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

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

    return NextResponse.json(decryptedReservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "예약 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 관리자용 예약 수정 (비밀번호/소유권 불필요)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const normalizePhoneNumber = (phone: string | null | undefined): string | null => {
      if (!phone) return null;
      return phone.replace(/[^0-9]/g, "");
    };

    const getProductBasePrice = (productType: string | null): number => {
      switch (productType) {
        case "가성비형":
          return 340000;
        case "기본형":
          return 600000;
        case "시네마틱형":
          return 950000;
        case "야외스냅":
        case "프리웨딩":
        default:
          return 0;
      }
    };

    const calculateAdditionalOptions = (options: {
      makeupShoot?: boolean;
      paebaekShoot?: boolean;
      receptionShoot?: boolean;
    }): number => {
      let additionalPrice = 0;
      if (options.makeupShoot) additionalPrice += 200000;
      if (options.paebaekShoot) additionalPrice += 50000;
      if (options.receptionShoot) additionalPrice += 50000;
      return additionalPrice;
    };

    const newProductType =
      body.productType !== undefined && body.productType !== null && body.productType !== ""
        ? body.productType
        : reservation.productType;
    const productChanged = newProductType !== reservation.productType;
    const optionsChanged =
      (body.makeupShoot !== undefined && body.makeupShoot !== reservation.makeupShoot) ||
      (body.paebaekShoot !== undefined && body.paebaekShoot !== reservation.paebaekShoot) ||
      (body.receptionShoot !== undefined && body.receptionShoot !== reservation.receptionShoot);

    if (productChanged && newProductType === "가성비형") {
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

    const updateData: Record<string, unknown> = {
      title: body.title,
      content: body.content || null,
      author: body.author != null ? encrypt(String(body.author)) : reservation.author,
      brideName: body.brideName != null ? encrypt(String(body.brideName)) : reservation.brideName,
      bridePhone: body.bridePhone != null ? encrypt(normalizePhoneNumber(String(body.bridePhone)) || "") : reservation.bridePhone,
      groomName: body.groomName != null ? encrypt(String(body.groomName)) : reservation.groomName,
      groomPhone: body.groomPhone != null ? encrypt(normalizePhoneNumber(String(body.groomPhone)) || "") : reservation.groomPhone,
      receiptPhone: body.receiptPhone != null ? encrypt(normalizePhoneNumber(String(body.receiptPhone)) || "") : reservation.receiptPhone,
      depositName: body.depositName || null,
      productEmail: body.productEmail != null ? encrypt(String(body.productEmail)) : reservation.productEmail,
      productType: body.productType !== undefined ? body.productType : reservation.productType,
      foundPath: body.foundPath || null,
      weddingDate: body.weddingDate || null,
      weddingTime: body.weddingTime || null,
      venueName: body.venueName || null,
      venueFloor: body.venueFloor || null,
      guestCount: body.guestCount != null ? parseInt(String(body.guestCount), 10) : null,
      makeupShoot: body.makeupShoot ?? reservation.makeupShoot,
      paebaekShoot: body.paebaekShoot ?? reservation.paebaekShoot,
      receptionShoot: body.receptionShoot ?? reservation.receptionShoot,
      mainSnapCompany: body.mainSnapCompany || null,
      makeupShop: body.makeupShop || null,
      dressShop: body.dressShop || null,
      deliveryAddress: body.deliveryAddress != null ? encrypt(String(body.deliveryAddress)) : reservation.deliveryAddress,
      usbOption: body.usbOption ?? reservation.usbOption,
      seonwonpan: body.seonwonpan ?? reservation.seonwonpan,
      gimbalShoot: body.gimbalShoot ?? reservation.gimbalShoot,
      playbackDevice: body.playbackDevice != null ? (Array.isArray(body.playbackDevice) ? body.playbackDevice.join(", ") : String(body.playbackDevice)) : reservation.playbackDevice,
      eventType: body.eventType || null,
      shootLocation: body.shootLocation || null,
      shootDate: body.shootDate || null,
      shootTime: body.shootTime || null,
      shootConcept: body.shootConcept || null,
      discountCouple: body.discountCouple ?? reservation.discountCouple,
      discountReview: body.discountReview ?? reservation.discountReview,
      discountNewYear: newProductType === "가성비형" ? false : (body.discountNewYear !== undefined ? body.discountNewYear : reservation.discountNewYear ?? true),
      discountReviewBlog: newProductType === "가성비형" ? false : (body.discountReviewBlog ?? reservation.discountReviewBlog ?? false),
      specialNotes: body.specialNotes || null,
      customShootingRequest: body.customShootingRequest ?? reservation.customShootingRequest,
      customStyle: body.customStyle != null ? (Array.isArray(body.customStyle) ? body.customStyle.join(", ") : String(body.customStyle)) : reservation.customStyle,
      customEditStyle: body.customEditStyle != null ? (Array.isArray(body.customEditStyle) ? body.customEditStyle.join(", ") : String(body.customEditStyle)) : reservation.customEditStyle,
      customMusic: body.customMusic != null ? (Array.isArray(body.customMusic) ? body.customMusic.join(", ") : String(body.customMusic)) : reservation.customMusic,
      customLength: body.customLength != null ? (Array.isArray(body.customLength) ? body.customLength.join(", ") : String(body.customLength)) : reservation.customLength,
      customEffect: body.customEffect != null ? (Array.isArray(body.customEffect) ? body.customEffect.join(", ") : String(body.customEffect)) : reservation.customEffect,
      customContent: body.customContent != null ? (Array.isArray(body.customContent) ? body.customContent.join(", ") : String(body.customContent)) : reservation.customContent,
      customSpecialRequest: body.customSpecialRequest || null,
      totalAmount: newTotalAmount,
    };

    const discountOptionsChanged =
      (body.discountNewYear !== undefined && body.discountNewYear !== reservation.discountNewYear) ||
      (body.discountReviewBlog !== undefined && body.discountReviewBlog !== reservation.discountReviewBlog) ||
      (body.mainSnapCompany !== undefined && body.mainSnapCompany !== reservation.mainSnapCompany);

    if (productChanged || optionsChanged || discountOptionsChanged) {
      const depositAmount = reservation.depositAmount || 100000;
      let discountAmount = 0;

      const finalDiscountNewYear = newProductType === "가성비형" ? false : (body.discountNewYear !== undefined ? body.discountNewYear : reservation.discountNewYear);
      if (finalDiscountNewYear) {
        discountAmount += 50000;
      }

      const mainSnapCompany = body.mainSnapCompany !== undefined ? body.mainSnapCompany : reservation.mainSnapCompany || "";
      const isLemeGraphy = mainSnapCompany.toLowerCase().includes("르메그라피") || mainSnapCompany.toLowerCase().includes("leme");
      if (isLemeGraphy && (newProductType === "기본형" || newProductType === "시네마틱형")) {
        discountAmount += 150000;
      }

      (updateData as Record<string, number>).discountAmount = discountAmount;
      const referralDiscount = reservation.referralDiscount || 0;
      const reviewDiscount = reservation.reviewDiscount || 0;
      (updateData as Record<string, number>).finalBalance = Math.max(
        0,
        newTotalAmount - depositAmount - discountAmount - referralDiscount - reviewDiscount
      );
    }

    if (body.discountCouple) {
      if (reservation.partnerCode) {
        (updateData as Record<string, string | null>).partnerCode = reservation.partnerCode;
      } else if (body.partnerCode) {
        (updateData as Record<string, string | null>).partnerCode = body.partnerCode;
      } else if (!reservation.referralCode) {
        const decryptedAuthor = decrypt(reservation.author) || "";
        if (reservation.weddingDate && decryptedAuthor) {
          try {
            let dateStr: string;
            if (typeof reservation.weddingDate === "string") {
              dateStr = reservation.weddingDate.replace(/-/g, "").substring(0, 8);
              if (dateStr.length !== 8) {
                const date = new Date(reservation.weddingDate);
                if (!isNaN(date.getTime())) {
                  dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
                } else {
                  dateStr = "";
                }
              }
            } else {
              dateStr = "";
            }
            if (dateStr) {
              const yy = dateStr.slice(2, 4);
              const mmdd = dateStr.slice(4, 8);
              const cleanName = decryptedAuthor.replace(/\s/g, "");
              (updateData as Record<string, string>).referralCode = `${yy}${mmdd} ${cleanName}`;
            }
          } catch (e) {
            console.error("Error generating referralCode:", e);
          }
        }
      }
    } else {
      (updateData as Record<string, null>).partnerCode = null;
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData as Parameters<typeof prisma.reservation.update>[0]["data"],
    });

    return NextResponse.json({
      success: true,
      message: "예약이 수정되었습니다.",
    });
  } catch (error) {
    console.error("Admin reservation update error:", error);
    return NextResponse.json(
      { error: "예약 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
