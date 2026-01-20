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
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);
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
      <div className="min-h-screen py-20 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">포트폴리오</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              라우브필름이 제작한 웨딩 영상들을 감상해보세요.
              <br />
              각 영상을 클릭하면 재생됩니다.
            </p>
          </div>

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
                    onClick={async () => {
                      // 서버 사이드 API로 실제 영상 비율 가져오기
                      try {
                        const response = await fetch(`/api/youtube/oembed?videoId=${item.videoId}`);
                        if (response.ok) {
                          const data = await response.json();
                          setVideoAspectRatio(data.aspectRatio);
                        } else {
                          setVideoAspectRatio(16 / 9);
                        }
                      } catch (error) {
                        console.error("Error fetching video aspect ratio:", error);
                        setVideoAspectRatio(16 / 9);
                      }
                      setSelectedVideo({ videoId: item.videoId, title: item.title });
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

            {/* Video Player - 동적 비율, 화면에 꽉 차게 */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{ 
                maxWidth: "95vw",
                maxHeight: "95vh"
              }}
            >
              <div
                className="relative w-full"
                style={{ 
                  aspectRatio: videoAspectRatio,
                  maxWidth: "100%",
                  maxHeight: "95vh"
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&controls=1&showinfo=0&modestbranding=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-lg"
                  style={{ border: "none" }}
                />
              </div>
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
