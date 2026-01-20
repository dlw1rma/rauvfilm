import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";

/**
 * YouTube 채널에서 모든 영상을 가져와 포트폴리오에 동기화
 * YouTube Data API v3 사용
 */

// YouTube Data API를 사용하여 채널의 영상 목록 가져오기
async function fetchYouTubeChannelVideos(
  channelHandle: string,
  apiKey: string
): Promise<any[]> {
  try {
    // 1. 채널 핸들에서 채널 ID 가져오기
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${channelHandle}&key=${apiKey}`
    );

    if (!channelResponse.ok) {
      throw new Error("채널 정보를 가져오는데 실패했습니다.");
    }

    const channelData = await channelResponse.json();
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error("채널을 찾을 수 없습니다.");
    }

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. 업로드된 영상 목록 가져오기
    const videos: any[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const baseUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
      const playlistUrl: string = nextPageToken 
        ? `${baseUrl}&pageToken=${nextPageToken}`
        : baseUrl;

      const playlistResponse = await fetch(playlistUrl);
      if (!playlistResponse.ok) {
        throw new Error("영상 목록을 가져오는데 실패했습니다.");
      }

      const playlistData = await playlistResponse.json();

      // 영상 ID 목록 수집
      const videoIds: string[] = [];
      for (const item of playlistData.items) {
        videoIds.push(item.snippet.resourceId.videoId);
      }

      // 영상 상세 정보 가져오기 (duration 포함)
      if (videoIds.length > 0) {
        const videoIdsString = videoIds.join(",");
        const videoDetailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIdsString}&key=${apiKey}`
        );

        if (videoDetailsResponse.ok) {
          const videoDetailsData = await videoDetailsResponse.json();
          
          for (const videoDetail of videoDetailsData.items || []) {
            const videoId = videoDetail.id;
            const title = videoDetail.snippet.title;
            const description = videoDetail.snippet.description;
            const publishedAt = videoDetail.snippet.publishedAt;
            
            // Duration 파싱 (ISO 8601 형식: PT1M30S -> 90초)
            const duration = videoDetail.contentDetails?.duration || "";
            const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            let durationInSeconds = 0;
            if (durationMatch) {
              const hours = parseInt(durationMatch[1] || "0", 10);
              const minutes = parseInt(durationMatch[2] || "0", 10);
              const seconds = parseInt(durationMatch[3] || "0", 10);
              durationInSeconds = hours * 3600 + minutes * 60 + seconds;
            }

            // 쇼츠 영상 제외 (60초 이하)
            if (durationInSeconds > 0 && durationInSeconds <= 60) {
              continue;
            }

            videos.push({
              videoId,
              title,
              description,
              publishedAt,
              youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
              duration: durationInSeconds,
            });
          }
        }
      }

      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken);

    return videos;
  } catch (error) {
    console.error("YouTube API Error:", error);
    throw error;
  }
}

// 환경변수에서 YouTube API 키 가져오기 (보안 강화)
function getYouTubeApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "YOUTUBE_API_KEY 환경변수가 설정되지 않았습니다. 프로덕션 환경에서는 반드시 환경변수로 설정해야 합니다."
    );
  }
  return apiKey;
}

// POST: YouTube 채널 동기화
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const prisma = getPrisma();
    const body = await request.json();
    const { channelHandle, category } = body;

    if (!channelHandle) {
      return NextResponse.json(
        { error: "채널 핸들이 필요합니다. (예: rauvfilm_Cine)" },
        { status: 400 }
      );
    }

    // 환경변수에서 API 키 가져오기 (보안 강화)
    const apiKey = getYouTubeApiKey();

    // YouTube 채널에서 영상 목록 가져오기
    const youtubeVideos = await fetchYouTubeChannelVideos(
      channelHandle,
      apiKey
    );

    if (youtubeVideos.length === 0) {
      return NextResponse.json(
        { error: "가져올 영상이 없습니다." },
        { status: 404 }
      );
    }

    // 기존 포트폴리오 조회 (중복 체크용)
    const existingPortfolios = await prisma.portfolio.findMany({
      select: { youtubeUrl: true },
    });
    const existingUrls = new Set(
      existingPortfolios.map((p) => p.youtubeUrl)
    );

    // 가장 큰 order 값 조회
    const maxOrder = await prisma.portfolio.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    let currentOrder = (maxOrder?.order || 0) + 1;
    let addedCount = 0;
    let skippedCount = 0;

    // 영상들을 DB에 추가
    for (const video of youtubeVideos) {
      // 이미 존재하는 영상은 건너뛰기
      if (existingUrls.has(video.youtubeUrl)) {
        skippedCount++;
        continue;
      }

      await prisma.portfolio.create({
        data: {
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          description: video.description || null,
          category: category || "가성비형",
          featured: false,
          order: currentOrder++,
          isVisible: true,
        },
      });

      addedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `총 ${youtubeVideos.length}개의 영상 중 ${addedCount}개가 추가되었습니다. (${skippedCount}개는 이미 존재함)`,
      added: addedCount,
      skipped: skippedCount,
      total: youtubeVideos.length,
    });
  } catch (error: any) {
    console.error("YouTube sync error:", error);
    
    // API 키 관련 에러는 상세 정보 숨김
    if (error.message?.includes("YOUTUBE_API_KEY")) {
      return NextResponse.json(
        {
          error: "YouTube API 키가 설정되지 않았습니다. 서버 관리자에게 문의하세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "YouTube 동기화에 실패했습니다.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
