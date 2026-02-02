/**
 * 마이페이지 - 촬영후기 링크 및 환급 정보 등록/수정
 * PATCH /api/mypage/reservations/[id]/review-link
 * Body: { reviewLink?, reviewRefundAccount?, reviewRefundDepositorName? }
 * 로그인 세션으로 소유권 확인 후 업데이트
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { safeParseInt, sanitizeString, isValidUrl } from '@/lib/validation';

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
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json({ error: '잘못된 예약 ID입니다.' }, { status: 400 });
    }

    const body = await request.json();
    const { reviewLink, reviewRefundAccount, reviewRefundDepositorName } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 로그인한 예약과 동일한지 또는 소유권 확인
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
      select: {
        author: true,
        brideName: true,
        bridePhone: true,
        groomName: true,
        groomPhone: true,
      },
    });
    if (!currentReservation) {
      return NextResponse.json({ error: '인증 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const normalizePhone = (p: string) => (p || '').replace(/[^0-9]/g, '');
    const decryptedAuthor = decrypt(currentReservation.author) || '';
    const decryptedBrideName = decrypt(currentReservation.brideName) || '';
    const decryptedGroomName = decrypt(currentReservation.groomName) || '';
    const decryptedBridePhone = normalizePhone(decrypt(currentReservation.bridePhone) || '');
    const decryptedGroomPhone = normalizePhone(decrypt(currentReservation.groomPhone) || '');

    const rAuthor = decrypt(reservation.author) || '';
    const rBrideName = decrypt(reservation.brideName) || '';
    const rGroomName = decrypt(reservation.groomName) || '';
    const rBridePhone = normalizePhone(decrypt(reservation.bridePhone) || '');
    const rGroomPhone = normalizePhone(decrypt(reservation.groomPhone) || '');

    const authorMatch =
      rAuthor === decryptedAuthor &&
      (rBridePhone === decryptedBridePhone ||
        rGroomPhone === decryptedGroomPhone ||
        rBridePhone === decryptedGroomPhone ||
        rGroomPhone === decryptedBridePhone);
    const brideMatch = rBrideName === decryptedBrideName && rBridePhone === decryptedBridePhone;
    const groomMatch = rGroomName === decryptedGroomName && rGroomPhone === decryptedGroomPhone;

    if (!authorMatch && !brideMatch && !groomMatch) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const updateData: {
      reviewLink?: string | null;
      reviewRefundAccount?: string | null;
      reviewRefundDepositorName?: string | null;
      reviewDiscount?: number;
      discountAmount?: number;
      finalBalance?: number;
    } = {};

    if (typeof reviewRefundAccount === 'string') {
      updateData.reviewRefundAccount = sanitizeString(reviewRefundAccount, 200) || null;
    }
    if (typeof reviewRefundDepositorName === 'string') {
      updateData.reviewRefundDepositorName = sanitizeString(reviewRefundDepositorName, 50) || null;
    }

    if (typeof reviewLink === 'string' && reviewLink.trim()) {
      if (!isValidUrl(reviewLink)) {
        return NextResponse.json({ error: '올바른 URL 형식이 아닙니다.' }, { status: 400 });
      }
      const sanitizedReviewLink = sanitizeString(reviewLink, 2000);
      if (sanitizedReviewLink.length < 10) {
        return NextResponse.json({ error: '후기 링크가 너무 짧습니다.' }, { status: 400 });
      }

      const existingReview = await prisma.reservation.findFirst({
        where: {
          reviewLink: sanitizedReviewLink,
          id: { not: reservationId },
        },
      });
      if (existingReview) {
        return NextResponse.json(
          { error: '이미 다른 예약에서 사용된 후기 링크입니다.' },
          { status: 400 }
        );
      }

      updateData.reviewLink = sanitizedReviewLink;
      const reviewDiscount = 10000;
      const totalAmount = reservation.totalAmount || 0;
      const depositAmount = reservation.depositAmount || 100000;
      const currentDiscountAmount = reservation.discountAmount || 0;
      const alreadyHadReviewDiscount = (reservation.reviewDiscount ?? 0) > 0;
      const newDiscountAmount = alreadyHadReviewDiscount
        ? currentDiscountAmount
        : currentDiscountAmount + reviewDiscount;
      updateData.reviewDiscount = reviewDiscount;
      updateData.discountAmount = newDiscountAmount;
      updateData.finalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData,
    });

    return NextResponse.json({
      message: '저장되었습니다.',
      reviewLink: updated.reviewLink,
      reviewRefundAccount: updated.reviewRefundAccount,
      reviewRefundDepositorName: updated.reviewRefundDepositorName,
    });
  } catch (error) {
    console.error('후기 링크/환급 정보 업데이트 오류:', error);
    return NextResponse.json(
      { error: '저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}
