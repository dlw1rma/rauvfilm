/**
 * 마이페이지 - 후기 취소 API
 * DELETE /api/mypage/review/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { safeParseInt } from '@/lib/validation';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    
    if (reviewId === 0) {
      return NextResponse.json(
        { error: '잘못된 후기 ID입니다.' },
        { status: 400 }
      );
    }

    // 후기 조회 및 소유권 확인
    const review = await prisma.reviewSubmission.findUnique({
      where: { id: reviewId },
      include: { reservation: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: '후기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 본인의 예약인지 확인
    if (review.reservationId !== session.reservationId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 이미 승인된 후기는 취소 불가
    if (review.status === 'APPROVED' || review.status === 'AUTO_APPROVED') {
      return NextResponse.json(
        { error: '이미 승인된 후기는 취소할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 후기 삭제 및 할인 되돌리기
    await prisma.$transaction(async (tx) => {
      // AUTO_APPROVED 상태였고 가성비형이 아니면 할인 되돌리기
      if (review.status === 'AUTO_APPROVED' && review.reservation.productType !== '가성비형') {
        const reservation = await tx.reservation.findUnique({
          where: { id: review.reservationId },
          select: {
            totalAmount: true,
            depositAmount: true,
            reviewDiscount: true,
            discountAmount: true,
          },
        });

        if (reservation) {
          const newReviewDiscount = Math.max(0, (reservation.reviewDiscount || 0) - 10000);
          const newDiscountAmount = Math.max(0, (reservation.discountAmount || 0) - 10000);
          const totalAmount = reservation.totalAmount || 0;
          const depositAmount = reservation.depositAmount || 100000;
          const newFinalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

          await tx.reservation.update({
            where: { id: review.reservationId },
            data: {
              reviewDiscount: newReviewDiscount,
              discountAmount: newDiscountAmount,
              finalBalance: newFinalBalance,
            },
          });
        }
      }
      // 가성비형이면 할인을 적용하지 않았으므로 되돌릴 것도 없음

      // 후기 삭제
      await tx.reviewSubmission.delete({
        where: { id: reviewId },
      });
    });

    return NextResponse.json({
      success: true,
      message: '후기 제출이 취소되었습니다.',
    });
  } catch (error) {
    console.error('후기 취소 오류:', error);
    return NextResponse.json(
      { error: '후기 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
