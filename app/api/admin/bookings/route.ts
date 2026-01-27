/**
 * 관리자 - 예약 목록 API
 * GET /api/admin/bookings
 * POST /api/admin/bookings (새 예약 생성)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { formatKRW } from '@/lib/pricing';
import { safeParseInt, sanitizeString } from '@/lib/validation';

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

    const where: Record<string, unknown> = {};

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
