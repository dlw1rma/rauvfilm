import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';
import { safeParseInt } from '@/lib/validation';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: 특별 할인 금액 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bookingId = safeParseInt(id, 0, 1, 2147483647);
    if (bookingId === 0) {
      return NextResponse.json({ error: '잘못된 예약 ID입니다.' }, { status: 400 });
    }

    const body = await request.json();
    const specialDiscount = safeParseInt(body.specialDiscount, 0, 0, 10000000);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // eventDiscount에 특별할인을 합산 (기존 이벤트 할인 제외한 순수 특별할인만 반영)
    const newEventDiscount = specialDiscount;

    // 잔금 재계산
    const newFinalBalance = Math.max(
      0,
      booking.listPrice - booking.depositAmount - newEventDiscount - booking.referralDiscount - booking.reviewDiscount
    );

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        eventDiscount: newEventDiscount,
        finalBalance: newFinalBalance,
      },
    });

    // 연결된 예약글(Reservation)도 동기화
    if (booking.reservationId) {
      try {
        const reservation = await prisma.reservation.findUnique({
          where: { id: booking.reservationId },
        });
        if (reservation) {
          const referralDiscount = reservation.referralDiscount || 0;
          const reviewDiscount = reservation.reviewDiscount || 0;
          const newDiscountAmount = newEventDiscount + referralDiscount + reviewDiscount;
          const totalAmount = reservation.totalAmount || 0;
          const depositAmount = reservation.depositAmount || 100000;
          const resFinalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

          await prisma.reservation.update({
            where: { id: booking.reservationId },
            data: {
              discountAmount: newDiscountAmount,
              finalBalance: resFinalBalance,
            },
          });
        }
      } catch (syncError) {
        console.error('예약글 동기화 오류 (계속 진행):', syncError);
      }
    }

    return NextResponse.json({
      success: true,
      eventDiscount: updated.eventDiscount,
      finalBalance: updated.finalBalance,
    });
  } catch (error) {
    console.error('특별 할인 업데이트 오류:', error);
    return NextResponse.json(
      { error: '특별 할인 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
