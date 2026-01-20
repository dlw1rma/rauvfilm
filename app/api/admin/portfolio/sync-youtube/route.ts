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
      const baseUrl: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
      const playlistUrl: string = nextPageToken 
        ? `${baseUrl}&pageToken=${nextPageToken}`
        : baseUrl;

      const playlistResponse = await fetch(playlistUrl);
      if (!playlistResponse.ok) {
        throw new Error("영상 목록을 가져오는데 실패했습니다.");
      }

      const playlistData = await playlistResponse.json();

      for (const item of playlistData.items) {
        const videoId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        const publishedAt = item.snippet.publishedAt;

        videos.push({
          videoId,
          title,
          description,
          publishedAt,
          youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        });
      }

      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken);

    return videos;
  } catch (error) {
    console.error("YouTube API Error:", error);
    throw error;
  }
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
    const { channelHandle, apiKey, category } = body;

    if (!channelHandle) {
      return NextResponse.json(
        { error: "채널 핸들이 필요합니다. (예: rauvfilm_Cine)" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube Data API 키가 필요합니다." },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      {
        error: "YouTube 동기화에 실패했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
