/**
 * 관리자 - 후기 승인/거절 API
 * PUT /api/admin/review-submissions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';
import { safeParseInt } from '@/lib/validation';

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
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    if (reviewId === 0) {
      return NextResponse.json(
        { error: '잘못된 후기 ID입니다.' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { action, rejectReason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400 }
      );
    }

    const review = await prisma.reviewSubmission.findUnique({
      where: { id: reviewId },
      include: { booking: true },
    });

    if (!review) {
      return NextResponse.json({ error: '후기를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 처리된 후기인지 확인
    if (review.status === 'APPROVED' || review.status === 'REJECTED') {
      return NextResponse.json(
        { error: '이미 처리된 후기입니다.' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // 후기 승인
      await prisma.$transaction(async (tx) => {
        // 후기 상태 업데이트
        await tx.reviewSubmission.update({
          where: { id: reviewId },
          data: {
            status: 'APPROVED',
            verifiedAt: new Date(),
            verifiedBy: 'admin', // TODO: 실제 관리자 ID
          },
        });

        // 예약에 후기 할인 적용 (이미 적용된 할인이 아닌 경우)
        if (review.status !== 'AUTO_APPROVED') {
          await tx.booking.update({
            where: { id: review.bookingId },
            data: {
              reviewDiscount: {
                increment: 10000,
              },
              finalBalance: {
                decrement: 10000,
              },
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        status: 'APPROVED',
        message: '후기가 승인되었습니다. 1만원 할인이 적용됩니다.',
      });
    } else {
      // 후기 거절
      if (!rejectReason) {
        return NextResponse.json(
          { error: '거절 사유를 입력해주세요.' },
          { status: 400 }
        );
      }

      await prisma.reviewSubmission.update({
        where: { id: reviewId },
        data: {
          status: 'REJECTED',
          rejectReason,
          verifiedAt: new Date(),
          verifiedBy: 'admin',
        },
      });

      return NextResponse.json({
        success: true,
        status: 'REJECTED',
        message: '후기가 거절되었습니다.',
      });
    }
  } catch (error) {
    console.error('후기 처리 오류:', error);
    return NextResponse.json(
      { error: '후기 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
