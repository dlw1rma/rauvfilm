/**
 * URL 정규화 및 중복 검사 유틸리티
 * - 교묘하게 변형된 URL도 같은 콘텐츠로 인식
 */

/**
 * URL을 정규화하여 비교 가능한 형태로 변환
 * - http/https 차이 무시
 * - www 유무 무시
 * - 트래킹 파라미터 제거
 * - 네이버 블로그/카페의 경우 고유 ID 추출
 */
export function normalizeReviewUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());

    // 소문자 변환
    let hostname = parsed.hostname.toLowerCase();
    let pathname = parsed.pathname;

    // www 제거
    hostname = hostname.replace(/^www\./, '');

    // 네이버 블로그 정규화
    if (hostname === 'blog.naver.com' || hostname === 'm.blog.naver.com') {
      hostname = 'blog.naver.com';
      // /blogId/postId 형태 추출
      const pathMatch = pathname.match(/^\/([^/]+)\/(\d+)/);
      if (pathMatch) {
        return `blog.naver.com/${pathMatch[1]}/${pathMatch[2]}`;
      }
      // PostView.naver?blogId=xxx&logNo=xxx 형태
      const blogId = parsed.searchParams.get('blogId');
      const logNo = parsed.searchParams.get('logNo');
      if (blogId && logNo) {
        return `blog.naver.com/${blogId}/${logNo}`;
      }
    }

    // 네이버 카페 정규화
    if (hostname === 'cafe.naver.com' || hostname === 'm.cafe.naver.com') {
      hostname = 'cafe.naver.com';
      // /cafeName/articleId 형태
      const pathMatch = pathname.match(/^\/([^/]+)\/(\d+)/);
      if (pathMatch) {
        return `cafe.naver.com/${pathMatch[1]}/${pathMatch[2]}`;
      }
      // ArticleRead.nhn?clubid=xxx&articleid=xxx 형태
      const clubId = parsed.searchParams.get('clubid');
      const articleId = parsed.searchParams.get('articleid');
      if (clubId && articleId) {
        return `cafe.naver.com/${clubId}/${articleId}`;
      }
    }

    // 인스타그램 정규화
    if (hostname === 'instagram.com' || hostname === 'www.instagram.com') {
      hostname = 'instagram.com';
      // /p/postId/ 또는 /reel/postId/ 형태
      const postMatch = pathname.match(/^\/(p|reel)\/([A-Za-z0-9_-]+)/);
      if (postMatch) {
        return `instagram.com/${postMatch[1]}/${postMatch[2]}`;
      }
    }

    // 트래킹/불필요 쿼리 파라미터 제거
    const ignoredParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'ref', 'from', 'share', 'proxyReferer',
      'trackingCode', 'redirect', 'directRef'
    ];
    ignoredParams.forEach(param => parsed.searchParams.delete(param));

    // 끝의 슬래시 제거
    pathname = pathname.replace(/\/+$/, '');

    // 정규화된 URL 반환 (프로토콜 없이)
    const queryString = parsed.searchParams.toString();
    return `${hostname}${pathname}${queryString ? '?' + queryString : ''}`;
  } catch {
    // URL 파싱 실패 시 원본 반환 (소문자, 공백 제거)
    return url.toLowerCase().trim();
  }
}

/**
 * 두 URL이 같은 콘텐츠를 가리키는지 확인
 */
export function isSameReviewUrl(url1: string, url2: string): boolean {
  return normalizeReviewUrl(url1) === normalizeReviewUrl(url2);
}

import { prisma } from '@/lib/prisma';

/**
 * 중복 후기 URL 검사
 * - Review (관리자 등록) 테이블과 ReviewSubmission (고객 제출) 테이블 모두 검사
 * @param url 검사할 URL
 * @param excludeReviewId 제외할 Review ID (수정 시)
 * @param excludeSubmissionId 제외할 ReviewSubmission ID (수정 시)
 * @returns 중복 정보 또는 null
 */
export async function checkDuplicateReviewUrl(
  url: string,
  options?: {
    excludeReviewId?: number;
    excludeSubmissionId?: number;
    excludeReservationId?: number; // 같은 예약 내 중복만 허용하지 않을 때
  }
): Promise<{
  isDuplicate: boolean;
  duplicateType?: 'admin' | 'customer';
  message?: string;
}> {
  const normalizedUrl = normalizeReviewUrl(url);

  // 1. Review 테이블 (관리자 등록) 검사
  const adminReviews = await prisma.review.findMany({
    where: options?.excludeReviewId
      ? { id: { not: options.excludeReviewId } }
      : undefined,
    select: { id: true, sourceUrl: true, title: true },
  });

  for (const review of adminReviews) {
    if (normalizeReviewUrl(review.sourceUrl) === normalizedUrl) {
      return {
        isDuplicate: true,
        duplicateType: 'admin',
        message: `이미 등록된 후기입니다. (관리자 등록: ${review.title || '제목 없음'})`,
      };
    }
  }

  // 2. ReviewSubmission 테이블 (고객 제출) 검사
  const whereClause: Record<string, unknown> = {
    status: { notIn: ['REJECTED'] }, // 거절된 것은 제외
  };

  if (options?.excludeSubmissionId) {
    whereClause.id = { not: options.excludeSubmissionId };
  }

  const customerReviews = await prisma.reviewSubmission.findMany({
    where: whereClause,
    select: {
      id: true,
      reviewUrl: true,
      reservationId: true,
      status: true,
    },
  });

  for (const submission of customerReviews) {
    if (normalizeReviewUrl(submission.reviewUrl) === normalizedUrl) {
      // 같은 예약 내 중복인 경우
      if (options?.excludeReservationId && submission.reservationId === options.excludeReservationId) {
        return {
          isDuplicate: true,
          duplicateType: 'customer',
          message: '이미 등록한 후기 URL입니다.',
        };
      }
      // 다른 예약의 중복인 경우
      return {
        isDuplicate: true,
        duplicateType: 'customer',
        message: '다른 고객이 이미 등록한 후기 URL입니다.',
      };
    }
  }

  return { isDuplicate: false };
}
