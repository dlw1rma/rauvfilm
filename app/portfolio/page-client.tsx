"use client";

import { useState, useEffect } from "react";
import type { Portfolio } from "@prisma/client";

interface PortfolioItem {
  id: number;
  title: string;
  videoId: string;
  category: string;
}

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return url;
}

function getYoutubeThumbnail(youtubeId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
  if (!youtubeId) return '';
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`;
}

export default function PortfolioPageClient() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolios) {
          const items = data.portfolios.map((p: Portfolio) => ({
            id: p.id,
            title: p.title,
            videoId: extractVideoId(p.youtubeUrl),
            category: p.category,
          }));
          setPortfolioItems(items);
        }
      })
      .catch((error) => {
        console.error("Error fetching portfolios:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 히어로 비디오 ID
  const heroVideoId = "IbiUX6n7eEM";
  const [heroVideoDimensions, setHeroVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    // 히어로 비디오의 실제 비율 가져오기
    fetch(`/api/youtube/video-details?videoId=${heroVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setHeroVideoDimensions({ width: data.width, height: data.height });
      })
      .catch((error) => {
        console.error("Error fetching hero video dimensions:", error);
        setHeroVideoDimensions({ width: 1280, height: 720 });
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Video Section - 배경 비디오 전용 */}
        <section className="relative w-full h-[70vh] min-h-[600px] overflow-hidden bg-black mb-16 flex items-center justify-center">
          {/* Video Background - 좌우 밀착(100vw), 수직 중앙 정렬 */}
          <div 
            className="bg-video-full absolute inset-0 overflow-hidden flex items-center justify-center"
            style={heroVideoDimensions ? {
              aspectRatio: `${heroVideoDimensions.width} / ${heroVideoDimensions.height}`,
              width: "100vw",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              height: "auto",
              minHeight: "100%"
            } : {
              width: "100vw",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              minHeight: "100%"
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${heroVideoId}?autoplay=1&mute=1&loop=1&playlist=${heroVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title="Portfolio Hero Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute inset-0 w-full h-full"
              style={{ 
                border: "none",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
              }}
              allowFullScreen
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content - Left Aligned */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6 md:px-12 lg:px-16">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg mb-6">
                  PORTFOLIO
                </h1>
                <div className="space-y-2 text-white/90 text-sm md:text-base lg:text-lg leading-relaxed drop-shadow-md">
                  <p>상품 종류, 커스텀 여부를 잘 확인해주세요!</p>
                  <p>대표와 장 촬영만이</p>
                  <p>짐벌(움직임이 있는) 커스텀 촬영으로 진행 가능하며</p>
                  <p>이외 촬영은 움직임이 없이 촬영됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="py-20 px-4">
          <div className="mx-auto max-w-7xl">
            {/* Video Grid */}
            {portfolioItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">등록된 포트폴리오가 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioItems.map((item) => {
                const thumbnailUrl = getYoutubeThumbnail(item.videoId, 'maxres');
                
                return (
                  <div
                    key={item.id}
                    className="group rounded-xl border border-border bg-muted p-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer"
                    onClick={() => {
                      // 모달 플레이어는 기본 비율 사용 (API 호출 없음)
                      setSelectedVideo({ 
                        videoId: item.videoId, 
                        title: item.title
                      });
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-accent/20">
                      <img
                        src={thumbnailUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-1">
                      <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                        {item.category}
                      </span>
                      <h3 className="mt-2 font-medium">{item.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 text-white hover:text-accent transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video Player - 모달 플레이어 (기본 비율 유지) */}
            <div 
              className="relative max-w-5xl w-full"
              style={{ 
                aspectRatio: "16 / 9",
                maxHeight: "85vh"
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&controls=1&showinfo=0&modestbranding=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-lg"
                style={{ 
                  border: "none"
                }}
              />
            </div>

            {/* Video Title */}
            <h3 className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white text-lg font-medium max-w-4xl px-4">
              {selectedVideo.title}
            </h3>
          </div>
        </div>
      )}
    </>
  );
}
