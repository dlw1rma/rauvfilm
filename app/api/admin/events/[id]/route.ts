/**
 * 관리자 - 개별 이벤트 API
 * PUT /api/admin/events/[id] - 수정
 * DELETE /api/admin/events/[id] - 삭제/비활성화
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
 * 이벤트 수정
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
    const eventId = parseInt(id);
    const body = await request.json();

    const event = await prisma.discountEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.amount !== undefined) updateData.amount = parseInt(body.amount);
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedEvent = await prisma.discountEvent.update({
      where: { id: eventId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      event: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        amount: updatedEvent.amount,
        amountFormatted: formatKRW(updatedEvent.amount),
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate,
        isActive: updatedEvent.isActive,
      },
    });
  } catch (error) {
    console.error('이벤트 수정 오류:', error);
    return NextResponse.json(
      { error: '이벤트 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 이벤트 삭제 (비활성화)
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
    const eventId = parseInt(id);

    const event = await prisma.discountEvent.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 예약이 있는 이벤트는 비활성화만 가능
    if (event._count.bookings > 0) {
      await prisma.discountEvent.update({
        where: { id: eventId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: '연결된 예약이 있어 비활성화되었습니다.',
      });
    }

    // 예약이 없으면 삭제
    await prisma.discountEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: '이벤트가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('이벤트 삭제 오류:', error);
    return NextResponse.json(
      { error: '이벤트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
