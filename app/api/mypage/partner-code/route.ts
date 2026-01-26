/**
 * 마이페이지 - 내 짝꿍 코드 API
 * GET /api/mypage/partner-code
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

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
        discountCouple: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 짝궁할인을 체크하지 않았으면 짝궁코드 표시하지 않음
    if (!reservation.discountCouple) {
      return NextResponse.json({
        partnerCode: null,
        message: '짝궁할인을 신청하시면 짝꿍 코드가 생성됩니다.',
        status: reservation.status,
        referrals: [],
        referralCount: 0,
        totalReferralDiscount: 0,
      });
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
      referrals: referrals.map((r) => {
        // 개인정보 복호화 후 마스킹
        const decryptedAuthor = decrypt(r.author) || '';
        
        // 이름 마스킹 로직 개선
        let maskedName: string;
        if (decryptedAuthor.length <= 1) {
          maskedName = '*';
        } else if (decryptedAuthor.length === 2) {
          // 2글자: 첫 글자 + '*'
          maskedName = decryptedAuthor[0] + '*';
        } else if (decryptedAuthor.length === 3) {
          // 3글자: 첫 글자 + '*' + 마지막 글자
          maskedName = decryptedAuthor[0] + '*' + decryptedAuthor[2];
        } else {
          // 4글자 이상: 첫 글자 + '**' + 마지막 글자
          maskedName = decryptedAuthor[0] + '**' + decryptedAuthor[decryptedAuthor.length - 1];
        }
        
        return {
          id: r.id,
          customerName: maskedName,
          weddingDate: r.weddingDate,
          createdAt: r.createdAt,
        };
      }),
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
