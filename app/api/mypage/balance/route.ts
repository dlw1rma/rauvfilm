/**
 * 마이페이지 - 잔금 상세 API
 * GET /api/mypage/balance
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';

// 금액 포맷팅 함수
function formatKRW(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 할인 내역 계산
    const discounts = [];
    let totalDiscount = 0;

    // 신년 할인
    if (reservation.discountNewYear) {
      const newYearDiscount = 50000;
      discounts.push({
        type: 'event',
        label: '2026 신년 할인',
        amount: newYearDiscount,
        amountFormatted: formatKRW(newYearDiscount),
      });
      totalDiscount += newYearDiscount;
    }

    // 짝꿍 할인
    if (reservation.referralDiscount && reservation.referralDiscount > 0) {
      discounts.push({
        type: 'referral',
        label: '짝꿍 할인',
        amount: reservation.referralDiscount,
        amountFormatted: formatKRW(reservation.referralDiscount),
        referredBy: reservation.referredBy,
      });
      totalDiscount += reservation.referralDiscount;
    }

    // 후기 할인
    if (reservation.reviewDiscount && reservation.reviewDiscount > 0) {
      discounts.push({
        type: 'review',
        label: '후기 할인',
        amount: reservation.reviewDiscount,
        amountFormatted: formatKRW(reservation.reviewDiscount),
      });
      totalDiscount += reservation.reviewDiscount;
    }

    const listPrice = reservation.totalAmount || 0;
    const depositAmount = reservation.depositAmount || 100000;
    const finalBalance = Math.max(0, listPrice - depositAmount - totalDiscount);

    return NextResponse.json({
      balance: {
        listPrice: listPrice,
        listPriceFormatted: formatKRW(listPrice),
        depositAmount: depositAmount,
        depositAmountFormatted: formatKRW(depositAmount),
        depositPaidAt: reservation.depositPaidAt,
        totalDiscount: totalDiscount,
        totalDiscountFormatted: formatKRW(totalDiscount),
        finalBalance: finalBalance,
        finalBalanceFormatted: formatKRW(finalBalance),
        balancePaidAt: reservation.balancePaidAt,
        discounts,
        product: {
          name: reservation.productType || '미선택',
          originalPrice: listPrice,
          originalPriceFormatted: formatKRW(listPrice),
        },
      },
    });
  } catch (error) {
    console.error('잔금 조회 오류:', error);
    return NextResponse.json(
      { error: '잔금 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
