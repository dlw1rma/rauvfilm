import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 잔금 확인 API
 * GET /api/reservations/[id]/balance?password=xxx
 * 또는 GET /api/reservations/[id]/balance?name=xxx&phone=xxx (보안 강화)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reservationId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const passwordParam = searchParams.get("password");
    const nameParam = searchParams.get("name");
    const phoneParam = searchParams.get("phone");

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

    if (passwordParam) {
      const isPasswordValid = await bcrypt.compare(
        passwordParam,
        reservation.password
      );
      isAuthenticated = isPasswordValid;
    } else if (nameParam && phoneParam) {
      // 이름과 전화번호로 인증 (신부/신랑 전화번호 중 하나라도 일치하면 OK)
      const normalizedPhone = phoneParam.replace(/[^0-9]/g, "");
      isAuthenticated =
        (reservation.author === nameParam ||
          reservation.brideName === nameParam ||
          reservation.groomName === nameParam) &&
        (reservation.bridePhone?.replace(/[^0-9]/g, "") === normalizedPhone ||
          reservation.groomPhone?.replace(/[^0-9]/g, "") === normalizedPhone);
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "인증이 필요합니다. 비밀번호 또는 이름+전화번호를 입력해주세요." },
        { status: 401 }
      );
    }

    // 잔금 계산 (후기 링크가 있으면 추가 할인 적용)
    let reviewDiscount = reservation.reviewDiscount || 0;
    if (reservation.reviewLink && reviewDiscount === 0) {
      // 후기 링크가 있지만 할인이 아직 적용되지 않은 경우
      reviewDiscount = 10000; // 1만원 할인
    }

    const totalAmount = reservation.totalAmount || 0;
    const depositAmount = reservation.depositAmount || 100000;
    const referralDiscount = reservation.referralDiscount || 0;
    const discountAmount = referralDiscount + reviewDiscount;

    // 최종 잔금 = 정가 - 예약금 - 할인들
    const finalBalance = Math.max(0, totalAmount - depositAmount - discountAmount);

    // 후기 링크가 없으면 할인 적용
    if (reservation.reviewLink && reviewDiscount > 0 && reservation.reviewDiscount === 0) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          reviewDiscount: reviewDiscount,
          discountAmount: { increment: reviewDiscount },
          finalBalance: finalBalance,
        },
      });
    }

    return NextResponse.json({
      balance: {
        totalAmount,
        depositAmount,
        referralDiscount,
        reviewDiscount: reservation.reviewLink ? reviewDiscount : 0,
        discountAmount,
        finalBalance,
        referralCode: reservation.referralCode,
        referredCount: reservation.referredCount || 0,
        reviewLink: reservation.reviewLink,
        depositPaidAt: reservation.depositPaidAt,
        balancePaidAt: reservation.balancePaidAt,
      },
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "잔금 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
