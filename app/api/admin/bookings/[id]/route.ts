/**
 * 관리자 - 개별 예약 API
 * GET /api/admin/bookings/[id] - 상세 조회
 * PUT /api/admin/bookings/[id] - 수정
 * DELETE /api/admin/bookings/[id] - 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { calculateBalance, formatKRW } from '@/lib/pricing';
import { validateSessionToken } from '@/lib/auth';
import { safeParseInt, sanitizeString } from '@/lib/validation';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  // 서명 검증 추가
  return validateSessionToken(adminSession.value);
}

/**
 * 예약 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bookingId = safeParseInt(id, 0, 1, 2147483647);
    if (bookingId === 0) {
      return NextResponse.json(
        { error: '잘못된 예약 ID입니다.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: true,
        discountEvent: true,
        reviewSubmissions: {
          orderBy: { createdAt: 'desc' },
        },
        referrals: {
          select: {
            id: true,
            customerName: true,
            weddingDate: true,
            status: true,
          },
        },
        referrer: {
          select: {
            id: true,
            customerName: true,
            partnerCode: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 승인된 후기 수
    const approvedReviewCount = booking.reviewSubmissions.filter(
      (r) => r.status === 'AUTO_APPROVED' || r.status === 'APPROVED'
    ).length;

    // 잔금 재계산
    const calculation = calculateBalance(booking.listPrice, {
      depositAmount: booking.depositAmount,
      eventDiscount: booking.eventDiscount,
      hasReferral: booking.referralDiscount > 0,
      approvedReviewCount,
    });

    return NextResponse.json({
      booking: {
        ...booking,
        listPriceFormatted: formatKRW(booking.listPrice),
        depositAmountFormatted: formatKRW(booking.depositAmount),
        eventDiscountFormatted: formatKRW(booking.eventDiscount),
        referralDiscountFormatted: formatKRW(booking.referralDiscount),
        reviewDiscountFormatted: formatKRW(booking.reviewDiscount),
        finalBalanceFormatted: formatKRW(calculation.finalBalance),
        calculatedBalance: calculation,
      },
    });
  } catch (error) {
    console.error('예약 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '예약 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 예약 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bookingId = safeParseInt(id, 0, 1, 2147483647);
    if (bookingId === 0) {
      return NextResponse.json(
        { error: '잘못된 예약 ID입니다.' },
        { status: 400 }
      );
    }
    const body = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 허용된 필드만 업데이트
    const allowedFields = [
      'customerName',
      'customerPhone',
      'customerEmail',
      'weddingDate',
      'weddingVenue',
      'weddingTime',
      'status',
      'depositPaidAt',
      'balancePaidAt',
      'eventDiscount',
      'referralDiscount',
      'reviewDiscount',
      'adminNote',
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'weddingDate' || field === 'depositPaidAt' || field === 'balancePaidAt') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else if (field === 'customerPhone') {
          updateData[field] = body[field].replace(/[^0-9]/g, '');
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // 잔금 재계산이 필요한 경우
    if (
      body.eventDiscount !== undefined ||
      body.referralDiscount !== undefined ||
      body.reviewDiscount !== undefined
    ) {
      const eventDiscount = body.eventDiscount ?? booking.eventDiscount;
      const referralDiscount = body.referralDiscount ?? booking.referralDiscount;
      const reviewDiscount = body.reviewDiscount ?? booking.reviewDiscount;

      updateData.finalBalance = Math.max(
        0,
        booking.listPrice - booking.depositAmount - eventDiscount - referralDiscount - reviewDiscount
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        product: true,
        discountEvent: true,
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('예약 수정 오류:', error);
    return NextResponse.json(
      { error: '예약 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 예약 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bookingId = safeParseInt(id, 0, 1, 2147483647);
    if (bookingId === 0) {
      return NextResponse.json(
        { error: '잘못된 예약 ID입니다.' },
        { status: 400 }
      );
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('예약 삭제 오류:', error);
    return NextResponse.json(
      { error: '예약 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
