/**
 * 관리자 - 예약 일괄 상태 변경 API
 * PUT /api/admin/bookings/bulk-action
 * Body: { bookingIds: number[], status: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/api';

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'DEPOSIT_COMPLETED', 'DELIVERED', 'CANCELLED'];

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingIds, status } = body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: '변경할 예약을 선택해주세요.' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const id of bookingIds) {
      try {
        const booking = await prisma.booking.findUnique({
          where: { id: Number(id) },
          select: { id: true, reservationId: true },
        });

        if (!booking) {
          failCount++;
          continue;
        }

        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: status as 'PENDING' | 'CONFIRMED' | 'DEPOSIT_COMPLETED' | 'DELIVERED' | 'CANCELLED' },
        });

        // 연결된 Reservation 상태 동기화
        if (booking.reservationId) {
          try {
            const reservationStatus = status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED';
            await prisma.reservation.update({
              where: { id: booking.reservationId },
              data: { status: reservationStatus },
            });
          } catch {
            // 동기화 실패해도 계속 진행
          }
        }

        successCount++;
      } catch {
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failCount,
      total: bookingIds.length,
    });
  } catch (error) {
    console.error('일괄 상태 변경 오류:', error);
    return NextResponse.json(
      { error: '일괄 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
