/**
 * 마이페이지 - 후기 제출 API
 * POST /api/mypage/review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { verifyReview, getVerificationMessage, getPlatformName } from '@/lib/reviewVerification';

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewUrl } = body;

    if (!reviewUrl) {
      return NextResponse.json(
        { error: '후기 URL을 입력해주세요.' },
        { status: 400 }
      );
    }

    // URL 형식 검증
    try {
      new URL(reviewUrl);
    } catch {
      return NextResponse.json(
        { error: '올바른 URL 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: session.bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 같은 URL로 제출한 후기가 있는지 확인
    const existingReview = await prisma.reviewSubmission.findFirst({
      where: {
        bookingId: booking.id,
        reviewUrl: reviewUrl,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: '이미 제출한 후기입니다.' },
        { status: 400 }
      );
    }

    // 후기 자동 검증
    const verification = await verifyReview(reviewUrl);

    // 후기 저장
    const reviewSubmission = await prisma.reviewSubmission.create({
      data: {
        bookingId: booking.id,
        reviewUrl,
        platform: verification.platform,
        autoVerified: verification.canAutoVerify,
        titleValid: verification.titleValid,
        contentValid: verification.contentValid,
        characterCount: verification.characterCount,
        status: verification.status,
        verifiedAt: verification.canAutoVerify ? new Date() : null,
      },
    });

    // 자동 승인된 경우 할인 적용
    if (verification.status === 'AUTO_APPROVED') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          reviewDiscount: {
            increment: 10000, // 후기 1건당 1만원
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      reviewSubmission: {
        id: reviewSubmission.id,
        reviewUrl: reviewSubmission.reviewUrl,
        platform: reviewSubmission.platform,
        platformName: getPlatformName(reviewSubmission.platform),
        status: reviewSubmission.status,
        verification: {
          canAutoVerify: verification.canAutoVerify,
          titleValid: verification.titleValid,
          contentValid: verification.contentValid,
          characterCount: verification.characterCount,
        },
      },
      message: getVerificationMessage(verification),
    });
  } catch (error) {
    console.error('후기 제출 오류:', error);
    return NextResponse.json(
      { error: '후기 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 마이페이지 - 내 후기 목록 조회
 * GET /api/mypage/review
 */
export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const reviews = await prisma.reviewSubmission.findMany({
      where: { bookingId: session.bookingId },
      orderBy: { createdAt: 'desc' },
    });

    const statusLabels: Record<string, string> = {
      PENDING: '검토 대기',
      AUTO_APPROVED: '자동 승인',
      MANUAL_REVIEW: '수동 검토 중',
      APPROVED: '승인됨',
      REJECTED: '거절됨',
    };

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewUrl: r.reviewUrl,
        platform: r.platform,
        platformName: getPlatformName(r.platform),
        status: r.status,
        statusLabel: statusLabels[r.status] || r.status,
        titleValid: r.titleValid,
        contentValid: r.contentValid,
        characterCount: r.characterCount,
        rejectReason: r.rejectReason,
        createdAt: r.createdAt,
        verifiedAt: r.verifiedAt,
      })),
    });
  } catch (error) {
    console.error('후기 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '후기 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
