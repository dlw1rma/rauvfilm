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
import { validateSessionToken } from '@/lib/auth';
import { safeParseInt, sanitizeString } from '@/lib/validation';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  // 서명 검증 추가
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

    const body = await request.json();
    const { partnerCode } = body;
    const sanitizedCode = sanitizeString(partnerCode, 50);

    if (!sanitizedCode || sanitizedCode.trim() === '') {
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
        partnerCode: sanitizedCode.trim(),
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
