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

// HTML 엔티티 디코딩
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

// HTML에서 텍스트 추출 (태그 제거)
function extractText(html: string): string {
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = decodeHtmlEntities(text);
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

// 네이버 카페 URL에서 카페ID/게시글번호 추출
function extractCafeIds(url: string): { cafeId: string; articleId: string } | null {
  const match = url.match(/cafe\.naver\.com\/([\w-]+)\/(\d+)/);
  if (match) {
    return { cafeId: match[1], articleId: match[2] };
  }
  return null;
}

// 네이버 카페 모바일 URL 변환
function toNaverCafeMobileUrl(url: string): string | null {
  const ids = extractCafeIds(url);
  if (ids) {
    return `https://m.cafe.naver.com/${ids.cafeId}/${ids.articleId}`;
  }
  return null;
}

// 네이버 카페 URL slug → 숫자 ID 변환
async function resolveNaverCafeNumericId(cafeUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`https://m.cafe.naver.com/ca-fe/web/cafes/${cafeUrl}/cafe-info?useCafeId=false`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*',
        'Referer': `https://m.cafe.naver.com/${cafeUrl}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.cafe?.cafeId ?? data?.cafeId ?? null;
    return id ? String(id) : null;
  } catch {
    return null;
  }
}

// 네이버 카페 모바일 API로 제목/본문 가져오기
async function fetchCafeArticleData(cafeId: string, articleId: string): Promise<{ title: string; content: string } | null> {
  // 1차: URL slug 사용
  const result = await fetchCafeArticleAPI(cafeId, articleId, false);
  if (result && (result.title || result.content.length > 30)) return result;

  // 2차: 숫자 ID로 재시도
  const numericId = await resolveNaverCafeNumericId(cafeId);
  if (numericId && numericId !== cafeId) {
    const result2 = await fetchCafeArticleAPI(numericId, articleId, true);
    if (result2 && (result2.title || result2.content.length > 30)) return result2;
  }

  return null;
}

async function fetchCafeArticleAPI(cafeId: string, articleId: string, useCafeId: boolean): Promise<{ title: string; content: string } | null> {
  try {
    const apiUrl = `https://m.cafe.naver.com/ca-fe/web/cafes/${cafeId}/articles/${articleId}?useCafeId=${useCafeId}&requestFrom=A`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': `https://m.cafe.naver.com/${cafeId}/${articleId}`,
      },
      redirect: 'follow',
    });

    if (!response.ok) return null;

    const data = await response.json();
    const article = data?.article;
    if (!article) return null;

    const title = article.subject ? decodeHtmlEntities(article.subject) : '';
    let content = '';
    if (article.contentHtml) {
      content = extractText(article.contentHtml);
    }

    return { title, content };
  } catch {
    return null;
  }
}

// 네이버 카페 데스크톱 ArticleRead 페이지에서 제목/본문 추출 (iframe 콘텐츠)
async function fetchCafeArticleDesktop(cafeUrl: string, articleId: string): Promise<{ title: string; content: string } | null> {
  try {
    // 데스크톱 iframe URL
    const desktopUrl = `https://cafe.naver.com/ArticleRead.nhn?cluburl=${cafeUrl}&articleid=${articleId}`;
    const response = await fetch(desktopUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': `https://cafe.naver.com/${cafeUrl}`,
      },
      redirect: 'follow',
    });
    if (!response.ok) return null;

    const html = await response.text();
    const title = extractTitle(html);
    const content = extractContent(html);

    if (title || content.length > 30) {
      return { title, content };
    }

    return null;
  } catch {
    return null;
  }
}

// 중첩 div에서 매칭 종료 태그 찾기 (div open/close 카운팅)
function extractDivContent(html: string, startIndex: number): string {
  let depth = 1;
  let i = startIndex;
  const openTag = /<div[\s>]/gi;
  const closeTag = /<\/div>/gi;

  while (depth > 0 && i < html.length) {
    openTag.lastIndex = i;
    closeTag.lastIndex = i;
    const openMatch = openTag.exec(html);
    const closeMatch = closeTag.exec(html);

    if (!closeMatch) break;

    if (openMatch && openMatch.index < closeMatch.index) {
      depth++;
      i = openMatch.index + openMatch[0].length;
    } else {
      depth--;
      if (depth === 0) {
        return html.substring(startIndex, closeMatch.index);
      }
      i = closeMatch.index + closeMatch[0].length;
    }
  }
  return html.substring(startIndex, Math.min(startIndex + 100000, html.length));
}

// HTML에서 본문 콘텐츠 추출 (여러 패턴 시도)
function extractContent(html: string): string {
  // 스마트에디터 3.0 - se-text-paragraph 요소들 직접 추출
  const paragraphs = html.match(/<p[^>]*class="[^"]*se-text-paragraph[^"]*"[^>]*>[\s\S]*?<\/p>/gi);
  if (paragraphs && paragraphs.length > 0) {
    const text = paragraphs.map(p => extractText(p)).join(' ');
    if (text.length > 50) return text;
  }

  // se-main-container div 카운팅 방식
  const seStart = html.match(/<div[^>]*class=["'][^"']*se-main-container[^"']*["'][^>]*>/i);
  if (seStart) {
    const contentStart = (seStart.index ?? 0) + seStart[0].length;
    const innerHtml = extractDivContent(html, contentStart);
    const text = extractText(innerHtml);
    if (text.length > 50) return text;
  }

  // 네이버 블로그 post-view (div 카운팅)
  const postViewStart = html.match(/<div[^>]*class=["'][^"']*post-view[^"']*["'][^>]*>/i);
  if (postViewStart) {
    const contentStart = (postViewStart.index ?? 0) + postViewStart[0].length;
    const innerHtml = extractDivContent(html, contentStart);
    const text = extractText(innerHtml);
    if (text.length > 50) return text;
  }

  // 네이버 카페 article_body
  const articleBodyStart = html.match(/<div[^>]*class=["'][^"']*article_body[^"']*["'][^>]*>/i);
  if (articleBodyStart) {
    const contentStart = (articleBodyStart.index ?? 0) + articleBodyStart[0].length;
    const innerHtml = extractDivContent(html, contentStart);
    const text = extractText(innerHtml);
    if (text.length > 50) return text;
  }

  // postContentArea
  const contentAreaStart = html.match(/<div[^>]*id=["']postContentArea["'][^>]*>/i);
  if (contentAreaStart) {
    const contentStart = (contentAreaStart.index ?? 0) + contentAreaStart[0].length;
    const innerHtml = extractDivContent(html, contentStart);
    const text = extractText(innerHtml);
    if (text.length > 50) return text;
  }

  // postViewArea
  const postViewAreaStart = html.match(/<div[^>]*id=["']postViewArea["'][^>]*>/i);
  if (postViewAreaStart) {
    const contentStart = (postViewAreaStart.index ?? 0) + postViewAreaStart[0].length;
    const innerHtml = extractDivContent(html, contentStart);
    const text = extractText(innerHtml);
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

// HTML에서 meta 태그의 content 값 추출 (속성 순서 무관)
function getMetaContent(html: string, attrName: string, attrValue: string): string | null {
  const re1 = new RegExp(`<meta[^>]+${attrName}=["']${attrValue}["'][^>]+content=["']([^"']+)["']`, "i");
  const m1 = html.match(re1);
  if (m1?.[1]) return decodeHtmlEntities(m1[1].trim());
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attrName}=["']${attrValue}["']`, "i");
  const m2 = html.match(re2);
  if (m2?.[1]) return decodeHtmlEntities(m2[1].trim());
  return null;
}

// HTML에서 제목 추출
function extractTitle(html: string): string {
  // og:title 우선
  const ogTitle = getMetaContent(html, "property", "og:title");
  if (ogTitle) return ogTitle;

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
    let title = '';
    let content = '';

    if (platform === 'NAVER_CAFE') {
      const cafeIds = extractCafeIds(url);
      if (cafeIds) {
        // 1차: 모바일 API (URL slug + 숫자 ID 재시도 포함)
        const cafeData = await fetchCafeArticleData(cafeIds.cafeId, cafeIds.articleId);
        if (cafeData && (cafeData.title || cafeData.content)) {
          title = cafeData.title;
          content = cafeData.content;
        }

        // 2차: 데스크톱 ArticleRead.nhn 페이지 파싱
        if (!title && !content) {
          const desktopData = await fetchCafeArticleDesktop(cafeIds.cafeId, cafeIds.articleId);
          if (desktopData) {
            title = desktopData.title;
            content = desktopData.content;
          }
        }
      }

      // 3차: 모바일 HTML 페이지 OG 태그 fallback
      if (!title && !content) {
        const fetchUrl = toNaverCafeMobileUrl(url) || url;
        try {
          const response = await fetch(fetchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
              'Referer': 'https://m.naver.com/',
            },
            redirect: 'follow',
          });

          if (response.ok) {
            const html = await response.text();
            title = extractTitle(html);
            content = extractContent(html);

            // OG description fallback (모바일 SPA 페이지에서 본문 대신)
            if (!content || content.length < 30) {
              const ogDesc = getMetaContent(html, "property", "og:description");
              if (ogDesc) {
                content = ogDesc;
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // 모든 방법 실패 시
      if (!title && !content) {
        return {
          platform,
          canAutoVerify: false,
          titleValid: null,
          contentValid: null,
          characterCount: null,
          status: 'MANUAL_REVIEW',
          errorMessage: '네이버 카페 후기를 확인할 수 없습니다. 게시글이 전체공개로 설정되어 있는지 확인해주세요.',
        };
      }
    } else {
      // 네이버 블로그: PostView.naver 형식으로 변환 후 시도
      const fetchHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.naver.com/',
      };

      // 1차: PostView.naver URL
      const postViewUrl = toNaverBlogPostUrl(url);
      if (postViewUrl) {
        const response = await fetch(postViewUrl, { headers: fetchHeaders, redirect: 'follow' });
        if (response.ok) {
          const html = await response.text();
          title = extractTitle(html);
          content = extractContent(html);
        }
      }

      // 2차: PostView 실패 시 직접 URL로 재시도 (PostList 형식)
      if (!content || content.length < 30) {
        const match = url.match(/blog\.naver\.com\/([^\/\?]+)\/(\d+)/);
        if (match) {
          const listUrl = `https://blog.naver.com/PostList.naver?blogId=${match[1]}&from=postList&categoryNo=0`;
          try {
            const listRes = await fetch(listUrl, {
              headers: { ...fetchHeaders, Referer: `https://blog.naver.com/${match[1]}` },
              redirect: 'follow',
            });
            if (listRes.ok) {
              const listHtml = await listRes.text();
              // PostList 페이지에 해당 포스트가 포함되어 있으면 추출
              if (listHtml.includes(match[2])) {
                if (!title) title = extractTitle(listHtml);
                const listContent = extractContent(listHtml);
                if (listContent.length > (content?.length || 0)) {
                  content = listContent;
                }
              }
            }
          } catch {
            // ignore
          }
        }
      }

      // 모든 방법 실패 시
      if (!title && (!content || content.length < 30)) {
        return {
          platform,
          canAutoVerify: false,
          titleValid: null,
          contentValid: null,
          characterCount: null,
          status: 'MANUAL_REVIEW',
          errorMessage: '네이버 블로그 후기를 확인할 수 없습니다. 게시글이 전체공개로 설정되어 있는지 확인해주세요.',
        };
      }
    }

    // 제목 검증
    const titleValid = title ? validateTitle(title) : null;

    // 본문 검증
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
