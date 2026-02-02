import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT: 관리자가 예약 고객의 짝꿍코드 적용 대상(referredBy) 변경
 * body: { referredBy: string | null }
 * - referredBy: 적용할 짝꿍 코드 (다른 고객의 referralCode). null/빈문자면 적용 해제.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResponse = await requireAdminAuth(request);
    if (authResponse) return authResponse;

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json({ error: "잘못된 예약 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const referredByRaw = body.referredBy;
    const referredBy =
      referredByRaw === null || referredByRaw === undefined
        ? null
        : String(referredByRaw).trim() || null;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
    }

    let newReferralDiscount = 0;

    if (referredBy) {
      // 적용할 코드가 다른 예약의 referralCode인지 확인 (CONFIRMED만)
      const referrer = await prisma.reservation.findFirst({
        where: { referralCode: referredBy, status: "CONFIRMED" },
        select: { id: true },
      });
      if (!referrer) {
        return NextResponse.json(
          { error: "해당 짝꿍코드를 가진 확정 예약이 없습니다. 코드를 확인해주세요." },
          { status: 400 }
        );
      }
      // 자기 자신의 코드는 적용 불가
      if (referrer.id === reservationId) {
        return NextResponse.json(
          { error: "본인 짝꿍코드는 적용할 수 없습니다." },
          { status: 400 }
        );
      }
      newReferralDiscount = 10000;
    }

    const currentReferralDiscount = reservation.referralDiscount ?? 0;
    const diff = newReferralDiscount - currentReferralDiscount;

    const newDiscountAmount = (reservation.discountAmount ?? 0) + diff;
    const totalAmount = reservation.totalAmount ?? 0;
    const depositAmount = reservation.depositAmount ?? 100000;
    const newFinalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        referredBy,
        referralDiscount: newReferralDiscount,
        discountAmount: newDiscountAmount,
        finalBalance: newFinalBalance,
      },
    });

    return NextResponse.json({
      success: true,
      referredBy,
      referralDiscount: newReferralDiscount,
      discountAmount: newDiscountAmount,
      finalBalance: newFinalBalance,
    });
  } catch (error) {
    console.error("Error updating referral:", error);
    return NextResponse.json(
      { error: "짝꿍코드 적용 대상 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
