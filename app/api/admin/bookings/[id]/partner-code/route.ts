/**
 * 관리자 - 짝꿍 코드 수정 API
 * PUT /api/admin/bookings/[id]/partner-code
 *
 * 닉네임 요청 시 커스텀 코드로 변경
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { setCustomPartnerCode } from '@/lib/partnerCode';

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
    const body = await request.json();
    const { partnerCode } = body;

    if (!partnerCode || partnerCode.trim() === '') {
      return NextResponse.json(
        { error: '짝꿍 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (booking.status === 'PENDING') {
      return NextResponse.json(
        { error: '예약이 확정된 후에만 짝꿍 코드를 수정할 수 있습니다.' },
        { status: 400 }
      );
    }

    const result = await setCustomPartnerCode(bookingId, partnerCode);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      partnerCode: partnerCode.trim(),
      message: '짝꿍 코드가 변경되었습니다.',
    });
  } catch (error) {
    console.error('짝꿍 코드 수정 오류:', error);
    return NextResponse.json(
      { error: '짝꿍 코드 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
