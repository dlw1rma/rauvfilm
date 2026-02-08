/**
 * 일회성 마이그레이션: 기존 Booking의 eventDiscount에서 신년할인을 분리
 * POST /api/admin/migrate-discounts
 *
 * 기존 Booking에서:
 * - 연결된 Reservation이 discountNewYear=true인 경우
 * - eventDiscount에서 50000을 빼고 newYearDiscount에 50000 저장
 * - 잔금 재계산
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/api';

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    // newYearDiscount가 0이고 연결된 예약글이 discountNewYear=true인 Booking들
    const bookings = await prisma.booking.findMany({
      where: {
        newYearDiscount: 0,
        reservationId: { not: null },
      },
      include: {
        product: true,
      },
    });

    let updated = 0;
    const results: Array<{ id: number; action: string }> = [];

    for (const booking of bookings) {
      if (!booking.reservationId) continue;

      const reservation = await prisma.reservation.findUnique({
        where: { id: booking.reservationId },
        select: {
          discountNewYear: true,
          discountCouple: true,
          referralDiscount: true,
          reviewDiscount: true,
        },
      });

      if (!reservation) continue;

      // 신년할인 대상인 경우
      if (reservation.discountNewYear) {
        const newYearAmount = 50000;

        // eventDiscount에서 신년할인분 분리
        const newEventDiscount = Math.max(0, booking.eventDiscount - newYearAmount);

        // 잔금 재계산
        const newFinalBalance = Math.max(
          0,
          booking.listPrice + booking.travelFee - booking.depositAmount - newEventDiscount - newYearAmount - booking.referralDiscount - booking.reviewDiscount
        );

        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            eventDiscount: newEventDiscount,
            newYearDiscount: newYearAmount,
            finalBalance: newFinalBalance,
          },
        });

        results.push({
          id: booking.id,
          action: `eventDiscount: ${booking.eventDiscount} → ${newEventDiscount}, newYearDiscount: 0 → ${newYearAmount}, finalBalance: ${booking.finalBalance} → ${newFinalBalance}`,
        });
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      totalChecked: bookings.length,
      updated,
      results,
    });
  } catch (error) {
    console.error('마이그레이션 오류:', error);
    return NextResponse.json(
      { error: '마이그레이션 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
