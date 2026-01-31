import { NextRequest, NextResponse } from "next/server";

/**
 * 블로그/카페 링크에서 썸네일, 제목, 내용 추출
 * 여러 방법을 시도: Open Graph, 서드파티 API, 직접 파싱
 */

interface ParsedData {
  thumbnailUrl: string | null;
  title: string | null;
  excerpt: string | null;
  author: string | null;
}

// 서드파티 API 사용 (제목, 내용, 썸네일 모두 가져오기)
async function fetchDataFromAPI(url: string): Promise<ParsedData | null> {
  try {
    // linkpreview.net API 사용 (무료 플랜: 1000 requests/month)
    const apiKey = process.env.LINKPREVIEW_API_KEY || "";
    console.log("LinkPreview API Key present:", !!apiKey);
    
    if (!apiKey) {
      console.log("LINKPREVIEW_API_KEY not set, skipping API call");
      return null;
    }
    
    const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`;
    console.log("Calling LinkPreview API:", apiUrl.replace(apiKey, "***"));
    
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    console.log("LinkPreview API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkPreview API error:", response.status, errorText);
      return null;
    }
    
      const data = await response.json();
      console.log("LinkPreview API response data:", JSON.stringify(data, null, 2));
      
      if (data.title || data.image || data.description || data.author || data.site_name) {
        const result = {
          thumbnailUrl: data.image || null,
          title: data.title || null,
          excerpt: data.description ? truncateText(data.description, 200) : null,
          author: (data.author || data.site_name || null)?.replace(/네이버 블로그\s*\|\s*/gi, '').replace(/\|\s*네이버 블로그/gi, '').replace(/네이버 블로그/gi, '').replace(/\|/g, '').trim() || null, // linkpreview API가 author를 지원하는 경우, 없으면 site_name 사용, "|" 문자 및 "네이버 블로그" 제거
        };
        console.log("Returning API data:", result);
        return result;
      }
    
    console.log("LinkPreview API returned no useful data");
  } catch (error) {
    console.error("Error fetching from LinkPreview API:", error);
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

// 네이버 블로그 포스트 ID 추출 (다양한 형식 지원)
function extractNaverBlogPostId(url: string): { blogId: string; postId: string } | null {
  // 형식 1: https://blog.naver.com/{blogId}/{postId}
  let match = url.match(/blog\.naver\.com\/([^\/\?]+)\/(\d+)/);
  if (match) {
    return { blogId: match[1], postId: match[2] };
  }
  
  // 형식 2: PostView.naver?blogId=...&logNo=...
  match = url.match(/blogId=([^&]+).*logNo=(\d+)/);
  if (match) {
    return { blogId: match[1], postId: match[2] };
  }
  
  // 형식 3: blog.naver.com/{blogId}?Redirect=Log&logNo={postId}
  match = url.match(/blog\.naver\.com\/([^\/\?]+).*logNo=(\d+)/);
  if (match) {
    return { blogId: match[1], postId: match[2] };
  }
  
  return null;
}

// 네이버 블로그 실제 포스트 페이지 URL 생성 (PostView.naver 형식)
function getNaverBlogPostUrl(blogId: string, postId: string): string {
  return `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${postId}`;
}

// 네이버 카페 URL에서 카페ID와 게시글번호 추출
function extractNaverCafeIds(url: string): { cafeId: string; articleId: string } | null {
  const cafeMatch = url.match(/cafe\.naver\.com\/([\w-]+)\/(\d+)/);
  if (cafeMatch) {
    return { cafeId: cafeMatch[1], articleId: cafeMatch[2] };
  }
  return null;
}

// 네이버 카페 URL을 모바일 주소로 변환 (쿼리 스트링 제거)
function convertNaverCafeToMobile(url: string): string | null {
  const ids = extractNaverCafeIds(url);
  if (ids) {
    return `https://m.cafe.naver.com/${ids.cafeId}/${ids.articleId}`;
  }
  return null;
}

// 네이버 카페 모바일 API로 게시글 데이터 가져오기
async function fetchNaverCafeArticleAPI(cafeId: string, articleId: string): Promise<ParsedData | null> {
  try {
    // 네이버 카페 모바일 웹의 내부 API 호출
    const apiUrl = `https://m.cafe.naver.com/ca-fe/web/cafes/${cafeId}/articles/${articleId}?useCafeId=false&requestFrom=A`;
    console.log("Trying Naver cafe mobile web API:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Referer": `https://m.cafe.naver.com/${cafeId}/${articleId}`,
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.log("Naver cafe API response not ok:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("Naver cafe API response keys:", Object.keys(data));

    const article = data?.article;
    if (!article) {
      console.log("No article data in cafe API response");
      return null;
    }

    const result: ParsedData = {
      title: article.subject || null,
      excerpt: null,
      thumbnailUrl: null,
      author: null,
    };

    // 본문 추출 (contentHtml 또는 contentElements)
    if (article.contentHtml) {
      result.excerpt = truncateText(extractTextFromHTML(article.contentHtml, 300), 200);
    }

    // 썸네일 이미지
    if (article.representImage) {
      result.thumbnailUrl = article.representImage;
    } else if (article.openGraphImage) {
      result.thumbnailUrl = article.openGraphImage;
    }

    // 작성자 (닉네임)
    const writer = article.writer;
    if (writer) {
      result.author = writer.nick || writer.nickName || writer.id || null;
    }

    // 작성자를 못 가져왔으면 카페명 사용
    if (!result.author) {
      const cafeName = data?.cafe?.name || data?.cafe?.cafeName || null;
      if (cafeName) {
        result.author = cafeName;
      }
    }

    console.log("Naver cafe API parsed data:", {
      title: result.title,
      excerpt: result.excerpt ? result.excerpt.substring(0, 50) + "..." : null,
      thumbnailUrl: result.thumbnailUrl ? "있음" : "없음",
      author: result.author,
    });

    return result;
  } catch (error) {
    console.error("Naver cafe API error:", error);
    return null;
  }
}

// HTML에서 메타 데이터 추출
function extractMetaData(html: string): ParsedData {
  const result: ParsedData = {
    thumbnailUrl: null,
    title: null,
    excerpt: null,
    author: null,
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

  // 7. 작성자 추출
  // Open Graph 작성자
  const ogAuthorMatch = html.match(/<meta\s+property=["']og:article:author["']\s+content=["']([^"']+)["']/i);
  if (ogAuthorMatch && ogAuthorMatch[1]) {
    result.author = ogAuthorMatch[1].trim().replace(/\|/g, '').trim();
  }
  
  // 일반 메타 작성자
  if (!result.author) {
    const authorMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i);
    if (authorMatch && authorMatch[1]) {
      result.author = authorMatch[1].trim().replace(/\|/g, '').trim();
    }
  }
  
  // article:author 메타
  if (!result.author) {
    const articleAuthorMatch = html.match(/<meta\s+property=["']article:author["']\s+content=["']([^"']+)["']/i);
    if (articleAuthorMatch && articleAuthorMatch[1]) {
      result.author = articleAuthorMatch[1].trim().replace(/\|/g, '').trim();
    }
  }
  
  // 최종적으로 "|" 문자 및 "네이버 블로그" 텍스트 제거
  if (result.author) {
    result.author = result.author
      .replace(/네이버 블로그\s*\|\s*/gi, '') // "네이버 블로그 |" 제거
      .replace(/\|\s*네이버 블로그/gi, '') // "| 네이버 블로그" 제거
      .replace(/네이버 블로그/gi, '') // "네이버 블로그" 제거
      .replace(/\|/g, '') // "|" 문자 제거
      .trim();
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

    // 네이버 카페인 경우: 모바일 API 우선 시도
    if (targetUrl.includes("cafe.naver.com")) {
      const cafeIds = extractNaverCafeIds(targetUrl);
      if (cafeIds) {
        console.log("📡 네이버 카페 모바일 API 시도:", cafeIds);
        const cafeApiData = await fetchNaverCafeArticleAPI(cafeIds.cafeId, cafeIds.articleId);
        if (cafeApiData && (cafeApiData.title || cafeApiData.thumbnailUrl || cafeApiData.excerpt)) {
          // 카페 API로 데이터를 가져온 경우 바로 반환
          console.log("✅ 네이버 카페 모바일 API에서 데이터 가져옴");
          return NextResponse.json(cafeApiData);
        }
        console.log("⚠️ 네이버 카페 모바일 API 실패, 기존 방식으로 fallback");
      }
    }

    // 네이버 카페인 경우 모바일 주소로 변환 (fallback)
    let finalUrl = targetUrl;
    if (targetUrl.includes("cafe.naver.com")) {
      const mobileUrl = convertNaverCafeToMobile(targetUrl);
      if (mobileUrl) {
        finalUrl = mobileUrl;
        console.log("✅ 네이버 카페 URL 변환 (모바일):", targetUrl, "->", finalUrl);
      } else {
        console.log("⚠️ 네이버 카페 URL 형식을 파싱할 수 없습니다:", targetUrl);
      }
    }
    // 네이버 블로그인 경우 PostView.naver 형식으로 자동 변환
    else if (targetUrl.includes("blog.naver.com")) {
      const blogInfo = extractNaverBlogPostId(targetUrl);
      if (blogInfo) {
        finalUrl = getNaverBlogPostUrl(blogInfo.blogId, blogInfo.postId);
        console.log("✅ 네이버 블로그 URL 변환:", targetUrl, "->", finalUrl);
      } else {
        console.log("⚠️ 네이버 블로그 URL 형식을 파싱할 수 없습니다:", targetUrl);
      }
    }

    // 변환된 URL로 linkpreview.net API에 요청 (가장 정확함)
    console.log("📡 linkpreview.net API 호출 중...");
    let apiData = await fetchDataFromAPI(finalUrl);
    let hasApiData = false;
    let apiAuthor = null;
    
    if (apiData && (apiData.title || apiData.thumbnailUrl || apiData.excerpt || apiData.author)) {
      hasApiData = true;
      apiAuthor = apiData.author || null;
      console.log("✅ linkpreview.net API에서 데이터 가져옴:", {
        title: apiData.title,
        author: apiData.author || "(없음)",
        thumbnail: apiData.thumbnailUrl ? "있음" : "없음",
        excerpt: apiData.excerpt ? `${apiData.excerpt.substring(0, 50)}...` : "없음",
      });
      
      // 네이버 블로그/카페이고 author가 없으면 직접 파싱으로 작성자 추출 시도
      if (!apiAuthor && (targetUrl.includes("blog.naver.com") || targetUrl.includes("cafe.naver.com"))) {
        console.log("⚠️ linkpreview API에서 작성자를 가져오지 못함, 직접 파싱으로 작성자 추출 시도");
        // apiData는 유지하고 직접 파싱으로 author만 보완
      } else {
        // author가 있거나 네이버가 아니면 바로 반환
        const responseData = {
          ...apiData,
          author: apiAuthor,
        };
        console.log("Returning linkpreview API response with author:", responseData.author);
        return NextResponse.json(responseData);
      }
    } else {
      console.log("⚠️ linkpreview.net API에서 데이터를 가져오지 못함, 직접 파싱 시도");
      apiData = null; // API 실패 시 null로 설정
    }

    // API 실패 시 직접 파싱 시도
    // 네이버 카페 직접 파싱
    if (targetUrl.includes("cafe.naver.com")) {
      const mobileUrl = convertNaverCafeToMobile(targetUrl);
      if (mobileUrl) {
        console.log("Trying direct parsing for Naver cafe mobile URL:", mobileUrl);
        
        try {
          const response = await fetch(mobileUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
              "Referer": "https://m.naver.com/",
            },
            redirect: "follow",
          });

          if (response.ok) {
            const html = await response.text();
            console.log("Cafe mobile page HTML length:", html.length);

            const metaData = extractMetaData(html);
            
            // 네이버 카페 이미지 찾기
            if (!metaData.thumbnailUrl) {
              const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
              if (ogImageMatch && ogImageMatch[1]) {
                const imgUrl = ogImageMatch[1].trim();
                if (imgUrl && (imgUrl.startsWith("http://") || imgUrl.startsWith("https://"))) {
                  metaData.thumbnailUrl = imgUrl;
                }
              }
            }
            
            if (!metaData.thumbnailUrl) {
              metaData.thumbnailUrl = findNaverImages(html);
            }

            // 네이버 카페 제목 찾기
            if (!metaData.title) {
              const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
              if (ogTitleMatch && ogTitleMatch[1]) {
                metaData.title = ogTitleMatch[1].trim();
              }
              
              if (!metaData.title) {
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                  let title = titleMatch[1].trim();
                  // "게시글 제목 - 카페명" 형식 처리
                  if (title.includes(" - ")) {
                    const parts = title.split(" - ");
                    title = parts[0].trim();
                  }
                  metaData.title = title;
                }
              }
            }

            // 네이버 카페 본문에서 내용 추출
            if (!metaData.excerpt) {
              const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
              if (ogDescMatch && ogDescMatch[1]) {
                metaData.excerpt = truncateText(ogDescMatch[1], 200);
              }
              
              // 본문 영역 찾기
              if (!metaData.excerpt) {
                const contentMatch = html.match(/<div[^>]*class=["'][^"']*article_body[^"']*["'][^>]*>([\s\S]{100,5000})<\/div>/i);
                if (contentMatch && contentMatch[1]) {
                  const extracted = extractTextFromHTML(contentMatch[1], 200);
                  if (extracted.length > 30) {
                    metaData.excerpt = extracted;
                  }
                }
              }
            }

            // 네이버 카페 작성자 찾기 (다양한 패턴 시도)
            if (!metaData.author) {
              // 1. nickname 클래스
              const nicknameMatch = html.match(/<span[^>]*class=["'][^"']*nickname[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
              if (nicknameMatch && nicknameMatch[1]) {
                metaData.author = extractTextFromHTML(nicknameMatch[1], 50).trim().replace(/\|/g, '').trim();
              }
              
              // 2. writer 클래스
              if (!metaData.author) {
                const writerMatch = html.match(/<span[^>]*class=["'][^"']*writer[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
                if (writerMatch && writerMatch[1]) {
                  metaData.author = extractTextFromHTML(writerMatch[1], 50).trim().replace(/\|/g, '').trim();
                }
              }
              
              // 3. author 클래스
              if (!metaData.author) {
                const authorMatch = html.match(/<span[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
                if (authorMatch && authorMatch[1]) {
                  metaData.author = extractTextFromHTML(authorMatch[1], 50).trim().replace(/\|/g, '').trim();
                }
              }
              
              // 4. 닉네임 데이터 속성
              if (!metaData.author) {
                const nicknameDataMatch = html.match(/data-nickname=["']([^"']+)["']/i);
                if (nicknameDataMatch && nicknameDataMatch[1]) {
                  metaData.author = nicknameDataMatch[1].trim().replace(/\|/g, '').trim();
                }
              }
              
              // 5. 작성자 정보가 포함된 div
              if (!metaData.author) {
                const authorDivMatch = html.match(/<div[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]{10,200})<\/div>/i);
                if (authorDivMatch && authorDivMatch[1]) {
                  const extracted = extractTextFromHTML(authorDivMatch[1], 50);
                  if (extracted.length > 2) {
                    metaData.author = extracted.trim().replace(/\|/g, '').trim();
                  }
                }
              }
              
              // 6. 작성자 영역 전체 검색
              if (!metaData.author) {
                const authorAreaMatch = html.match(/<div[^>]*class=["'][^"']*writer[^"']*["'][^>]*>([\s\S]{10,300})<\/div>/i);
                if (authorAreaMatch && authorAreaMatch[1]) {
                  const extracted = extractTextFromHTML(authorAreaMatch[1], 50);
                  if (extracted.length > 2 && extracted.length < 30) {
                    metaData.author = extracted.trim().replace(/\|/g, '').trim();
                  }
                }
              }
              
              // 최종적으로 "|" 문자 및 "네이버 블로그" 텍스트 제거
              if (metaData.author) {
                metaData.author = metaData.author
                  .replace(/네이버 블로그\s*\|\s*/gi, '') // "네이버 블로그 |" 제거
                  .replace(/\|\s*네이버 블로그/gi, '') // "| 네이버 블로그" 제거
                  .replace(/네이버 블로그/gi, '') // "네이버 블로그" 제거
                  .replace(/\|/g, '') // "|" 문자 제거
                  .trim();
              }
            }

            // API 데이터와 직접 파싱 데이터 병합 (API 데이터 우선, author는 직접 파싱 결과 사용)
            let finalAuthor = metaData.author || apiData?.author || null;
            // 최종적으로 작성자에서 "|" 문자 및 "네이버 블로그" 텍스트 제거
            if (finalAuthor) {
              finalAuthor = finalAuthor
                .replace(/네이버 블로그\s*\|\s*/gi, '') // "네이버 블로그 |" 제거
                .replace(/\|\s*네이버 블로그/gi, '') // "| 네이버 블로그" 제거
                .replace(/네이버 블로그/gi, '') // "네이버 블로그" 제거
                .replace(/\|/g, '') // "|" 문자 제거
                .trim();
            }
            
            const mergedData = {
              title: apiData?.title || metaData.title || null,
              excerpt: apiData?.excerpt || metaData.excerpt || null,
              thumbnailUrl: apiData?.thumbnailUrl || metaData.thumbnailUrl || null,
              author: finalAuthor,
            };
            
            if (mergedData.title || mergedData.thumbnailUrl || mergedData.excerpt || mergedData.author) {
              console.log("Found Naver cafe data (merged):", {
                ...mergedData,
                author: mergedData.author || "(없음)",
              });
              return NextResponse.json(mergedData);
            }
          }
        } catch (error) {
          console.error("Error fetching cafe mobile page:", error);
        }
      }
    }
    // 네이버 블로그 직접 파싱
    else if (targetUrl.includes("blog.naver.com")) {
      const blogInfo = extractNaverBlogPostId(targetUrl);
      if (blogInfo) {
        const postUrl = getNaverBlogPostUrl(blogInfo.blogId, blogInfo.postId);
        console.log("Trying direct parsing for Naver blog post URL:", postUrl);
        
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
            
            // 네이버 이미지 찾기 (우선순위: og:image > 첫 번째 본문 이미지)
            if (!metaData.thumbnailUrl) {
              // 1. og:image 우선
              const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
              if (ogImageMatch && ogImageMatch[1]) {
                const imgUrl = ogImageMatch[1].trim();
                if (imgUrl && (imgUrl.startsWith("http://") || imgUrl.startsWith("https://"))) {
                  metaData.thumbnailUrl = imgUrl;
                }
              }
            }
            
            // 2. 본문의 첫 번째 이미지 (썸네일용)
            if (!metaData.thumbnailUrl) {
              metaData.thumbnailUrl = findNaverImages(html);
            }
            
            // 3. se-image-resource (네이버 블로그 에디터 이미지)
            if (!metaData.thumbnailUrl) {
              const seImageMatch = html.match(/<img[^>]*class=["'][^"']*se-image-resource[^"']*["'][^>]*src=["']([^"']+)["']/i);
              if (seImageMatch && seImageMatch[1]) {
                let imgUrl = seImageMatch[1].trim();
                if (imgUrl.startsWith("//")) {
                  imgUrl = `https:${imgUrl}`;
                }
                if (imgUrl && (imgUrl.startsWith("http://") || imgUrl.startsWith("https://"))) {
                  metaData.thumbnailUrl = imgUrl;
                }
              }
            }

            // 네이버 블로그 제목 찾기 (여러 패턴 시도)
            if (!metaData.title) {
              // 1. og:title에서 찾기
              const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
              if (ogTitleMatch && ogTitleMatch[1]) {
                metaData.title = ogTitleMatch[1].trim();
              }
              
              // 2. title 태그에서 찾기
              if (!metaData.title) {
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                  let title = titleMatch[1].trim();
                  // "블로그명 : 포스트 제목" 또는 "포스트 제목 - 블로그명" 형식 처리
                  if (title.includes(":")) {
                    const parts = title.split(":");
                    title = parts[parts.length - 1].trim();
                  } else if (title.includes(" - ")) {
                    const parts = title.split(" - ");
                    title = parts[0].trim();
                  }
                  metaData.title = title;
                }
              }
              
              // 3. se-title-text 클래스에서 찾기 (네이버 블로그 에디터)
              if (!metaData.title) {
                const seTitleMatch = html.match(/<div[^>]*class=["'][^"']*se-title-text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
                if (seTitleMatch && seTitleMatch[1]) {
                  metaData.title = extractTextFromHTML(seTitleMatch[1], 100).trim();
                }
              }
              
              // 4. p.titleArea 또는 .title_area에서 찾기
              if (!metaData.title) {
                const titleAreaMatch = html.match(/<p[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
                if (titleAreaMatch && titleAreaMatch[1]) {
                  metaData.title = extractTextFromHTML(titleAreaMatch[1], 100).trim();
                }
              }
            }

            // 네이버 블로그 작성자 찾기 (다양한 패턴 시도)
            if (!metaData.author) {
              // 1. se-nickname 클래스 (네이버 블로그 에디터)
              const seNicknameMatch = html.match(/<span[^>]*class=["'][^"']*se-nickname[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
              if (seNicknameMatch && seNicknameMatch[1]) {
                metaData.author = extractTextFromHTML(seNicknameMatch[1], 50).trim().replace(/\|/g, '').trim();
              }
              
              // 2. nickname 클래스
              if (!metaData.author) {
                const nicknameMatch = html.match(/<span[^>]*class=["'][^"']*nickname[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
                if (nicknameMatch && nicknameMatch[1]) {
                  metaData.author = extractTextFromHTML(nicknameMatch[1], 50).trim().replace(/\|/g, '').trim();
                }
              }
              
              // 3. writer 클래스
              if (!metaData.author) {
                const writerMatch = html.match(/<span[^>]*class=["'][^"']*writer[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
                if (writerMatch && writerMatch[1]) {
                  metaData.author = extractTextFromHTML(writerMatch[1], 50).trim().replace(/\|/g, '').trim();
                }
              }
              
              // 4. author 클래스
              if (!metaData.author) {
                const authorMatch = html.match(/<span[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
                if (authorMatch && authorMatch[1]) {
                  metaData.author = extractTextFromHTML(authorMatch[1], 50).trim().replace(/\|/g, '').trim();
                }
              }
              
              // 5. se-writer 클래스
              if (!metaData.author) {
                const seWriterMatch = html.match(/<span[^>]*class=["'][^"']*se-writer[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
                if (seWriterMatch && seWriterMatch[1]) {
                  metaData.author = extractTextFromHTML(seWriterMatch[1], 50).trim().replace(/\|/g, '').trim();
                }
              }
              
              // 6. 블로그 작성자 정보 영역
              if (!metaData.author) {
                const blogAuthorMatch = html.match(/<div[^>]*class=["'][^"']*blog_author[^"']*["'][^>]*>([\s\S]{10,200})<\/div>/i);
                if (blogAuthorMatch && blogAuthorMatch[1]) {
                  const extracted = extractTextFromHTML(blogAuthorMatch[1], 50);
                  if (extracted.length > 2 && extracted.length < 30) {
                    metaData.author = extracted.trim().replace(/\|/g, '').trim();
                  }
                }
              }
              
              // 7. 작성자 정보가 포함된 p 태그
              if (!metaData.author) {
                const authorPMatch = html.match(/<p[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]{10,200})<\/p>/i);
                if (authorPMatch && authorPMatch[1]) {
                  const extracted = extractTextFromHTML(authorPMatch[1], 50);
                  if (extracted.length > 2 && extracted.length < 30) {
                    metaData.author = extracted.trim().replace(/\|/g, '').trim();
                  }
                }
              }
              
              // 8. data-nickname 속성
              if (!metaData.author) {
                const dataNicknameMatch = html.match(/data-nickname=["']([^"']+)["']/i);
                if (dataNicknameMatch && dataNicknameMatch[1]) {
                  metaData.author = dataNicknameMatch[1].trim().replace(/\|/g, '').trim();
                }
              }
              
              // 9. 작성자 정보가 포함된 다양한 div 패턴
              if (!metaData.author) {
                const authorDivPatterns = [
                  /<div[^>]*class=["'][^"']*nickname[^"']*["'][^>]*>([\s\S]{5,100})<\/div>/i,
                  /<div[^>]*class=["'][^"']*writer[^"']*["'][^>]*>([\s\S]{5,100})<\/div>/i,
                  /<div[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]{5,100})<\/div>/i,
                ];
                for (const pattern of authorDivPatterns) {
                  const match = html.match(pattern);
                  if (match && match[1]) {
                    const extracted = extractTextFromHTML(match[1], 50);
                    if (extracted.length > 2 && extracted.length < 30 && !extracted.includes("@") && !extracted.includes("http")) {
                      metaData.author = extracted.trim().replace(/\|/g, '').trim();
                      break;
                    }
                  }
                }
              }
              
              // 10. 블로그 ID에서 추출 (마지막 수단)
              if (!metaData.author && blogInfo) {
                // 블로그 ID를 작성자로 사용 (일부 경우)
                metaData.author = blogInfo.blogId;
              }
              
              // 최종적으로 "|" 문자 및 "네이버 블로그" 텍스트 제거
              if (metaData.author) {
                metaData.author = metaData.author
                  .replace(/네이버 블로그\s*\|\s*/gi, '') // "네이버 블로그 |" 제거
                  .replace(/\|\s*네이버 블로그/gi, '') // "| 네이버 블로그" 제거
                  .replace(/네이버 블로그/gi, '') // "네이버 블로그" 제거
                  .replace(/\|/g, '') // "|" 문자 제거
                  .trim();
              }
              
              console.log("Naver blog author extraction result:", metaData.author);
            }

            // 네이버 블로그 본문에서 내용 추출 (여러 패턴 시도)
            if (!metaData.excerpt) {
              // 1. og:description에서 찾기
              const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
              if (ogDescMatch && ogDescMatch[1]) {
                metaData.excerpt = truncateText(ogDescMatch[1], 200);
              }
              
              // 2. se-main-container (네이버 블로그 에디터 본문)
              if (!metaData.excerpt) {
                const seMainMatch = html.match(/<div[^>]*class=["'][^"']*se-main-container[^"']*["'][^>]*>([\s\S]{100,5000})<\/div>/i);
                if (seMainMatch && seMainMatch[1]) {
                  const extracted = extractTextFromHTML(seMainMatch[1], 200);
                  if (extracted.length > 30) {
                    metaData.excerpt = extracted;
                  }
                }
              }
              
              // 3. postViewArea
              if (!metaData.excerpt) {
                const postViewMatch = html.match(/<div[^>]*id=["']postViewArea["'][^>]*>([\s\S]{100,5000})<\/div>/i);
                if (postViewMatch && postViewMatch[1]) {
                  const extracted = extractTextFromHTML(postViewMatch[1], 200);
                  if (extracted.length > 30) {
                    metaData.excerpt = extracted;
                  }
                }
              }
              
              // 4. se-component-content (네이버 블로그 컴포넌트)
              if (!metaData.excerpt) {
                const seComponentMatch = html.match(/<div[^>]*class=["'][^"']*se-component-content[^"']*["'][^>]*>([\s\S]{100,3000})<\/div>/i);
                if (seComponentMatch && seComponentMatch[1]) {
                  const extracted = extractTextFromHTML(seComponentMatch[1], 200);
                  if (extracted.length > 30) {
                    metaData.excerpt = extracted;
                  }
                }
              }
              
              // 5. article 태그
              if (!metaData.excerpt) {
                const articleMatch = html.match(/<article[^>]*>([\s\S]{100,5000})<\/article>/i);
                if (articleMatch && articleMatch[1]) {
                  const extracted = extractTextFromHTML(articleMatch[1], 200);
                  if (extracted.length > 30) {
                    metaData.excerpt = extracted;
                  }
                }
              }
            }

            // API 데이터와 직접 파싱 데이터 병합 (API 데이터 우선, author는 직접 파싱 결과 사용)
            let finalAuthor = metaData.author || apiData?.author || null;
            // 최종적으로 작성자에서 "|" 문자 및 "네이버 블로그" 텍스트 제거
            if (finalAuthor) {
              finalAuthor = finalAuthor
                .replace(/네이버 블로그\s*\|\s*/gi, '') // "네이버 블로그 |" 제거
                .replace(/\|\s*네이버 블로그/gi, '') // "| 네이버 블로그" 제거
                .replace(/네이버 블로그/gi, '') // "네이버 블로그" 제거
                .replace(/\|/g, '') // "|" 문자 제거
                .trim();
            }
            
            const mergedData = {
              title: apiData?.title || metaData.title || null,
              excerpt: apiData?.excerpt || metaData.excerpt || null,
              thumbnailUrl: apiData?.thumbnailUrl || metaData.thumbnailUrl || null,
              author: finalAuthor,
            };
            
            if (mergedData.title || mergedData.thumbnailUrl || mergedData.excerpt || mergedData.author) {
              console.log("Found Naver blog data (merged):", {
                ...mergedData,
                author: mergedData.author || "(없음)",
              });
              return NextResponse.json(mergedData);
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
        author: null,
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

    // 네이버 카페 작성자 찾기 (다양한 패턴 시도)
    if (targetUrl.includes("cafe.naver.com") && !metaData.author) {
      // 1. 닉네임 클래스 (네이버 카페)
      const nicknameMatch = html.match(/<span[^>]*class=["'][^"']*nickname[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
      if (nicknameMatch && nicknameMatch[1]) {
        metaData.author = extractTextFromHTML(nicknameMatch[1], 50).trim().replace(/\|/g, '').trim();
      }
      
      // 2. writer 클래스
      if (!metaData.author) {
        const writerMatch = html.match(/<span[^>]*class=["'][^"']*writer[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        if (writerMatch && writerMatch[1]) {
          metaData.author = extractTextFromHTML(writerMatch[1], 50).trim().replace(/\|/g, '').trim();
        }
      }
      
      // 3. author 클래스
      if (!metaData.author) {
        const authorMatch = html.match(/<span[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        if (authorMatch && authorMatch[1]) {
          metaData.author = extractTextFromHTML(authorMatch[1], 50).trim().replace(/\|/g, '').trim();
        }
      }
      
      // 4. 닉네임 데이터 속성
      if (!metaData.author) {
        const nicknameDataMatch = html.match(/data-nickname=["']([^"']+)["']/i);
        if (nicknameDataMatch && nicknameDataMatch[1]) {
          metaData.author = nicknameDataMatch[1].trim().replace(/\|/g, '').trim();
        }
      }
      
      // 5. 작성자 정보가 포함된 div 찾기
      if (!metaData.author) {
        const authorDivMatch = html.match(/<div[^>]*class=["'][^"']*author[^"']*["'][^>]*>([\s\S]{10,200})<\/div>/i);
        if (authorDivMatch && authorDivMatch[1]) {
          const extracted = extractTextFromHTML(authorDivMatch[1], 50);
          if (extracted.length > 2 && extracted.length < 30) {
            metaData.author = extracted.trim().replace(/\|/g, '').trim();
          }
        }
      }
      
      // 6. 작성자 영역 전체 검색
      if (!metaData.author) {
        const writerAreaMatch = html.match(/<div[^>]*class=["'][^"']*writer[^"']*["'][^>]*>([\s\S]{10,300})<\/div>/i);
        if (writerAreaMatch && writerAreaMatch[1]) {
          const extracted = extractTextFromHTML(writerAreaMatch[1], 50);
          if (extracted.length > 2 && extracted.length < 30) {
            metaData.author = extracted.trim().replace(/\|/g, '').trim();
          }
        }
      }
      
      // 최종적으로 "|" 문자 및 "네이버 블로그" 텍스트 제거
      if (metaData.author) {
        metaData.author = metaData.author
          .replace(/네이버 블로그\s*\|\s*/gi, '') // "네이버 블로그 |" 제거
          .replace(/\|\s*네이버 블로그/gi, '') // "| 네이버 블로그" 제거
          .replace(/네이버 블로그/gi, '') // "네이버 블로그" 제거
          .replace(/\|/g, '') // "|" 문자 제거
          .trim();
      }
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

    // 최종적으로 작성자에서 "|" 문자 및 "네이버 블로그" 텍스트 제거
    if (metaData.author) {
      metaData.author = metaData.author
        .replace(/네이버 블로그\s*\|\s*/gi, '') // "네이버 블로그 |" 제거
        .replace(/\|\s*네이버 블로그/gi, '') // "| 네이버 블로그" 제거
        .replace(/네이버 블로그/gi, '') // "네이버 블로그" 제거
        .replace(/\|/g, '') // "|" 문자 제거
        .trim();
    }
    
    console.log("Final parsed data:", JSON.stringify(metaData, null, 2));
    console.log("Author extracted:", metaData.author, "Type:", typeof metaData.author);
    
    // 최소한 하나의 데이터라도 있는지 확인 (작성자 포함)
    if (metaData.title || metaData.thumbnailUrl || metaData.excerpt || metaData.author) {
      const responseData = {
        thumbnailUrl: metaData.thumbnailUrl || null,
        title: metaData.title || null,
        excerpt: metaData.excerpt || null,
        author: metaData.author || null, // 명시적으로 null로 설정
      };
      console.log("Returning final parsed response with author:", responseData.author, "Type:", typeof responseData.author);
      return NextResponse.json(responseData);
    }
    
    // 데이터가 없어도 에러가 아닌 경우 (정상 응답)
    return NextResponse.json({
      thumbnailUrl: null,
      title: null,
      excerpt: null,
      author: null,
      message: "페이지에서 정보를 찾을 수 없습니다. 수동으로 입력해주세요.",
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    
    // 에러 발생 시에도 서드파티 API 한 번 더 시도
    try {
      const apiData = await fetchDataFromAPI(url);
      if (apiData && (apiData.title || apiData.thumbnailUrl || apiData.excerpt)) {
        console.log("Using API data after error:", apiData);
        return NextResponse.json(apiData);
      }
    } catch (apiError) {
      console.error("API fallback also failed:", apiError);
    }
    
    return NextResponse.json(
      { 
        thumbnailUrl: null,
        title: null,
        excerpt: null,
        author: null,
        error: "데이터를 가져오는데 실패했습니다.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
