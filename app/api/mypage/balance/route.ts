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
      select: {
        id: true,
        productType: true,
        totalAmount: true,
        depositAmount: true,
        depositPaidAt: true,
        balancePaidAt: true,
        discountNewYear: true,
        discountReviewBlog: true,
        referralDiscount: true,
        reviewDiscount: true,
        referredBy: true,
        mainSnapCompany: true,
        makeupShoot: true,
        paebaekShoot: true,
        receptionShoot: true,
      },
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

    // 르메그라피 제휴 할인 (메인스냅이 르메그라피이고 기본형/시네마틱형인 경우) - 신년할인과 동시 적용 불가
    const mainSnapCompany = reservation.mainSnapCompany || '';
    const isLemeGraphy = mainSnapCompany.toLowerCase().includes('르메그라피') || mainSnapCompany.toLowerCase().includes('leme');
    const lemeProduct = reservation.productType === '기본형' || reservation.productType === '시네마틱형';

    // 신년 할인 (가성비형 X, 르메그라피 제휴 할인 적용 시에는 적용 불가)
    const canApplyNewYear = reservation.discountNewYear
      && reservation.productType !== '가성비형'
      && !(isLemeGraphy && lemeProduct);
    if (canApplyNewYear) {
      const newYearDiscount = 50000;
      discounts.push({
        type: 'event',
        label: '2026 신년 할인',
        amount: newYearDiscount,
        amountFormatted: formatKRW(newYearDiscount),
      });
      totalDiscount += newYearDiscount;
    }

    if (isLemeGraphy && lemeProduct) {
      const lemeGraphyDiscount = 150000;
      discounts.push({
        type: 'event',
        label: '르메그라피 제휴 할인',
        amount: lemeGraphyDiscount,
        amountFormatted: formatKRW(lemeGraphyDiscount),
      });
      totalDiscount += lemeGraphyDiscount;
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

    // 후기 할인 (가성비형이 아니고 reviewDiscount가 있는 경우만)
    if (reservation.reviewDiscount && reservation.reviewDiscount > 0 && reservation.productType !== '가성비형') {
      discounts.push({
        type: 'review',
        label: '후기 할인',
        amount: reservation.reviewDiscount,
        amountFormatted: formatKRW(reservation.reviewDiscount),
      });
      totalDiscount += reservation.reviewDiscount;
    }

    // 추가 옵션 금액 계산
    const additionalOptions = [];
    let additionalTotal = 0;
    
    if (reservation.makeupShoot) {
      const makeupPrice = 200000;
      additionalOptions.push({
        type: 'makeup',
        label: '메이크업 촬영',
        amount: makeupPrice,
        amountFormatted: formatKRW(makeupPrice),
      });
      additionalTotal += makeupPrice;
    }
    
    if (reservation.paebaekShoot) {
      const paebaekPrice = 50000;
      additionalOptions.push({
        type: 'paebaek',
        label: '폐백 촬영',
        amount: paebaekPrice,
        amountFormatted: formatKRW(paebaekPrice),
      });
      additionalTotal += paebaekPrice;
    }
    
    if (reservation.receptionShoot) {
      const receptionPrice = 50000;
      additionalOptions.push({
        type: 'reception',
        label: '피로연(2부 예식) 촬영',
        amount: receptionPrice,
        amountFormatted: formatKRW(receptionPrice),
      });
      additionalTotal += receptionPrice;
    }

    // 기본 상품 가격 계산
    const getProductBasePrice = (productType: string | null): number => {
      switch (productType) {
        case '가성비형': return 340000;
        case '기본형': return 600000;
        case '시네마틱형': return 950000;
        default: return 0;
      }
    };
    
    const basePrice = getProductBasePrice(reservation.productType);
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
        additionalOptions,
        additionalTotal,
        additionalTotalFormatted: formatKRW(additionalTotal),
        product: {
          name: reservation.productType || '미선택',
          basePrice: basePrice,
          basePriceFormatted: formatKRW(basePrice),
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
