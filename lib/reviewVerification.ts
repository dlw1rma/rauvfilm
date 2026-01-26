/**
 * 라우브필름 후기 자동 검증 시스템
 *
 * 검증 항목:
 * 1. 제목 검사: '라우브필름' 또는 '본식DVD' 포함
 * 2. 본문 검사: 최소 글자 수 (500자 이상)
 * 3. 플랫폼 분류: 네이버 블로그(자동), 네이버 카페(수동)
 */

import type { ReviewPlatform, ReviewStatus } from '@prisma/client';

// 검증 설정
export const REQUIRED_KEYWORDS = ['라우브필름', '본식DVD', '본식dvd', 'rauvfilm', 'RAUVFILM'];
export const MIN_CHARACTER_COUNT = 500;

export interface VerificationResult {
  platform: ReviewPlatform;
  canAutoVerify: boolean;
  titleValid: boolean | null;
  contentValid: boolean | null;
  characterCount: number | null;
  status: ReviewStatus;
  errorMessage?: string;
}

/**
 * URL에서 플랫폼 감지
 * @param url 후기 URL
 * @returns 플랫폼 타입
 */
export function detectPlatform(url: string): ReviewPlatform {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('blog.naver.com')) return 'NAVER_BLOG';
  if (lowerUrl.includes('cafe.naver.com')) return 'NAVER_CAFE';
  if (lowerUrl.includes('instagram.com')) return 'INSTAGRAM';
  return 'OTHER';
}

/**
 * 제목에 필수 키워드가 포함되어 있는지 검사
 * @param title 제목
 * @returns 포함 여부
 */
export function validateTitle(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return REQUIRED_KEYWORDS.some((keyword) =>
    lowerTitle.includes(keyword.toLowerCase())
  );
}

/**
 * 본문 글자 수 검사
 * @param content 본문 내용
 * @returns 글자 수 및 유효 여부
 */
export function validateContent(content: string): {
  characterCount: number;
  isValid: boolean;
} {
  // 공백 제거 후 글자 수 계산
  const characterCount = content.replace(/\s/g, '').length;
  return {
    characterCount,
    isValid: characterCount >= MIN_CHARACTER_COUNT,
  };
}

/**
 * 후기 URL 분석 및 검증
 *
 * 참고: 네이버 카페는 비공개라 자동 검증 불가
 * 인스타그램도 로그인 필요하여 자동 검증 불가
 *
 * @param url 후기 URL
 * @returns 검증 결과
 */
export async function verifyReview(url: string): Promise<VerificationResult> {
  // 플랫폼 판별
  const platform = detectPlatform(url);

  // 네이버 카페 자동 검증 시도 (공개 설정에 따라 가능할 수 있음)
  if (platform === 'NAVER_CAFE') {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        return {
          platform,
          canAutoVerify: false,
          titleValid: null,
          contentValid: null,
          characterCount: null,
          status: 'MANUAL_REVIEW',
          errorMessage: '네이버 카페 후기를 확인할 수 없습니다. 카페 게시글의 공개여부를 "전체공개"로 설정해주세요. 설정 후 다시 제출해주시면 자동으로 확인됩니다.',
        };
      }

      const html = await response.text();

      // 제목 추출
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';
      const titleValid = validateTitle(title);

      // 본문 추출 (네이버 카페 특화)
      let content = '';
      
      // 카페 게시글 본문 추출 시도
      const articleBodyMatch = html.match(/class="se-main-container"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i) ||
                                   html.match(/class="article_body"[^>]*>([\s\S]*?)<\/div>/i) ||
                                   html.match(/id="postContentArea"[^>]*>([\s\S]*?)<\/div>/i);
      
      if (articleBodyMatch) {
        content = articleBodyMatch[1].replace(/<[^>]+>/g, ' ');
      } else {
        // 전체 body에서 스크립트/스타일 제거 후 텍스트 추출
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          content = bodyMatch[1]
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ');
        }
      }

      const contentValidation = validateContent(content);

      // 자동 승인 여부 결정
      const canAutoVerify = titleValid && contentValidation.isValid;

      return {
        platform,
        canAutoVerify,
        titleValid,
        contentValid: contentValidation.isValid,
        characterCount: contentValidation.characterCount,
        status: canAutoVerify ? 'AUTO_APPROVED' : 'MANUAL_REVIEW',
        errorMessage: canAutoVerify ? undefined : '네이버 카페 후기 검증 결과, 제목 또는 본문 요건을 충족하지 않습니다. 카페 게시글의 공개여부가 "전체공개"로 설정되어 있는지 확인해주세요.',
      };
    } catch (error) {
      console.error('네이버 카페 후기 검증 오류:', error);
      return {
        platform,
        canAutoVerify: false,
        titleValid: null,
        contentValid: null,
        characterCount: null,
        status: 'MANUAL_REVIEW',
        errorMessage: '네이버 카페 후기를 확인할 수 없습니다. 카페 게시글의 공개여부를 "전체공개"로 설정해주세요. 설정 후 다시 제출해주시면 자동으로 확인됩니다.',
      };
    }
  }

  if (platform === 'INSTAGRAM') {
    return {
      platform,
      canAutoVerify: false,
      titleValid: null,
      contentValid: null,
      characterCount: null,
      status: 'MANUAL_REVIEW',
      errorMessage: '인스타그램 후기는 자동 검증이 불가합니다. 관리자가 수동으로 확인합니다.',
    };
  }

  if (platform === 'OTHER') {
    return {
      platform,
      canAutoVerify: false,
      titleValid: null,
      contentValid: null,
      characterCount: null,
      status: 'MANUAL_REVIEW',
      errorMessage: '지원하지 않는 플랫폼입니다. 관리자가 수동으로 확인합니다.',
    };
  }

  // 네이버 블로그 자동 검증 시도
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return {
        platform,
        canAutoVerify: false,
        titleValid: null,
        contentValid: null,
        characterCount: null,
        status: 'MANUAL_REVIEW',
        errorMessage: `페이지를 불러올 수 없습니다. (HTTP ${response.status})`,
      };
    }

    const html = await response.text();

    // 제목 추출 (간단한 정규식 사용)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    const titleValid = validateTitle(title);

    // 본문 추출 (네이버 블로그 특화)
    // se-main-container: 스마트에디터
    // post-view: 구버전
    let content = '';

    // 스마트에디터 3.0
    const seContainerMatch = html.match(/class="se-main-container"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
    if (seContainerMatch) {
      content = seContainerMatch[1].replace(/<[^>]+>/g, ' ');
    } else {
      // 구버전 또는 다른 형식
      const postViewMatch = html.match(/class="post-view"[^>]*>([\s\S]*?)<\/div>/i);
      if (postViewMatch) {
        content = postViewMatch[1].replace(/<[^>]+>/g, ' ');
      } else {
        // 전체 body에서 스크립트/스타일 제거 후 텍스트 추출
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          content = bodyMatch[1]
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ');
        }
      }
    }

    const contentValidation = validateContent(content);

    // 자동 승인 여부 결정
    const canAutoVerify = titleValid && contentValidation.isValid;

    return {
      platform,
      canAutoVerify,
      titleValid,
      contentValid: contentValidation.isValid,
      characterCount: contentValidation.characterCount,
      status: canAutoVerify ? 'AUTO_APPROVED' : 'MANUAL_REVIEW',
    };
  } catch (error) {
    console.error('후기 검증 오류:', error);
    return {
      platform,
      canAutoVerify: false,
      titleValid: null,
      contentValid: null,
      characterCount: null,
      status: 'MANUAL_REVIEW',
      errorMessage: '후기 페이지 검증 중 오류가 발생했습니다. 관리자가 수동으로 확인합니다.',
    };
  }
}

/**
 * 검증 결과 메시지 생성
 * @param result 검증 결과
 * @returns 사용자에게 보여줄 메시지
 */
export function getVerificationMessage(result: VerificationResult): string {
  if (result.errorMessage) {
    return result.errorMessage;
  }

  if (result.status === 'AUTO_APPROVED') {
    return '✅ 후기가 자동 승인되었습니다! 할인이 적용됩니다.';
  }

  const issues: string[] = [];

  if (result.titleValid === false) {
    issues.push(`- 제목에 필수 키워드(${REQUIRED_KEYWORDS.slice(0, 2).join(', ')} 등)가 포함되어야 합니다.`);
  }

  if (result.contentValid === false) {
    issues.push(`- 본문이 최소 ${MIN_CHARACTER_COUNT}자 이상이어야 합니다. (현재: ${result.characterCount}자)`);
  }

  if (issues.length > 0) {
    return `⚠️ 후기 검증 결과:\n${issues.join('\n')}\n\n관리자가 검토 후 승인 여부를 결정합니다.`;
  }

  return '후기가 제출되었습니다. 관리자가 검토 후 승인 여부를 결정합니다.';
}

/**
 * 플랫폼 이름 반환
 * @param platform 플랫폼 enum
 * @returns 한글 플랫폼 이름
 */
export function getPlatformName(platform: ReviewPlatform): string {
  const names: Record<ReviewPlatform, string> = {
    NAVER_BLOG: '네이버 블로그',
    NAVER_CAFE: '네이버 카페',
    INSTAGRAM: '인스타그램',
    OTHER: '기타',
  };
  return names[platform];
}
