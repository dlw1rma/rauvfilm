/**
 * 관리자 - 할인 이벤트 API
 * GET /api/admin/events - 목록
 * POST /api/admin/events - 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { formatKRW } from '@/lib/pricing';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return !!adminSession?.value;
}

/**
 * 이벤트 목록 조회
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: Record<string, unknown> = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const events = await prisma.discountEvent.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    const now = new Date();

    return NextResponse.json({
      events: events.map((e) => {
        const isOngoing = e.isActive && now >= e.startDate && now <= e.endDate;
        const isUpcoming = e.isActive && now < e.startDate;
        const isExpired = now > e.endDate;

        return {
          id: e.id,
          name: e.name,
          amount: e.amount,
          amountFormatted: formatKRW(e.amount),
          startDate: e.startDate,
          endDate: e.endDate,
          isActive: e.isActive,
          isOngoing,
          isUpcoming,
          isExpired,
          bookingCount: e._count.bookings,
          createdAt: e.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error('이벤트 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '이벤트 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 이벤트 생성
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, amount, startDate, endDate } = body;

    // 필수 필드 검증
    if (!name || !amount || !startDate || !endDate) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: '종료일은 시작일보다 이후여야 합니다.' },
        { status: 400 }
      );
    }

    const event = await prisma.discountEvent.create({
      data: {
        name,
        amount: parseInt(amount),
        startDate: start,
        endDate: end,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        amount: event.amount,
        amountFormatted: formatKRW(event.amount),
        startDate: event.startDate,
        endDate: event.endDate,
      },
    });
  } catch (error) {
    console.error('이벤트 생성 오류:', error);
    return NextResponse.json(
      { error: '이벤트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
