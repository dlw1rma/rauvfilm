/**
 * 마이페이지 - 내 수정 요청 상태 조회 API
 * GET /api/mypage/pending-changes
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 현재 로그인된 예약의 author, phone으로 같은 사용자의 모든 예약 ID 가져오기
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
      select: {
        author: true,
        bridePhone: true,
        groomPhone: true,
      },
    });

    if (!currentReservation) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const decryptedAuthor = decrypt(currentReservation.author) || '';
    const decryptedBridePhone = decrypt(currentReservation.bridePhone) || '';
    const decryptedGroomPhone = decrypt(currentReservation.groomPhone) || '';

    const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');
    const normalizedBridePhone = normalizePhone(decryptedBridePhone);
    const normalizedGroomPhone = normalizePhone(decryptedGroomPhone);

    // 모든 예약 조회
    const allReservations = await prisma.reservation.findMany({
      select: {
        id: true,
        author: true,
        bridePhone: true,
        groomPhone: true,
        title: true,
      },
    });

    // 같은 사용자의 예약 ID 필터링
    const myReservationIds = allReservations
      .filter((r) => {
        const rAuthor = decrypt(r.author) || '';
        const rBridePhone = decrypt(r.bridePhone) || '';
        const rGroomPhone = decrypt(r.groomPhone) || '';
        const rNormalizedBridePhone = normalizePhone(rBridePhone);
        const rNormalizedGroomPhone = normalizePhone(rGroomPhone);

        return rAuthor === decryptedAuthor &&
          (rNormalizedBridePhone === normalizedBridePhone ||
           rNormalizedGroomPhone === normalizedGroomPhone);
      })
      .map((r) => r.id);

    // 해당 예약들의 대기중인 변경 요청 조회
    const pendingChanges = await prisma.pendingChange.findMany({
      where: {
        reservationId: { in: myReservationIds },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 상태 레이블
    const statusLabels: Record<string, string> = {
      PENDING: '검토 대기중',
      APPROVED: '승인됨',
      REJECTED: '거절됨',
    };

    const changesWithReservation = pendingChanges.map((change) => {
      const reservation = allReservations.find((r) => r.id === change.reservationId);
      return {
        id: change.id,
        reservationId: change.reservationId,
        reservationTitle: reservation?.title || '',
        changes: JSON.parse(change.changes),
        status: change.status,
        statusLabel: statusLabels[change.status] || change.status,
        rejectReason: change.rejectReason,
        createdAt: change.createdAt,
        reviewedAt: change.reviewedAt,
      };
    });

    return NextResponse.json({
      pendingChanges: changesWithReservation,
      hasPending: changesWithReservation.some((c) => c.status === 'PENDING'),
    });
  } catch (error) {
    console.error('수정 요청 상태 조회 오류:', error);
    return NextResponse.json(
      { error: '수정 요청 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
