import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeParseInt } from '@/lib/validation';
import { isAdminAuthenticated } from '@/lib/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: 짝꿍코드 적용 대상(referredBy) 변경
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
    const referredByRaw = body.referredBy;
    const referredBy =
      referredByRaw === null || referredByRaw === undefined
        ? null
        : String(referredByRaw).trim() || null;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    let newReferralDiscount = 0;

    if (referredBy) {
      // 적용할 코드가 다른 예약의 referralCode인지 확인 (CONFIRMED만)
      const referrer = await prisma.reservation.findFirst({
        where: { referralCode: referredBy, status: 'CONFIRMED' },
        select: { id: true },
      });
      if (!referrer) {
        return NextResponse.json(
          { error: '해당 짝꿍코드를 가진 확정 예약이 없습니다. 코드를 확인해주세요.' },
          { status: 400 }
        );
      }
      newReferralDiscount = 10000;
    }

    // 잔금 재계산
    const newFinalBalance = Math.max(
      0,
      booking.listPrice - booking.depositAmount - booking.eventDiscount - newReferralDiscount - booking.reviewDiscount
    );

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        referredBy,
        referralDiscount: newReferralDiscount,
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
          const currentReferralDiscount = reservation.referralDiscount ?? 0;
          const diff = newReferralDiscount - currentReferralDiscount;
          const newDiscountAmount = (reservation.discountAmount ?? 0) + diff;
          const totalAmount = reservation.totalAmount ?? 0;
          const depositAmount = reservation.depositAmount ?? 100000;
          const resFinalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

          await prisma.reservation.update({
            where: { id: booking.reservationId },
            data: {
              referredBy,
              referralDiscount: newReferralDiscount,
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
      referredBy,
      referralDiscount: newReferralDiscount,
      finalBalance: newFinalBalance,
    });
  } catch (error) {
    console.error('짝꿍코드 적용 대상 변경 오류:', error);
    return NextResponse.json(
      { error: '짝꿍코드 적용 대상 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
