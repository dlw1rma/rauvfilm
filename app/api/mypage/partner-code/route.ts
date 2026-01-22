/**
 * 마이페이지 - 내 짝꿍 코드 API
 * GET /api/mypage/partner-code
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { getReferrals } from '@/lib/partnerCode';

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
      select: {
        id: true,
        partnerCode: true,
        status: true,
        referralDiscount: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 짝꿍 코드가 아직 생성되지 않은 경우 (예약 확정 전)
    if (!booking.partnerCode) {
      return NextResponse.json({
        partnerCode: null,
        message: '예약이 확정되면 짝꿍 코드가 생성됩니다.',
        status: booking.status,
        referrals: [],
        totalReferralDiscount: 0,
      });
    }

    // 이 코드로 추천한 고객 목록
    const referrals = await getReferrals(booking.partnerCode);

    return NextResponse.json({
      partnerCode: booking.partnerCode,
      message: '아래 코드를 친구에게 공유하시면 양쪽 모두 1만원 할인!',
      status: booking.status,
      referrals: referrals.map((r) => ({
        id: r.id,
        // 이름 마스킹 (홍*동)
        customerName: r.customerName.length > 2
          ? r.customerName[0] + '*' + r.customerName.slice(2)
          : r.customerName[0] + '*',
        weddingDate: r.weddingDate,
        createdAt: r.createdAt,
      })),
      referralCount: referrals.length,
      totalReferralDiscount: booking.referralDiscount,
    });
  } catch (error) {
    console.error('짝꿍 코드 조회 오류:', error);
    return NextResponse.json(
      { error: '짝꿍 코드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
