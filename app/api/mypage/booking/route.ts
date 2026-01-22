/**
 * 마이페이지 - 내 예약 정보 API
 * GET /api/mypage/booking
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

    const booking = await prisma.booking.findUnique({
      where: { id: session.bookingId },
      include: {
        product: true,
        discountEvent: true,
        reviewSubmissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 예약 상태 한글 변환
    const statusLabels: Record<string, string> = {
      PENDING: '예약 대기',
      CONFIRMED: '예약 확정',
      DEPOSIT_PAID: '예약금 입금 완료',
      COMPLETED: '촬영 완료',
      DELIVERED: '영상 전달 완료',
      CANCELLED: '취소됨',
    };

    return NextResponse.json({
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        weddingDate: booking.weddingDate,
        weddingVenue: booking.weddingVenue,
        weddingTime: booking.weddingTime,
        status: booking.status,
        statusLabel: statusLabels[booking.status] || booking.status,
        partnerCode: booking.partnerCode,
        videoUrl: booking.videoUrl,
        contractUrl: booking.contractUrl,
        createdAt: booking.createdAt,
        product: {
          id: booking.product.id,
          name: booking.product.name,
          price: booking.product.price,
        },
        discountEvent: booking.discountEvent
          ? {
              id: booking.discountEvent.id,
              name: booking.discountEvent.name,
              amount: booking.discountEvent.amount,
            }
          : null,
        reviewSubmissions: booking.reviewSubmissions.map((r) => ({
          id: r.id,
          reviewUrl: r.reviewUrl,
          platform: r.platform,
          status: r.status,
          createdAt: r.createdAt,
        })),
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
