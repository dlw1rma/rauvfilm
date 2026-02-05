/**
 * 마이페이지 - 후기 제출 API
 * POST /api/mypage/review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { verifyReview, getVerificationMessage, getPlatformName } from '@/lib/reviewVerification';
import { checkDuplicateReviewUrl } from '@/lib/urlNormalization';
import { isBudgetProduct } from '@/lib/constants';

// 후기 URL에서 메타데이터 추출
async function fetchReviewMetadata(url: string): Promise<{
  title: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  author: string | null;
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/reviews/fetch-thumbnail?url=${encodeURIComponent(url)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error('메타데이터 추출 실패:', response.status);
      return { title: null, excerpt: null, imageUrl: null, author: null };
    }

    const data = await response.json();
    return {
      title: data.title || null,
      excerpt: data.excerpt || null,
      imageUrl: data.thumbnailUrl || null,
      author: data.author || null,
    };
  } catch (error) {
    console.error('메타데이터 추출 오류:', error);
    return { title: null, excerpt: null, imageUrl: null, author: null };
  }
}

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
    const { reviewUrl, type = 'booking' } = body;
    const reviewType = type === 'shooting' ? 'shooting' : 'booking';

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

    const reservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 중복 URL 검사 (정규화하여 교묘하게 변형된 URL도 감지)
    const duplicateCheck = await checkDuplicateReviewUrl(reviewUrl, {
      excludeReservationId: session.reservationId, // 같은 예약 내 중복만 특별 처리
    });

    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        { error: duplicateCheck.message || '이미 등록된 후기 URL입니다.' },
        { status: 400 }
      );
    }

    // 같은 예약 내 동일 URL 추가 확인 (정규화 적용)
    const { normalizeReviewUrl } = await import('@/lib/urlNormalization');
    const normalizedUrl = normalizeReviewUrl(reviewUrl);

    const existingInSameReservation = await prisma.reviewSubmission.findMany({
      where: {
        reservationId: session.reservationId,
        status: { notIn: ['REJECTED'] },
      },
      select: { reviewUrl: true },
    });

    for (const existing of existingInSameReservation) {
      if (normalizeReviewUrl(existing.reviewUrl) === normalizedUrl) {
        return NextResponse.json(
          { error: '이미 등록한 후기 URL입니다.' },
          { status: 400 }
        );
      }
    }

    // 예약 정보 조회 (상품 종류 확인)
    const reservationInfo = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
      select: {
        productType: true,
      },
    });

    if (reviewType === 'shooting') {
      // 촬영후기: 블로그 1건 + 카페 1건 = 총 2건 제한
      const shootingCount = await prisma.reviewSubmission.count({
        where: {
          reservationId: session.reservationId,
          type: 'shooting',
          status: { in: ['PENDING', 'AUTO_APPROVED', 'MANUAL_REVIEW', 'APPROVED'] },
        },
      });
      if (shootingCount >= 2) {
        return NextResponse.json(
          { error: '촬영후기는 최대 2건(블로그 1건 + 카페 1건)까지 등록할 수 있습니다.' },
          { status: 400 }
        );
      }

      // 같은 플랫폼 중복 체크
      const url = reviewUrl.toLowerCase();
      const isBlog = url.includes('blog.naver.com');
      const isCafe = url.includes('cafe.naver.com');
      if (isBlog || isCafe) {
        const platformCheck = isBlog ? 'NAVER_BLOG' : 'NAVER_CAFE';
        const platformCount = await prisma.reviewSubmission.count({
          where: {
            reservationId: session.reservationId,
            type: 'shooting',
            platform: platformCheck,
            status: { in: ['PENDING', 'AUTO_APPROVED', 'MANUAL_REVIEW', 'APPROVED'] },
          },
        });
        if (platformCount >= 1) {
          return NextResponse.json(
            { error: `촬영후기 ${isBlog ? '블로그' : '카페'} 후기는 1건만 등록할 수 있습니다.` },
            { status: 400 }
          );
        }
      }
    } else {
      // 예약후기: 가성비형/1인1캠이면 1건, 아니면 3건 제한
      const maxReviews = isBudgetProduct(reservationInfo?.productType) ? 1 : 3;
      const reviewCount = await prisma.reviewSubmission.count({
        where: {
          reservationId: session.reservationId,
          type: 'booking',
          status: { in: ['PENDING', 'AUTO_APPROVED', 'MANUAL_REVIEW', 'APPROVED'] },
        },
      });
      if (reviewCount >= maxReviews) {
        return NextResponse.json(
          { error: `예약후기는 최대 ${maxReviews}건까지만 등록할 수 있습니다.` },
          { status: 400 }
        );
      }
    }

    // 후기 자동 검증
    const verification = await verifyReview(reviewUrl);

    // 후기 URL에서 메타데이터 추출 (썸네일, 제목, 내용, 작성자)
    const metadata = await fetchReviewMetadata(reviewUrl);

    // 후기 저장 (메타데이터 포함)
    const reviewSubmission = await prisma.reviewSubmission.create({
      data: {
        reservationId: session.reservationId,
        reviewUrl,
        platform: verification.platform,
        type: reviewType,
        // 자동 추출된 메타데이터
        title: metadata.title,
        excerpt: metadata.excerpt,
        imageUrl: metadata.imageUrl,
        author: metadata.author,
        // 검증 결과
        autoVerified: verification.canAutoVerify,
        titleValid: verification.titleValid,
        contentValid: verification.contentValid,
        characterCount: verification.characterCount,
        status: verification.status,
        verifiedAt: verification.canAutoVerify ? new Date() : null,
      },
    });

    // 자동 승인된 경우 할인 적용 여부 확인 (가성비형이 아닌 경우, 2건 이상일 때만)
    if (verification.status === 'AUTO_APPROVED') {
      // 현재 예약 정보 조회
      const currentReservation = await prisma.reservation.findUnique({
        where: { id: session.reservationId },
        select: {
          productType: true,
          totalAmount: true,
          depositAmount: true,
          reviewDiscount: true,
          discountAmount: true,
          referralDiscount: true,
        },
      });

      // 가성비형/1인1캠이 아니면 할인 적용 가능 여부 확인
      if (currentReservation && !isBudgetProduct(currentReservation.productType)) {
        // 승인된 후기 수 확인 (방금 추가된 것 포함)
        const approvedCount = await prisma.reviewSubmission.count({
          where: {
            reservationId: session.reservationId,
            status: { in: ['AUTO_APPROVED', 'APPROVED'] },
          },
        });

        // 2건 이상일 때만 할인 적용 (2건째일 때 전체 2만원 적용)
        if (approvedCount >= 2 && (currentReservation.reviewDiscount || 0) === 0) {
          const newReviewDiscount = 20000; // 2건 이상 작성 시 2만원 할인
          const newDiscountAmount = (currentReservation.discountAmount || 0) + 20000;
          const totalAmount = currentReservation.totalAmount || 0;
          const depositAmount = currentReservation.depositAmount || 100000;
          const newFinalBalance = Math.max(0, totalAmount - depositAmount - newDiscountAmount);

          await prisma.reservation.update({
            where: { id: session.reservationId },
            data: {
              reviewDiscount: newReviewDiscount,
              discountAmount: newDiscountAmount,
              finalBalance: newFinalBalance,
            },
          });
        }
      }
      // 가성비형이면 할인 없이 원본영상만 전달 (할인 적용 안 함)
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

    // 예약 정보 조회 (할인 옵션 확인용)
    const reservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
      select: {
        productType: true,
        discountReview: true,
        discountReviewBlog: true,
        reviewLink: true,
        reviewRefundAccount: true,
        reviewRefundDepositorName: true,
      },
    });

    const reviews = await prisma.reviewSubmission.findMany({
      where: { reservationId: session.reservationId },
      orderBy: { createdAt: 'desc' },
    });

    const statusLabels: Record<string, string> = {
      PENDING: '검토 대기',
      AUTO_APPROVED: '자동 승인',
      MANUAL_REVIEW: '수동 검토 중',
      APPROVED: '승인됨',
      REJECTED: '거절됨',
    };

    // 후기 작성 가능 여부 확인 (예약후기 또는 촬영후기 할인 체크 여부)
    const canWriteReview = reservation?.discountReview || reservation?.discountReviewBlog || false;
    // 가성비형/1인1캠이면 1건, 아니면 3건 제한
    const maxReviews = isBudgetProduct(reservation?.productType) ? 1 : 3;

    const mapReview = (r: typeof reviews[number]) => ({
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
      type: r.type || 'booking',
    });

    const bookingReviews = reviews.filter(r => (r.type || 'booking') === 'booking').map(mapReview);
    const shootingReviews = reviews.filter(r => r.type === 'shooting').map(mapReview);

    return NextResponse.json({
      reviews: bookingReviews,
      shootingReviews,
      canWriteReview,
      maxReviews,
      productType: reservation?.productType,
      reservationId: session.reservationId,
      reviewLink: reservation?.reviewLink || null,
      reviewRefundAccount: reservation?.reviewRefundAccount || null,
      reviewRefundDepositorName: reservation?.reviewRefundDepositorName || null,
    });
  } catch (error) {
    console.error('후기 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '후기 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
