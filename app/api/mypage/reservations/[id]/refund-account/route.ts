/**
 * 마이페이지 - 환급계좌 저장 (후기 URL 없이도 저장 가능)
 * PATCH /api/mypage/reservations/[id]/refund-account
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { sanitizeString } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const reservationId = parseInt(id, 10);
    if (isNaN(reservationId) || reservationId <= 0) {
      return NextResponse.json({ error: '잘못된 예약 ID입니다.' }, { status: 400 });
    }

    // 세션의 예약과 동일한지 확인
    if (session.reservationId !== reservationId) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { reviewRefundBank, reviewRefundAccountNumber, reviewRefundDepositorName } = body;

    if (!reviewRefundBank || !reviewRefundAccountNumber || !reviewRefundDepositorName) {
      return NextResponse.json(
        { error: '은행명, 계좌번호, 입금자명을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이미 저장된 환급정보가 있는지 확인
    const existing = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { reviewRefundAccount: true },
    });

    if (existing?.reviewRefundAccount) {
      return NextResponse.json(
        { error: '환급 계좌가 이미 등록되어 있습니다. 변경이 필요하시면 관리자에게 문의해주세요.' },
        { status: 400 }
      );
    }

    const combinedAccount = `${sanitizeString(reviewRefundBank, 50)} ${sanitizeString(reviewRefundAccountNumber, 50)}`;

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        reviewRefundAccount: combinedAccount,
        reviewRefundDepositorName: sanitizeString(reviewRefundDepositorName, 50),
      },
    });

    return NextResponse.json({
      message: '환급 계좌가 저장되었습니다.',
      reviewRefundAccount: updated.reviewRefundAccount,
      reviewRefundDepositorName: updated.reviewRefundDepositorName,
    });
  } catch (error) {
    console.error('환급 계좌 저장 오류:', error);
    return NextResponse.json(
      { error: '저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
