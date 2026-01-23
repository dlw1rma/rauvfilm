/**
 * 마이페이지 - 내 짝꿍 코드 API
 * GET /api/mypage/partner-code
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';

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
        referralCode: true,
        status: true,
        referralDiscount: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 짝꿍 코드가 아직 생성되지 않은 경우 (예약 확정 전)
    if (!reservation.referralCode) {
      return NextResponse.json({
        partnerCode: null,
        message: '예약이 확정되면 짝꿍 코드가 생성됩니다.',
        status: reservation.status,
        referrals: [],
        referralCount: 0,
        totalReferralDiscount: 0,
      });
    }

    // 이 코드로 추천받은 고객 목록 조회
    const referrals = await prisma.reservation.findMany({
      where: { referredBy: reservation.referralCode },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        author: true,
        weddingDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      partnerCode: reservation.referralCode,
      message: '아래 코드를 친구에게 공유하시면 양쪽 모두 1만원 할인!',
      status: reservation.status,
      referrals: referrals.map((r) => ({
        id: r.id,
        // 이름 마스킹 (홍*동)
        customerName: r.author.length > 2
          ? r.author[0] + '*' + r.author.slice(2)
          : r.author[0] + '*',
        weddingDate: r.weddingDate,
        createdAt: r.createdAt,
      })),
      referralCount: referrals.length,
      totalReferralDiscount: reservation.referralDiscount || 0,
    });
  } catch (error) {
    console.error('짝꿍 코드 조회 오류:', error);
    return NextResponse.json(
      { error: '짝꿍 코드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
