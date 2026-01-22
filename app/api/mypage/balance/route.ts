/**
 * 마이페이지 - 잔금 상세 API
 * GET /api/mypage/balance
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { calculateBalance, formatKRW } from '@/lib/pricing';

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: session.bookingId },
      include: {
        product: true,
        discountEvent: true,
        reviewSubmissions: {
          where: {
            status: {
              in: ['AUTO_APPROVED', 'APPROVED'],
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 승인된 후기 수
    const approvedReviewCount = booking.reviewSubmissions.length;

    // 잔금 계산
    const calculation = calculateBalance(booking.listPrice, {
      depositAmount: booking.depositAmount,
      eventDiscount: booking.eventDiscount,
      hasReferral: booking.referralDiscount > 0,
      approvedReviewCount,
    });

    // 할인 내역
    const discounts = [];

    if (booking.eventDiscount > 0 && booking.discountEvent) {
      discounts.push({
        type: 'event',
        label: booking.discountEvent.name,
        amount: booking.eventDiscount,
        amountFormatted: formatKRW(booking.eventDiscount),
      });
    }

    if (booking.referralDiscount > 0) {
      discounts.push({
        type: 'referral',
        label: '짝꿍 할인',
        amount: booking.referralDiscount,
        amountFormatted: formatKRW(booking.referralDiscount),
        referredBy: booking.referredBy,
      });
    }

    if (calculation.reviewDiscount > 0) {
      discounts.push({
        type: 'review',
        label: `후기 할인 (${approvedReviewCount}건)`,
        amount: calculation.reviewDiscount,
        amountFormatted: formatKRW(calculation.reviewDiscount),
      });
    }

    return NextResponse.json({
      balance: {
        listPrice: booking.listPrice,
        listPriceFormatted: formatKRW(booking.listPrice),
        depositAmount: booking.depositAmount,
        depositAmountFormatted: formatKRW(booking.depositAmount),
        depositPaidAt: booking.depositPaidAt,
        totalDiscount: calculation.totalDiscount,
        totalDiscountFormatted: formatKRW(calculation.totalDiscount),
        finalBalance: calculation.finalBalance,
        finalBalanceFormatted: formatKRW(calculation.finalBalance),
        balancePaidAt: booking.balancePaidAt,
        discounts,
        product: {
          name: booking.product.name,
          originalPrice: booking.product.price,
          originalPriceFormatted: formatKRW(booking.product.price),
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
