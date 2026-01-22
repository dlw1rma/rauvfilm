/**
 * 관리자 - 예약 확정 API
 * PUT /api/admin/bookings/[id]/confirm
 *
 * 예약을 확정하고 짝꿍 코드를 생성합니다.
 * 추천인 코드가 있는 경우 양방향 할인을 적용합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { generatePartnerCode, applyReferralDiscount } from '@/lib/partnerCode';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return !!adminSession?.value;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: '대기 상태의 예약만 확정할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 짝꿍 코드 생성
    const partnerCode = generatePartnerCode(booking.weddingDate, booking.customerName);

    // 중복 확인 (동일 코드가 있으면 숫자 추가)
    let finalCode = partnerCode;
    let suffix = 1;
    while (await prisma.booking.findUnique({ where: { partnerCode: finalCode } })) {
      finalCode = `${partnerCode}${suffix}`;
      suffix++;
    }

    // 예약 확정 및 짝꿍 코드 저장
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        partnerCode: finalCode,
      },
    });

    // 추천인 코드가 있는 경우 양방향 할인 적용
    let referralResult = null;
    if (booking.referredBy) {
      referralResult = await applyReferralDiscount(bookingId, booking.referredBy);

      if (referralResult.success) {
        // 잔금 재계산
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            finalBalance: {
              decrement: 10000, // 짝꿍 할인 1만원
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        partnerCode: updatedBooking.partnerCode,
      },
      referral: referralResult
        ? {
            applied: referralResult.success,
            newBookingDiscount: referralResult.newBookingDiscount,
            referrerDiscount: referralResult.referrerDiscount,
            error: referralResult.error,
          }
        : null,
      message: `예약이 확정되었습니다. 짝꿍 코드: ${finalCode}`,
    });
  } catch (error) {
    console.error('예약 확정 오류:', error);
    return NextResponse.json(
      { error: '예약 확정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
