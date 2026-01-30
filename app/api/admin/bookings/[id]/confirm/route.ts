import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { generatePartnerCode } from '@/lib/partnerCode';
import { validateSessionToken } from '@/lib/auth';
import { safeParseInt } from '@/lib/validation';

/**
 * 관리자 - 예약 확정 API
 * PUT /api/admin/bookings/[id]/confirm
 *
 * 예약을 확정하고 짝꿍 코드를 생성합니다.
 * 추천인 코드가 있는 경우 양방향 할인을 적용합니다.
 */

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
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
    const bookingId = safeParseInt(id, 0, 1, 2147483647);
    if (bookingId === 0) {
      return NextResponse.json(
        { error: '잘못된 예약 ID입니다.' },
        { status: 400 }
      );
    }

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

    // 짝꿍 코드 생성: Reservation에 닉네임 기반 referralCode가 있으면 우선 사용
    let baseCode = generatePartnerCode(booking.weddingDate, booking.customerName);
    if (booking.reservationId) {
      const linkedReservation = await prisma.reservation.findUnique({
        where: { id: booking.reservationId },
        select: { referralCode: true },
      });
      if (linkedReservation?.referralCode) {
        // Reservation referralCode는 "YYMMDD 닉네임" 형식, Booking partnerCode는 "YYMMDD닉네임" 형식
        baseCode = linkedReservation.referralCode.replace(/\s/g, '');
      }
    }

    // 중복 확인 (동일 코드가 있으면 숫자 추가)
    let finalCode = baseCode;
    let suffix = 1;
    while (await prisma.booking.findUnique({ where: { partnerCode: finalCode } })) {
      finalCode = `${baseCode}${suffix}`;
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

    // 연결된 Reservation도 CONFIRMED로 변경
    if (booking.reservationId) {
      try {
        await prisma.reservation.update({
          where: { id: booking.reservationId },
          data: { status: 'CONFIRMED' },
        });
      } catch (syncError) {
        console.error('예약글 상태 동기화 오류 (계속 진행):', syncError);
      }
    }

    // 추천인 코드가 있는 경우 양방향 할인 적용
    let referralResult = null;
    if (booking.referredBy) {
      try {
        // referredBy는 Reservation의 referralCode 형식 (예: "260126 홍길동")
        // Booking의 partnerCode 형식 (예: "260126홍길동") 과 다를 수 있으므로
        // Reservation.referralCode로 먼저 검색하고, Booking.partnerCode로도 검색
        const referredByCode = booking.referredBy.trim();

        // 1차: Reservation의 referralCode로 검색
        let referrerBooking = null;
        const referrerReservation = await prisma.reservation.findFirst({
          where: {
            referralCode: referredByCode,
            status: 'CONFIRMED',
          },
          select: { id: true, bookingId: true },
        });

        if (referrerReservation?.bookingId) {
          referrerBooking = await prisma.booking.findUnique({
            where: { id: referrerReservation.bookingId },
          });
        }

        // 2차: Booking의 partnerCode로 검색 (fallback)
        if (!referrerBooking) {
          referrerBooking = await prisma.booking.findUnique({
            where: { partnerCode: referredByCode },
          });
        }

        // 3차: 공백 제거 후 partnerCode 검색 (형식 차이 대응)
        if (!referrerBooking) {
          const codeWithoutSpace = referredByCode.replace(/\s/g, '');
          referrerBooking = await prisma.booking.findUnique({
            where: { partnerCode: codeWithoutSpace },
          });
        }

        if (referrerBooking && referrerBooking.status !== 'CANCELLED' && !referrerBooking.isAnonymized) {
          // 트랜잭션으로 양쪽 할인 적용
          await prisma.$transaction(async (tx) => {
            // 1. 신규 고객(현재 확정하는 예약) 할인 적용
            await tx.booking.update({
              where: { id: bookingId },
              data: {
                referralDiscount: 10000,
                referredByBookingId: referrerBooking!.id,
                finalBalance: {
                  decrement: 10000,
                },
              },
            });

            // 2. 추천인(기존 고객) 할인 적용
            await tx.booking.update({
              where: { id: referrerBooking!.id },
              data: {
                referralDiscount: {
                  increment: 10000,
                },
                finalBalance: {
                  decrement: 10000,
                },
              },
            });
          });

          referralResult = {
            applied: true,
            newBookingDiscount: 10000,
            referrerDiscount: 10000,
          };
        } else {
          referralResult = {
            applied: false,
            error: referrerBooking
              ? '추천인 예약이 취소되었거나 유효하지 않습니다.'
              : '추천인 짝꿍 코드를 찾을 수 없습니다.',
          };
        }
      } catch (referralError) {
        console.error('짝꿍 할인 적용 오류:', referralError);
        referralResult = {
          applied: false,
          error: '짝꿍 할인 적용 중 오류가 발생했습니다.',
        };
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        partnerCode: updatedBooking.partnerCode,
      },
      referral: referralResult,
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
