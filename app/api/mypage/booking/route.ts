/**
 * 마이페이지 - 내 예약 정보 API
 * GET /api/mypage/booking
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
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 예약 확정 전이면 접근 제한 (취소된 경우도 허용하여 안내 표시)
    if (reservation.status !== 'CONFIRMED' &&
        reservation.status !== 'DEPOSIT_COMPLETED' &&
        reservation.status !== 'DELIVERED' &&
        reservation.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: '예약이 확정되지 않았습니다.', accessRestricted: true },
        { status: 403 }
      );
    }

    // 예약 상태 한글 변환 (간소화된 3단계)
    const statusLabels: Record<string, string> = {
      CONFIRMED: '예약 확정',
      DEPOSIT_COMPLETED: '입금 완료',
      DELIVERED: '영상 전달 완료',
      CANCELLED: '취소됨',
    };

    // 개인정보 복호화
    const decryptedAuthor = decrypt(reservation.author) || '';

    // 짝궁할인을 체크하지 않았으면 짝궁코드 표시하지 않음
    const partnerCode = reservation.discountCouple ? reservation.referralCode : null;

    return NextResponse.json({
      booking: {
        id: reservation.id,
        customerName: decryptedAuthor,
        weddingDate: reservation.weddingDate,
        weddingVenue: reservation.venueName,
        weddingTime: reservation.weddingTime,
        status: reservation.status,
        statusLabel: statusLabels[reservation.status || 'CONFIRMED'] || '예약 확정',
        partnerCode: partnerCode,
        discountCouple: reservation.discountCouple,
        videoUrl: reservation.videoUrl,
        contractUrl: reservation.pdfUrl, // PDF를 contractUrl로 사용
        createdAt: reservation.createdAt,
        product: {
          id: null,
          name: reservation.productType || '미선택',
          price: reservation.totalAmount || 0,
        },
        discountEvent: reservation.discountNewYear ? {
          id: 1,
          name: '2026 신년 할인',
          amount: 50000,
        } : null,
      },
    });
  } catch (error) {
    console.error('예약 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '예약 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
