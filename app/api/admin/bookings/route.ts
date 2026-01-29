/**
 * 관리자 - 예약 목록 API
 * GET /api/admin/bookings
 * POST /api/admin/bookings (새 예약 생성)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { formatKRW } from '@/lib/pricing';
import { safeParseInt, sanitizeString, normalizePhone } from '@/lib/validation';
import { encrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';

import { validateSessionToken } from '@/lib/auth';

// 관리자 인증 확인
async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  // 서명 검증 추가
  return validateSessionToken(adminSession.value);
}

/**
 * 예약 목록 조회
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = sanitizeString(searchParams.get('search'), 100);
    const page = safeParseInt(searchParams.get('page'), 1, 1, 1000);
    const limit = safeParseInt(searchParams.get('limit'), 20, 1, 100);
    const upcomingDays = searchParams.get('upcoming_days');
    const thisWeek = searchParams.get('this_week') === '1';

    const where: Record<string, unknown> = {};

    if (upcomingDays) {
      const days = safeParseInt(upcomingDays, 7, 1, 90);
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      where.weddingDate = { gte: start, lte: end };
    }
    if (thisWeek && !upcomingDays) {
      const now = new Date();
      const day = now.getDay();
      const monOffset = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(mon.getDate() + monOffset);
      mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon);
      sun.setDate(sun.getDate() + 6);
      sun.setHours(23, 59, 59, 999);
      where.weddingDate = { gte: mon, lte: sun };
    }

    // 상태 필터
    if (status && status !== 'all') {
      where.status = status;
    }

    // 검색 (이름, 전화번호, 예식장) - sanitized search 사용
    if (search && search.length >= 2) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { weddingVenue: { contains: search } },
        { partnerCode: { contains: search } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          product: true,
          discountEvent: true,
        },
        orderBy: { weddingDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // 상태별 통계
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = stats.reduce(
      (acc, s) => {
        acc[s.status] = s._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        weddingDate: b.weddingDate,
        weddingVenue: b.weddingVenue,
        weddingTime: b.weddingTime,
        status: b.status,
        partnerCode: b.partnerCode,
        reservationId: b.reservationId ?? null,
        product: {
          id: b.product.id,
          name: b.product.name,
        },
        listPrice: b.listPrice,
        listPriceFormatted: formatKRW(b.listPrice),
        depositAmount: b.depositAmount,
        eventDiscount: b.eventDiscount,
        referralDiscount: b.referralDiscount,
        reviewDiscount: b.reviewDiscount,
        finalBalance: b.finalBalance,
        finalBalanceFormatted: formatKRW(b.finalBalance),
        depositPaidAt: b.depositPaidAt,
        balancePaidAt: b.balancePaidAt,
        videoUrl: b.videoUrl,
        contractUrl: b.contractUrl,
        reviewCount: 0,
        createdAt: b.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
    });
  } catch (error) {
    console.error('예약 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '예약 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 새 예약 생성
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      weddingDate,
      weddingVenue,
      weddingTime,
      productId,
      discountEventId,
      referredBy,
      adminNote,
    } = body;

    // 필수 필드 검증
    if (!customerName || !customerPhone || !weddingDate || !weddingVenue || !productId) {
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 상품 조회
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '존재하지 않는 상품입니다.' },
        { status: 400 }
      );
    }

    // 이벤트 할인 조회
    let eventDiscount = 0;
    if (discountEventId) {
      const event = await prisma.discountEvent.findUnique({
        where: { id: discountEventId },
      });
      if (event && event.isActive) {
        const now = new Date();
        if (now >= event.startDate && now <= event.endDate) {
          eventDiscount = event.amount;
        }
      }
    }

    // 전화번호 정규화
    const normalizedPhone = customerPhone.replace(/[^0-9]/g, '');

    // 예약 생성
    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: normalizedPhone,
        customerEmail: customerEmail || null,
        weddingDate: new Date(weddingDate),
        weddingVenue,
        weddingTime: weddingTime || null,
        productId,
        listPrice: product.price,
        discountEventId: discountEventId || null,
        eventDiscount,
        referredBy: referredBy || null,
        adminNote: adminNote || null,
        // 잔금 계산
        finalBalance: product.price - 100000 - eventDiscount,
      },
      include: {
        product: true,
        discountEvent: true,
      },
    });

    // 예약글(Reservation) 동기화 생성
    try {
      const weddingDateStr = new Date(weddingDate).toISOString().slice(0, 10);
      const title = `[예약관리] ${customerName} ${weddingDateStr}`;
      const hashedPassword = await bcrypt.hash('booking-sync', 10);
      const encryptedAuthor = encrypt(customerName.trim()) ?? customerName.trim();

      const reservation = await prisma.reservation.create({
        data: {
          title,
          author: encryptedAuthor,
          password: hashedPassword,
          content: `예약관리에서 생성됨: ${weddingVenue}`,
          isPrivate: true,
          status: booking.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
          weddingDate: weddingDateStr,
          weddingTime: weddingTime || null,
          venueName: weddingVenue,
          productType: product.name || null,
          termsAgreed: true,
          faqRead: true,
          privacyAgreed: true,
          totalAmount: product.price,
          depositAmount: 100000,
          discountAmount: eventDiscount,
          finalBalance: product.price - 100000 - eventDiscount,
          bookingId: booking.id,
        },
      });

      // Booking에 reservationId 연결
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reservationId: reservation.id },
      });

      // 예약확정 상태면 Reply 생성
      if (booking.status === 'CONFIRMED') {
        await prisma.reply.create({
          data: {
            reservationId: reservation.id,
            content: '예약 확정되었습니다.',
          },
        });
      }
    } catch (syncError) {
      console.error('예약글 동기화 생성 오류 (계속 진행):', syncError);
      // 동기화 실패해도 Booking 생성은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        weddingDate: booking.weddingDate,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('예약 생성 오류:', error);
    return NextResponse.json(
      { error: '예약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
