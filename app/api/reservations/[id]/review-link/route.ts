import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    const { id } = await params;
    const reservationId = parseInt(id);
    const body = await request.json();
    const { password, name, phone, reviewLink } = body;

    if (!reviewLink) {
      return NextResponse.json(
        { error: "후기 링크를 입력해주세요." },
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
      const normalizedPhone = phone.replace(/[^0-9]/g, "");
      isAuthenticated =
        (reservation.author === name ||
          reservation.brideName === name ||
          reservation.groomName === name) &&
        (reservation.bridePhone?.replace(/[^0-9]/g, "") === normalizedPhone ||
          reservation.groomPhone?.replace(/[^0-9]/g, "") === normalizedPhone);
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "인증이 필요합니다. 비밀번호 또는 이름+전화번호를 입력해주세요." },
        { status: 401 }
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
        reviewLink: reviewLink,
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
