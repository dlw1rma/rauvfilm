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

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is not set");
    // API 키가 없으면 기본값 반환
    return NextResponse.json({
      width: 1280,
      height: 720,
      aspectRatio: 16 / 9,
    });
  }

  try {
    // YouTube Data API v3를 사용하여 영상 정보 가져오기
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=player,snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = data.items[0];
    let width = 1280;
    let height = 720;
    let aspectRatio = 16 / 9;

    // player.embedWidth와 embedHeight 사용
    if (video.player?.embedWidth && video.player?.embedHeight) {
      width = parseInt(video.player.embedWidth);
      height = parseInt(video.player.embedHeight);
      aspectRatio = width / height;
    } else if (video.snippet?.thumbnails?.maxres) {
      // player 정보가 없으면 썸네일 비율 사용
      const thumbnail = video.snippet.thumbnails.maxres;
      width = thumbnail.width;
      height = thumbnail.height;
      aspectRatio = width / height;
    } else if (video.snippet?.thumbnails?.standard) {
      const thumbnail = video.snippet.thumbnails.standard;
      width = thumbnail.width;
      height = thumbnail.height;
      aspectRatio = width / height;
    } else if (video.snippet?.thumbnails?.high) {
      const thumbnail = video.snippet.thumbnails.high;
      width = thumbnail.width;
      height = thumbnail.height;
      aspectRatio = width / height;
    }

    return NextResponse.json({
      width,
      height,
      aspectRatio,
    });
  } catch (error) {
    console.error("Error fetching YouTube video details:", error);
    // 기본값 반환 (16:9)
    return NextResponse.json({
      width: 1280,
      height: 720,
      aspectRatio: 16 / 9,
    });
  }
}
