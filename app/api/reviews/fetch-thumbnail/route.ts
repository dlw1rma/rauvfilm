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

    // HTML 가져오기
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();

    // Open Graph 이미지 추출
    const ogImageMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
    );
    if (ogImageMatch && ogImageMatch[1]) {
      return NextResponse.json({ thumbnailUrl: ogImageMatch[1] });
    }

    // Twitter Card 이미지 추출
    const twitterImageMatch = html.match(
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i
    );
    if (twitterImageMatch && twitterImageMatch[1]) {
      return NextResponse.json({ thumbnailUrl: twitterImageMatch[1] });
    }

    // 일반 메타 이미지 추출
    const metaImageMatch = html.match(
      /<meta\s+name=["']image["']\s+content=["']([^"']+)["']/i
    );
    if (metaImageMatch && metaImageMatch[1]) {
      return NextResponse.json({ thumbnailUrl: metaImageMatch[1] });
    }

    // 네이버 블로그 특별 처리
    if (targetUrl.includes("blog.naver.com")) {
      // 네이버 블로그는 특별한 방식으로 썸네일을 가져올 수 있습니다
      // 여기서는 기본 이미지나 null을 반환
      return NextResponse.json({ thumbnailUrl: null });
    }

    // 이미지를 찾지 못한 경우
    return NextResponse.json({ thumbnailUrl: null });
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return NextResponse.json(
      { error: "썸네일을 가져오는데 실패했습니다.", thumbnailUrl: null },
      { status: 500 }
    );
  }
}
