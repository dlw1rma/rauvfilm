/**
 * 라우브필름 후기 자동 검증 시스템
 *
 * 검증 항목:
 * 1. 제목 검사: '라우브필름' 또는 '본식DVD' 포함
 * 2. 본문 검사: 최소 글자 수 (500자 이상)
 * 3. 플랫폼 분류: 네이버 블로그(자동), 네이버 카페(자동), 인스타그램(수동)
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
 */
export function validateTitle(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return REQUIRED_KEYWORDS.some((keyword) =>
    lowerTitle.includes(keyword.toLowerCase())
  );
}

/**
 * 본문 글자 수 검사
 */
export function validateContent(content: string): {
  characterCount: number;
  isValid: boolean;
} {
  const characterCount = content.replace(/\s/g, '').length;
  return {
    characterCount,
    isValid: characterCount >= MIN_CHARACTER_COUNT,
  };
}

// HTML에서 텍스트 추출 (태그 제거)
function extractText(html: string): string {
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// 네이버 블로그 PostView URL 변환
function toNaverBlogPostUrl(url: string): string | null {
  let match = url.match(/blog\.naver\.com\/([^\/\?]+)\/(\d+)/);
  if (match) {
    return `https://blog.naver.com/PostView.naver?blogId=${match[1]}&logNo=${match[2]}`;
  }
  match = url.match(/blogId=([^&]+).*logNo=(\d+)/);
  if (match) {
    return `https://blog.naver.com/PostView.naver?blogId=${match[1]}&logNo=${match[2]}`;
  }
  match = url.match(/blog\.naver\.com\/([^\/\?]+).*logNo=(\d+)/);
  if (match) {
    return `https://blog.naver.com/PostView.naver?blogId=${match[1]}&logNo=${match[2]}`;
  }
  return null;
}

// 네이버 카페 모바일 URL 변환
function toNaverCafeMobileUrl(url: string): string | null {
  const match = url.match(/cafe\.naver\.com\/([\w-]+)\/(\d+)/);
  if (match) {
    return `https://m.cafe.naver.com/${match[1]}/${match[2]}`;
  }
  return null;
}

// HTML에서 본문 콘텐츠 추출 (여러 패턴 시도)
function extractContent(html: string): string {
  // 스마트에디터 3.0
  const seMatch = html.match(/<div[^>]*class=["'][^"']*se-main-container[^"']*["'][^>]*>([\s\S]*?)(<\/div>\s*){3,}/i);
  if (seMatch && seMatch[1]) {
    const text = extractText(seMatch[1]);
    if (text.length > 50) return text;
  }

  // 네이버 블로그 post-view
  const postViewMatch = html.match(/<div[^>]*class=["'][^"']*post-view[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (postViewMatch && postViewMatch[1]) {
    const text = extractText(postViewMatch[1]);
    if (text.length > 50) return text;
  }

  // 네이버 카페 article_body
  const articleBodyMatch = html.match(/<div[^>]*class=["'][^"']*article_body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (articleBodyMatch && articleBodyMatch[1]) {
    const text = extractText(articleBodyMatch[1]);
    if (text.length > 50) return text;
  }

  // postContentArea
  const contentAreaMatch = html.match(/<div[^>]*id=["']postContentArea["'][^>]*>([\s\S]*?)<\/div>/i);
  if (contentAreaMatch && contentAreaMatch[1]) {
    const text = extractText(contentAreaMatch[1]);
    if (text.length > 50) return text;
  }

  // postViewArea
  const postViewAreaMatch = html.match(/<div[^>]*id=["']postViewArea["'][^>]*>([\s\S]*?)<\/div>/i);
  if (postViewAreaMatch && postViewAreaMatch[1]) {
    const text = extractText(postViewAreaMatch[1]);
    if (text.length > 50) return text;
  }

  // article 태그
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch && articleMatch[1]) {
    const text = extractText(articleMatch[1]);
    if (text.length > 50) return text;
  }

  // 최후: body 전체에서 스크립트/스타일 제거
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return extractText(bodyMatch[1]);
  }

  return '';
}

// HTML에서 제목 추출
function extractTitle(html: string): string {
  // og:title 우선
  const ogMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (ogMatch && ogMatch[1]) {
    return ogMatch[1].trim();
  }

  // title 태그
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    let title = titleMatch[1].trim();
    // "블로그명 : 포스트 제목" 형식
    if (title.includes(':')) {
      const parts = title.split(':');
      title = parts[parts.length - 1].trim();
    } else if (title.includes(' - ')) {
      const parts = title.split(' - ');
      title = parts[0].trim();
    }
    return title;
  }

  return '';
}

/**
 * 후기 URL 분석 및 검증
 */
export async function verifyReview(url: string): Promise<VerificationResult> {
  const platform = detectPlatform(url);

  // 인스타그램: 자동 검증 불가
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

  // 기타 플랫폼: 자동 검증 불가
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

  // 네이버 블로그/카페 자동 검증
  try {
    let fetchUrl: string;
    let userAgent: string;
    let referer: string;

    if (platform === 'NAVER_BLOG') {
      // PostView.naver 형식으로 변환 (iframe 우회)
      fetchUrl = toNaverBlogPostUrl(url) || url;
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      referer = 'https://www.naver.com/';
    } else {
      // 네이버 카페: 모바일 URL로 변환
      fetchUrl = toNaverCafeMobileUrl(url) || url;
      userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      referer = 'https://m.naver.com/';
    }

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': referer,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      const platformName = platform === 'NAVER_CAFE' ? '네이버 카페' : '네이버 블로그';
      return {
        platform,
        canAutoVerify: false,
        titleValid: null,
        contentValid: null,
        characterCount: null,
        status: 'MANUAL_REVIEW',
        errorMessage: `${platformName} 후기를 확인할 수 없습니다. 게시글이 전체공개로 설정되어 있는지 확인해주세요.`,
      };
    }

    const html = await response.text();

    // 제목 추출 및 검증
    const title = extractTitle(html);
    const titleValid = title ? validateTitle(title) : null;

    // 본문 추출 및 검증
    const content = extractContent(html);
    const contentValidation = content ? validateContent(content) : { characterCount: 0, isValid: false };

    // 콘텐츠가 거의 없으면 페이지 접근 실패로 판단
    if (contentValidation.characterCount < 30) {
      const platformName = platform === 'NAVER_CAFE' ? '카페 게시글' : '블로그 포스트';
      return {
        platform,
        canAutoVerify: false,
        titleValid,
        contentValid: null,
        characterCount: contentValidation.characterCount,
        status: 'MANUAL_REVIEW',
        errorMessage: `${platformName}의 본문을 읽을 수 없습니다. 전체공개로 설정되어 있는지 확인해주세요.`,
      };
    }

    const canAutoVerify = (titleValid === true) && contentValidation.isValid;

    return {
      platform,
      canAutoVerify,
      titleValid,
      contentValid: contentValidation.isValid,
      characterCount: contentValidation.characterCount,
      status: canAutoVerify ? 'AUTO_APPROVED' : 'MANUAL_REVIEW',
      errorMessage: canAutoVerify ? undefined : undefined,
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
 */
export function getVerificationMessage(result: VerificationResult): string {
  if (result.errorMessage) {
    return result.errorMessage;
  }

  if (result.status === 'AUTO_APPROVED') {
    return '후기가 자동 승인되었습니다! 할인이 적용됩니다.';
  }

  const issues: string[] = [];

  if (result.titleValid === false) {
    issues.push(`- 제목에 필수 키워드(${REQUIRED_KEYWORDS.slice(0, 2).join(', ')} 등)가 포함되어야 합니다.`);
  }

  if (result.contentValid === false) {
    issues.push(`- 본문이 최소 ${MIN_CHARACTER_COUNT}자 이상이어야 합니다. (현재: ${result.characterCount}자)`);
  }

  if (issues.length > 0) {
    return `후기 검증 결과:\n${issues.join('\n')}\n\n관리자가 검토 후 승인 여부를 결정합니다.`;
  }

  return '후기가 제출되었습니다. 관리자가 검토 후 승인 여부를 결정합니다.';
}

/**
 * 플랫폼 이름 반환
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
