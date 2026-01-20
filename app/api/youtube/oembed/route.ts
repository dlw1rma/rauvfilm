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
    // YouTube oEmbed API 호출
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch video info");
    }

    const data = await response.json();
    
    // width와 height로 비율 계산
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
