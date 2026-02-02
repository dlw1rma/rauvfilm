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
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=player,snippet,contentDetails&id=${videoId}&key=${apiKey}&maxWidth=1920`;
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

    // player.embedHtml에서 실제 width/height 파싱 (가장 정확)
    if (video.player?.embedHtml) {
      const wMatch = video.player.embedHtml.match(/width="(\d+)"/);
      const hMatch = video.player.embedHtml.match(/height="(\d+)"/);
      if (wMatch && hMatch) {
        width = parseInt(wMatch[1]);
        height = parseInt(hMatch[1]);
      }
    }

    // Shorts 감지: 태그에 shorts 포함되거나, 설명에 #Shorts, 또는 duration이 60초 이하
    const tags = video.snippet?.tags || [];
    const description = video.snippet?.description || "";
    const isShorts = tags.some((t: string) => t.toLowerCase() === "shorts" || t.toLowerCase() === "#shorts")
      || description.toLowerCase().includes("#shorts");

    // contentDetails.duration으로 짧은 영상인지 확인 (PT1M 이하)
    const duration = video.contentDetails?.duration || "";
    const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const totalSeconds = durationMatch
      ? (parseInt(durationMatch[1] || "0") * 3600) + (parseInt(durationMatch[2] || "0") * 60) + parseInt(durationMatch[3] || "0")
      : 999;

    // Shorts 영상이거나 60초 이하 + 세로형 의심 → 9:16으로 설정
    if (isShorts || (totalSeconds <= 60 && width <= height)) {
      // embedHtml이 16:9로 나왔어도 Shorts면 9:16으로 강제
      if (width > height) {
        width = 1080;
        height = 1920;
      }
    }

    const aspectRatio = width / height;

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
