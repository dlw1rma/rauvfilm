import { NextRequest, NextResponse } from "next/server";

/**
 * 블로그/카페 링크에서 썸네일, 제목, 내용 추출
 * 여러 방법을 시도: Open Graph, 서드파티 API, 직접 파싱
 */

interface ParsedData {
  thumbnailUrl: string | null;
  title: string | null;
  excerpt: string | null;
}

// 서드파티 API 사용 (제목, 내용, 썸네일 모두 가져오기)
async function fetchDataFromAPI(url: string): Promise<ParsedData | null> {
  try {
    // linkpreview.net API 사용 (무료 플랜: 1000 requests/month)
    const apiKey = process.env.LINKPREVIEW_API_KEY || "";
    if (apiKey) {
      const response = await fetch(
        `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.title || data.image || data.description) {
          console.log("Found data via linkpreview API:", data);
          return {
            thumbnailUrl: data.image || null,
            title: data.title || null,
            excerpt: data.description ? truncateText(data.description, 200) : null,
          };
        }
      }
    }
  } catch (error) {
    console.error("Error fetching from API:", error);
  }
  return null;
}

// 텍스트 축약 함수
function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  // HTML 태그 제거
  const cleanText = text.replace(/<[^>]*>/g, "").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

// HTML에서 텍스트 추출 (태그 제거)
function extractTextFromHTML(html: string, maxLength: number = 200): string {
  // HTML 태그 제거
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return truncateText(text, maxLength);
}

// 네이버 블로그 포스트 ID 추출
function extractNaverBlogPostId(url: string): { blogId: string; postId: string } | null {
  // https://blog.naver.com/{blogId}/{postId} 형식
  const match = url.match(/blog\.naver\.com\/([^\/]+)\/(\d+)/);
  if (match) {
    return { blogId: match[1], postId: match[2] };
  }
  return null;
}

// 네이버 블로그 실제 포스트 페이지 URL 생성
function getNaverBlogPostUrl(blogId: string, postId: string): string {
  return `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${postId}`;
}

// HTML에서 메타 데이터 추출
function extractMetaData(html: string): ParsedData {
  const result: ParsedData = {
    thumbnailUrl: null,
    title: null,
    excerpt: null,
  };

  // 1. Open Graph 제목
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (ogTitleMatch && ogTitleMatch[1]) {
    result.title = ogTitleMatch[1].trim();
  }

  // 2. 일반 제목 태그
  if (!result.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      result.title = titleMatch[1].trim();
    }
  }

  // 3. Open Graph 설명
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  if (ogDescMatch && ogDescMatch[1]) {
    result.excerpt = truncateText(ogDescMatch[1], 200);
  }

  // 4. 메타 설명
  if (!result.excerpt) {
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaDescMatch && metaDescMatch[1]) {
      result.excerpt = truncateText(metaDescMatch[1], 200);
    }
  }

  // 5. Open Graph 이미지
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch && ogImageMatch[1]) {
    const imageUrl = ogImageMatch[1].trim();
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      result.thumbnailUrl = imageUrl;
    }
  }

  // 6. Twitter Card 이미지
  if (!result.thumbnailUrl) {
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    if (twitterImageMatch && twitterImageMatch[1]) {
      const imageUrl = twitterImageMatch[1].trim();
      if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
        result.thumbnailUrl = imageUrl;
      }
    }
  }

  return result;
}

// 네이버 블로그 이미지 찾기
function findNaverImages(html: string): string | null {
  const naverImagePatterns = [
    /(https?:\/\/postfiles\.pstatic\.net\/[^"'\s<>?]+)/gi,
    /(https?:\/\/blogfiles\.pstatic\.net\/[^"'\s<>?]+)/gi,
    /(https?:\/\/mblogthumb-phinf\.pstatic\.net\/[^"'\s<>?]+)/gi,
  ];

  for (const pattern of naverImagePatterns) {
    const matches = Array.from(html.matchAll(pattern));
    for (const match of matches) {
      if (match[1]) {
        let imageUrl = match[1].trim();
        imageUrl = imageUrl.split("?")[0];
        if (!imageUrl.includes("_blur") && imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return imageUrl;
        }
      }
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
  }

  try {
    // URL 유효성 검사
    let targetUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      targetUrl = `https://${url}`;
    }

    console.log("Fetching data from URL:", targetUrl);

    // 먼저 서드파티 API 시도 (가장 정확함)
    const apiData = await fetchDataFromAPI(targetUrl);
    if (apiData && (apiData.title || apiData.thumbnailUrl)) {
      console.log("Using API data:", apiData);
      return NextResponse.json(apiData);
    }

    // 네이버 블로그인 경우 특별 처리
    if (targetUrl.includes("blog.naver.com")) {
      const blogInfo = extractNaverBlogPostId(targetUrl);
      if (blogInfo) {
        const postUrl = getNaverBlogPostUrl(blogInfo.blogId, blogInfo.postId);
        console.log("Trying Naver blog post URL:", postUrl);
        
        try {
          const response = await fetch(postUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
              "Referer": "https://www.naver.com/",
            },
            redirect: "follow",
          });

          if (response.ok) {
            const html = await response.text();
            console.log("Post page HTML length:", html.length);

            const metaData = extractMetaData(html);
            
            // 네이버 이미지 찾기
            if (!metaData.thumbnailUrl) {
              metaData.thumbnailUrl = findNaverImages(html);
            }

            // 네이버 블로그 제목 찾기 (특수 처리)
            if (!metaData.title) {
              const naverTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              if (naverTitleMatch && naverTitleMatch[1]) {
                // "블로그명 : 포스트 제목" 형식에서 포스트 제목만 추출
                const titleParts = naverTitleMatch[1].split(":");
                if (titleParts.length > 1) {
                  metaData.title = titleParts[titleParts.length - 1].trim();
                } else {
                  metaData.title = naverTitleMatch[1].trim();
                }
              }
            }

            // 네이버 블로그 본문에서 내용 추출
            if (!metaData.excerpt) {
              // 본문 영역 찾기
              const contentMatch = html.match(/<div[^>]*class=["'][^"']*se-main-container[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
              if (contentMatch && contentMatch[1]) {
                metaData.excerpt = extractTextFromHTML(contentMatch[1], 200);
              } else {
                // 대체 패턴
                const altContentMatch = html.match(/<div[^>]*id=["']postViewArea["'][^>]*>([\s\S]*?)<\/div>/i);
                if (altContentMatch && altContentMatch[1]) {
                  metaData.excerpt = extractTextFromHTML(altContentMatch[1], 200);
                }
              }
            }

            if (metaData.title || metaData.thumbnailUrl || metaData.excerpt) {
              console.log("Found Naver blog data:", metaData);
              return NextResponse.json(metaData);
            }
          }
        } catch (error) {
          console.error("Error fetching post page:", error);
        }
      }
    }

    // 원본 URL로 일반적인 방법 시도
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.naver.com/",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        thumbnailUrl: null,
        title: null,
        excerpt: null,
        error: `페이지를 가져올 수 없습니다: ${response.statusText}`,
      });
    }

    const html = await response.text();
    console.log("HTML length:", html.length);

    const metaData = extractMetaData(html);

    // 네이버 블로그/카페 이미지 찾기
    if ((targetUrl.includes("blog.naver.com") || targetUrl.includes("cafe.naver.com")) && !metaData.thumbnailUrl) {
      metaData.thumbnailUrl = findNaverImages(html);
    }

    // 본문에서 내용 추출 (excerpt가 없는 경우)
    if (!metaData.excerpt) {
      // article, main, content 등의 태그에서 본문 찾기
      const contentPatterns = [
        /<article[^>]*>([\s\S]*?)<\/article>/i,
        /<main[^>]*>([\s\S]*?)<\/main>/i,
        /<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      ];

      for (const pattern of contentPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const extracted = extractTextFromHTML(match[1], 200);
          if (extracted.length > 50) {
            metaData.excerpt = extracted;
            break;
          }
        }
      }
    }

    // 일반 img 태그에서 첫 번째 이미지 (썸네일이 없는 경우)
    if (!metaData.thumbnailUrl) {
      const imgTagMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgTagMatch && imgTagMatch[1]) {
        let imageUrl = imgTagMatch[1].trim();
        if (imageUrl.startsWith("//")) {
          imageUrl = `https:${imageUrl}`;
        } else if (imageUrl.startsWith("/")) {
          const urlObj = new URL(targetUrl);
          imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
        }
        if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
          metaData.thumbnailUrl = imageUrl;
        }
      }
    }

    console.log("Final parsed data:", metaData);
    return NextResponse.json(metaData);
  } catch (error) {
    console.error("Error fetching data:", error);
    
    return NextResponse.json(
      { 
        thumbnailUrl: null,
        title: null,
        excerpt: null,
        error: "데이터를 가져오는데 실패했습니다.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
