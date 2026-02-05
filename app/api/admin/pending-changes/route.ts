/**
 * 관리자 - 예약글 수정 승인 대기 목록 API
 * GET /api/admin/pending-changes
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    // 대기중인 변경 요청 목록 조회
    const pendingChanges = await prisma.pendingChange.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 예약 정보와 함께 반환
    const changesWithReservation = await Promise.all(
      pendingChanges.map(async (change) => {
        const reservation = await prisma.reservation.findUnique({
          where: { id: change.reservationId },
          select: {
            id: true,
            title: true,
            author: true,
            weddingDate: true,
            productType: true,
          },
        });

        const decryptedAuthor = reservation ? decrypt(reservation.author) || '' : '';

        return {
          id: change.id,
          reservationId: change.reservationId,
          reservation: reservation ? {
            id: reservation.id,
            title: reservation.title,
            author: decryptedAuthor,
            weddingDate: reservation.weddingDate,
            productType: reservation.productType,
          } : null,
          changes: JSON.parse(change.changes),
          status: change.status,
          createdAt: change.createdAt,
        };
      })
    );

    return NextResponse.json({
      pendingChanges: changesWithReservation,
      count: changesWithReservation.length,
    });
  } catch (error) {
    console.error('대기 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '대기 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
