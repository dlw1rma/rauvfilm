import { NextRequest, NextResponse } from "next/server";

/**
 * 블로그/카페 링크에서 썸네일 이미지 URL 추출
 * Open Graph 메타 태그나 다른 메타 태그에서 이미지 URL을 가져옵니다.
 */
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

    console.log("Fetching thumbnail from URL:", targetUrl);

    // HTML 가져오기
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
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    console.log("HTML length:", html.length);

    // 1. Open Graph 이미지 추출 (가장 우선)
    const ogImagePatterns = [
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
    ];
    
    for (const pattern of ogImagePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const imageUrl = match[1].trim();
        console.log("Found og:image:", imageUrl);
        if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
          return NextResponse.json({ thumbnailUrl: imageUrl });
        }
      }
    }

    // 2. Twitter Card 이미지 추출
    const twitterImagePatterns = [
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
    ];
    
    for (const pattern of twitterImagePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const imageUrl = match[1].trim();
        console.log("Found twitter:image:", imageUrl);
        if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
          return NextResponse.json({ thumbnailUrl: imageUrl });
        }
      }
    }

    // 3. 네이버 블로그/카페 특별 처리
    if (targetUrl.includes("blog.naver.com") || targetUrl.includes("cafe.naver.com")) {
      console.log("Processing Naver blog/cafe URL");
      
      // 네이버 블로그/카페의 다양한 이미지 패턴 시도
      const naverImagePatterns = [
        // postfiles.pstatic.net 이미지
        /(https?:\/\/postfiles\.pstatic\.net\/[^"'\s<>]+)/gi,
        // blogfiles.pstatic.net 이미지
        /(https?:\/\/blogfiles\.pstatic\.net\/[^"'\s<>]+)/gi,
        // img 태그에서 postfiles.pstatic.net 찾기
        /<img[^>]+src=["']([^"']*postfiles\.pstatic\.net[^"']*)["']/gi,
        // img 태그에서 blogfiles.pstatic.net 찾기
        /<img[^>]+src=["']([^"']*blogfiles\.pstatic\.net[^"']*)["']/gi,
        // data-src 속성 (lazy loading)
        /<img[^>]+data-src=["']([^"']*postfiles\.pstatic\.net[^"']*)["']/gi,
        /<img[^>]+data-src=["']([^"']*blogfiles\.pstatic\.net[^"']*)["']/gi,
        // background-image 스타일
        /background-image:\s*url\(["']?([^"')]*postfiles\.pstatic\.net[^"')]*)["']?\)/gi,
        /background-image:\s*url\(["']?([^"')]*blogfiles\.pstatic\.net[^"')]*)["']?\)/gi,
      ];

      for (const pattern of naverImagePatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          if (match[1] || match[0]) {
            let imageUrl = (match[1] || match[0]).trim();
            
            // URL 정리
            if (imageUrl.startsWith("//")) {
              imageUrl = `https:${imageUrl}`;
            } else if (imageUrl.startsWith("/")) {
              imageUrl = `https://blog.naver.com${imageUrl}`;
            }
            
            // URL 유효성 검사
            if (imageUrl && 
                (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) &&
                (imageUrl.includes("postfiles.pstatic.net") || imageUrl.includes("blogfiles.pstatic.net"))) {
              // 쿼리 파라미터나 앵커 제거
              imageUrl = imageUrl.split("?")[0].split("#")[0];
              
              console.log("Found Naver image:", imageUrl);
              return NextResponse.json({ thumbnailUrl: imageUrl });
            }
          }
        }
      }

      // 네이버 블로그의 og:image에서 postfiles.pstatic.net 찾기
      const naverOgImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*postfiles\.pstatic\.net[^"']*)["']/i);
      if (naverOgImageMatch && naverOgImageMatch[1]) {
        console.log("Found Naver og:image:", naverOgImageMatch[1]);
        return NextResponse.json({ thumbnailUrl: naverOgImageMatch[1] });
      }

      // 네이버 블로그의 og:image에서 blogfiles.pstatic.net 찾기
      const naverOgImageMatch2 = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*blogfiles\.pstatic\.net[^"']*)["']/i);
      if (naverOgImageMatch2 && naverOgImageMatch2[1]) {
        console.log("Found Naver og:image (blogfiles):", naverOgImageMatch2[1]);
        return NextResponse.json({ thumbnailUrl: naverOgImageMatch2[1] });
      }

      console.log("No Naver image found");
    }

    // 4. 일반 메타 이미지 추출
    const metaImageMatch = html.match(
      /<meta\s+name=["']image["']\s+content=["']([^"']+)["']/i
    );
    if (metaImageMatch && metaImageMatch[1]) {
      const imageUrl = metaImageMatch[1].trim();
      if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
        console.log("Found meta image:", imageUrl);
        return NextResponse.json({ thumbnailUrl: imageUrl });
      }
    }

    // 5. 일반 img 태그에서 첫 번째 이미지 찾기 (최후의 수단)
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
        console.log("Found first img tag:", imageUrl);
        return NextResponse.json({ thumbnailUrl: imageUrl });
      }
    }

    // 이미지를 찾지 못한 경우
    console.log("No image found in HTML");
    return NextResponse.json({ thumbnailUrl: null, message: "이미지를 찾을 수 없습니다." });
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return NextResponse.json(
      { 
        error: "썸네일을 가져오는데 실패했습니다.", 
        thumbnailUrl: null,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
