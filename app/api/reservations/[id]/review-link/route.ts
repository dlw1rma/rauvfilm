import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { safeParseInt, normalizePhone, sanitizeString, isValidUrl } from "@/lib/validation";
import { verifyReview } from "@/lib/reviewVerification";
import { decrypt } from "@/lib/encryption";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 후기 링크 업데이트 API
 * PATCH /api/reservations/[id]/review-link
 * Body: { password: "xxx", reviewLink: "https://..." }
 * 또는 Body: { name: "xxx", phone: "xxx", reviewLink: "https://..." }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { password, name, phone, reviewLink } = body;

    if (!reviewLink || typeof reviewLink !== 'string') {
      return NextResponse.json(
        { error: "후기 링크를 입력해주세요." },
        { status: 400 }
      );
    }

    // URL 검증
    if (!isValidUrl(reviewLink)) {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // URL 길이 제한
    const sanitizedReviewLink = sanitizeString(reviewLink, 2000);
    if (sanitizedReviewLink.length < 10) {
      return NextResponse.json(
        { error: "후기 링크가 너무 짧습니다." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 보안: 비밀번호 또는 이름+전화번호로 인증
    let isAuthenticated = false;

    if (password) {
      const isPasswordValid = await bcrypt.compare(
        password,
        reservation.password
      );
      isAuthenticated = isPasswordValid;
    } else if (name && phone) {
      // 이름과 전화번호로 인증
      const sanitizedName = sanitizeString(name, 50);
      const normalizedPhone = normalizePhone(phone);
      if (normalizedPhone.length < 10) {
        isAuthenticated = false;
      } else {
        // 개인정보 복호화 후 비교
        const decryptedAuthor = decrypt(reservation.author);
        const decryptedBrideName = decrypt(reservation.brideName);
        const decryptedGroomName = decrypt(reservation.groomName);
        const decryptedBridePhone = decrypt(reservation.bridePhone);
        const decryptedGroomPhone = decrypt(reservation.groomPhone);
        
        isAuthenticated =
          (decryptedAuthor === sanitizedName ||
            decryptedBrideName === sanitizedName ||
            decryptedGroomName === sanitizedName) &&
          (decryptedBridePhone?.replace(/[^0-9]/g, "") === normalizedPhone ||
            decryptedGroomPhone?.replace(/[^0-9]/g, "") === normalizedPhone);
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "인증이 필요합니다. 비밀번호 또는 이름+전화번호를 입력해주세요." },
        { status: 401 }
      );
    }

    // 중복 링크 체크: 다른 예약에서 이미 사용된 링크인지 확인
    const existingReview = await prisma.reservation.findFirst({
      where: {
        reviewLink: sanitizedReviewLink,
        id: { not: reservationId }, // 현재 예약 제외
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "이미 다른 예약에서 사용된 후기 링크입니다." },
        { status: 400 }
      );
    }

    // 후기 할인 적용 (1만원)
    const reviewDiscount = 10000;
    const totalAmount = reservation.totalAmount || 0;
    const depositAmount = reservation.depositAmount || 100000;
    const referralDiscount = reservation.referralDiscount || 0;
    const currentDiscountAmount = reservation.discountAmount || 0;
    
    // 기존 후기 할인이 없었다면 추가
    const newDiscountAmount = reservation.reviewDiscount 
      ? currentDiscountAmount 
      : currentDiscountAmount + reviewDiscount;

    // 최종 잔금 재계산
    const finalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

    // 후기 링크 업데이트 및 할인 적용
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        reviewLink: sanitizedReviewLink,
        reviewDiscount: reviewDiscount,
        discountAmount: newDiscountAmount,
        finalBalance: finalBalance,
      },
    });

    return NextResponse.json({
      message: "후기 링크가 업데이트되었고 할인이 적용되었습니다.",
      balance: {
        totalAmount: updated.totalAmount,
        depositAmount: updated.depositAmount,
        referralDiscount: updated.referralDiscount,
        reviewDiscount: updated.reviewDiscount,
        discountAmount: updated.discountAmount,
        finalBalance: updated.finalBalance,
      },
    });
  } catch (error) {
    console.error("Error updating review link:", error);
    return NextResponse.json(
      { error: "후기 링크 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}
