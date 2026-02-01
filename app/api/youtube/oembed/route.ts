import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json(
      { error: "videoId is required" },
      { status: 400 }
    );
  }

  try {
    // 먼저 video-details API로 정확한 비율 가져오기 시도
    const detailsUrl = new URL("/api/youtube/video-details", request.nextUrl.origin);
    detailsUrl.searchParams.set("videoId", videoId);
    const detailsRes = await fetch(detailsUrl.toString());
    if (detailsRes.ok) {
      const detailsData = await detailsRes.json();
      if (detailsData.width && detailsData.height) {
        return NextResponse.json({
          width: detailsData.width,
          height: detailsData.height,
          aspectRatio: detailsData.aspectRatio,
        });
      }
    }
  } catch {
    // video-details 실패 시 oEmbed로 폴백
  }

  try {
    // YouTube oEmbed API 호출 (폴백)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch video info");
    }

    const data = await response.json();

    // oEmbed는 항상 16:9 반환하므로 그대로 사용
    const aspectRatio = data.width / data.height;

    return NextResponse.json({
      width: data.width,
      height: data.height,
      aspectRatio,
    });
  } catch (error) {
    console.error("Error fetching YouTube oEmbed:", error);
    // 기본값 반환 (16:9)
    return NextResponse.json({
      width: 1280,
      height: 720,
      aspectRatio: 16 / 9,
    });
  }
}
