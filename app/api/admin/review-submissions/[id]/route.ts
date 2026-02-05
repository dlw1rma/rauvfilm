/**
 * 관리자 - 후기 승인/거절 API
 * PUT /api/admin/review-submissions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeParseInt } from '@/lib/validation';
import { isAdminAuthenticated } from '@/lib/api';

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
      include: { reservation: true },
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
      let discountApplied = false;
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

        // 예약에 후기 할인 적용 (가성비형이 아닌 경우, 2건 이상일 때만)
        if (review.reservation.productType !== '가성비형') {
          // 승인된 후기 수 확인 (방금 승인한 것 포함하여 다시 카운트)
          const approvedCount = await tx.reviewSubmission.count({
            where: {
              reservationId: review.reservationId,
              status: { in: ['AUTO_APPROVED', 'APPROVED'] },
            },
          });

          // 2건 이상이고 아직 할인이 적용되지 않았으면 적용
          const currentDiscount = review.reservation.reviewDiscount || 0;
          if (approvedCount >= 2 && currentDiscount === 0) {
            const currentDiscountAmount = review.reservation.discountAmount || 0;
            const totalAmount = review.reservation.totalAmount || 0;
            const depositAmount = review.reservation.depositAmount || 100000;
            const newReviewDiscount = 20000; // 2건 작성 시 2만원 할인
            const newDiscountAmount = currentDiscountAmount + 20000;
            const newFinalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

            await tx.reservation.update({
              where: { id: review.reservationId },
              data: {
                reviewDiscount: newReviewDiscount,
                discountAmount: newDiscountAmount,
                finalBalance: newFinalBalance,
              },
            });
            discountApplied = true;
          }
        }
        // 가성비형이면 할인 없이 원본영상만 전달 (할인 적용 안 함)
      });

      // 가성비형이면 원본영상 전달, 아니면 할인 적용 여부에 따라 메시지
      let message: string;
      if (review.reservation.productType === '가성비형') {
        message = '후기가 승인되었습니다. 원본영상이 전달됩니다.';
      } else if (discountApplied) {
        message = '후기가 승인되었습니다. 2건 작성 완료로 2만원 할인이 적용됩니다.';
      } else {
        message = '후기가 승인되었습니다. (할인은 2건 작성 시 적용됩니다)';
      }

      return NextResponse.json({
        success: true,
        status: 'APPROVED',
        message,
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
