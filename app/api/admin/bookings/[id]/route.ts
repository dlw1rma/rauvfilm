/**
 * 관리자 - 개별 예약 API
 * GET /api/admin/bookings/[id] - 상세 조회
 * PUT /api/admin/bookings/[id] - 수정
 * DELETE /api/admin/bookings/[id] - 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBalance, formatKRW } from '@/lib/pricing';
import { safeParseInt } from '@/lib/validation';
import { encrypt, decrypt } from '@/lib/encryption';
import { isAdminAuthenticated } from '@/lib/api';

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

    // Booking에는 reviewSubmissions 관계 없음 (ReviewSubmission은 Reservation에 연결됨). 할인 계산용으로 0 사용
    const approvedReviewCount = 0;

    // 잔금 재계산
    const calculation = calculateBalance(booking.listPrice, {
      depositAmount: booking.depositAmount,
      travelFee: booking.travelFee,
      eventDiscount: booking.eventDiscount,
      newYearDiscount: booking.newYearDiscount,
      hasReferral: booking.referralDiscount > 0,
      approvedReviewCount,
    });

    // 연결된 예약글(Reservation)에서 제공사항 정보 가져오기
    let reservationInfo = null;
    if (booking.reservationId) {
      try {
        const reservation = await prisma.reservation.findUnique({
          where: { id: booking.reservationId },
          select: {
            id: true,
            productType: true,
            usbOption: true,
            deliveryAddress: true,
            brideName: true,
            bridePhone: true,
            groomName: true,
            groomPhone: true,
            makeupShoot: true,
            paebaekShoot: true,
            receptionShoot: true,
            seonwonpan: true,
            gimbalShoot: true,
            discountCouple: true,
            discountReview: true,
            discountNewYear: true,
            discountReviewBlog: true,
            customShootingRequest: true,
            customStyle: true,
            customEditStyle: true,
            customMusic: true,
            customLength: true,
            customEffect: true,
            customContent: true,
            customSpecialRequest: true,
            mainSnapCompany: true,
            playbackDevice: true,
            referralCode: true,
            specialNotes: true,
            reviewLink: true,
            reviewRefundAccount: true,
            reviewRefundDepositorName: true,
            reviewDiscount: true,
            createdAt: true,
          },
        });
        if (reservation) {
          reservationInfo = {
            ...reservation,
            deliveryAddress: decrypt(reservation.deliveryAddress),
            brideName: decrypt(reservation.brideName),
            bridePhone: decrypt(reservation.bridePhone),
            groomName: decrypt(reservation.groomName),
            groomPhone: decrypt(reservation.groomPhone),
          };
        }
      } catch (resError) {
        console.error('예약글 조회 오류 (계속 진행):', resError);
      }
    }

    return NextResponse.json({
      booking: {
        ...booking,
        listPriceFormatted: formatKRW(booking.listPrice),
        depositAmountFormatted: formatKRW(booking.depositAmount),
        travelFeeFormatted: formatKRW(booking.travelFee),
        eventDiscountFormatted: formatKRW(booking.eventDiscount),
        newYearDiscount: booking.newYearDiscount,
        newYearDiscountFormatted: formatKRW(booking.newYearDiscount),
        referralDiscountFormatted: formatKRW(booking.referralDiscount),
        reviewDiscountFormatted: formatKRW(booking.reviewDiscount),
        finalBalanceFormatted: formatKRW(calculation.finalBalance),
        calculatedBalance: calculation,
        reservationInfo,
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
      'listPrice',
      'eventDiscount',
      'newYearDiscount',
      'referralDiscount',
      'reviewDiscount',
      'travelFee',
      'adminNote',
    ];

    const updateData: Record<string, unknown> = {};

    // 되살리기: deletedAt을 null로 설정
    if (body.restore === true) {
      updateData.deletedAt = null;
    }

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
      body.listPrice !== undefined ||
      body.eventDiscount !== undefined ||
      body.newYearDiscount !== undefined ||
      body.referralDiscount !== undefined ||
      body.reviewDiscount !== undefined ||
      body.travelFee !== undefined
    ) {
      const listPrice = body.listPrice ?? booking.listPrice;
      const eventDiscount = body.eventDiscount ?? booking.eventDiscount;
      const newYearDiscount = body.newYearDiscount ?? booking.newYearDiscount;
      const referralDiscount = body.referralDiscount ?? booking.referralDiscount;
      const reviewDiscount = body.reviewDiscount ?? booking.reviewDiscount;
      const travelFee = body.travelFee ?? booking.travelFee;

      updateData.finalBalance = Math.max(
        0,
        listPrice + travelFee - booking.depositAmount - eventDiscount - newYearDiscount - referralDiscount - reviewDiscount
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

    // 예약글(Reservation) 동기화 업데이트
    if (booking.reservationId) {
      try {
        const reservationUpdateData: Record<string, unknown> = {};
        
        if (body.customerName !== undefined) {
          reservationUpdateData.author = encrypt(body.customerName.trim()) ?? body.customerName.trim();
        }
        if (body.weddingDate !== undefined) {
          const date = body.weddingDate ? new Date(body.weddingDate) : null;
          if (date && !isNaN(date.getTime())) {
            reservationUpdateData.weddingDate = date.toISOString().slice(0, 10);
          }
        }
        if (body.weddingVenue !== undefined) {
          reservationUpdateData.venueName = body.weddingVenue;
        }
        if (body.weddingTime !== undefined) {
          reservationUpdateData.weddingTime = body.weddingTime;
        }
        if (body.status !== undefined) {
          // 새로운 상태 체계에 맞춰 Reservation 상태 동기화
          if (body.status === 'CANCELLED') {
            reservationUpdateData.status = 'CANCELLED';
          } else {
            reservationUpdateData.status = 'CONFIRMED';
          }
        }

        if (Object.keys(reservationUpdateData).length > 0) {
          await prisma.reservation.update({
            where: { id: booking.reservationId },
            data: reservationUpdateData,
          });
        }
      } catch (syncError) {
        console.error('예약글 동기화 업데이트 오류 (계속 진행):', syncError);
      }
    }

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
 * 예약 삭제 (소프트 삭제 → 3일 후 영구 삭제)
 * query: ?permanent=1 → 영구 삭제
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

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === '1';

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { reservationId: true, deletedAt: true },
    });
    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (permanent) {
      // 영구 삭제
      if (booking.reservationId) {
        try {
          await prisma.reservation.delete({
            where: { id: booking.reservationId },
          });
        } catch (syncError) {
          console.error('예약글 동기화 삭제 오류 (계속 진행):', syncError);
        }
      }
      await prisma.booking.delete({
        where: { id: bookingId },
      });
      return NextResponse.json({ success: true, permanent: true });
    }

    // 소프트 삭제
    await prisma.booking.update({
      where: { id: bookingId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, permanent: false });
  } catch (error) {
    console.error('예약 삭제 오류:', error);
    return NextResponse.json(
      { error: '예약 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
