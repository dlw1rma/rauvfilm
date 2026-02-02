import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: 특별 할인 금액 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { specialDiscount } = body;

    // 특별 할인 금액 검증
    const discountAmount = safeParseInt(specialDiscount, 0, 0, 10000000);
    if (discountAmount < 0) {
      return NextResponse.json(
        { error: "할인 금액은 0원 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 예약 존재 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기존 할인 금액 계산
    const eventDiscount = reservation.discountNewYear && reservation.productType !== '가성비형' ? 50000 : 0;
    const referralDiscount = reservation.referralDiscount || 0;
    const reviewDiscount = reservation.reviewDiscount || 0;
    // 르메그라피 제휴 할인 확인
    const mainSnapCompany = reservation.mainSnapCompany || '';
    const isLemeGraphy = mainSnapCompany.toLowerCase().includes('르메그라피') || mainSnapCompany.toLowerCase().includes('leme');
    const lemeGraphyDiscount = isLemeGraphy && (reservation.productType === '기본형' || reservation.productType === '시네마틱형') ? 150000 : 0;
    
    // 특별 할인을 포함한 총 할인 금액
    const newDiscountAmount = eventDiscount + referralDiscount + reviewDiscount + lemeGraphyDiscount + discountAmount;
    
    // 최종 잔금 재계산
    const totalAmount = reservation.totalAmount || 0;
    const depositAmount = reservation.depositAmount || 100000;
    const newFinalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

    // 할인 금액 및 최종 잔금 업데이트
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        discountAmount: newDiscountAmount,
        finalBalance: newFinalBalance,
      },
    });

    return NextResponse.json({
      success: true,
      discountAmount: updated.discountAmount,
      finalBalance: updated.finalBalance,
    });
  } catch (error) {
    console.error("Error updating special discount:", error);
    return NextResponse.json(
      { error: "특별 할인 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
