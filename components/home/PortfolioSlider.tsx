"use client";

import { useEffect, useRef, useState } from "react";

interface PortfolioItem {
  id: number;
  title: string;
  youtubeUrl: string;
  thumbnailUrl?: string | null;
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

export default function PortfolioSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string } | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9); // 기본값 16:9

  useEffect(() => {
    // DB에서 포트폴리오 데이터 가져오기
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolios) {
          setPortfolios(data.portfolios);
        }
      })
      .catch((error) => {
        console.error("Error fetching portfolios:", error);
      });
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || portfolios.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const scroll = () => {
      scrollPosition += speed;

      // Reset when we've scrolled half the content (since we duplicate it)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    // Start scrolling - hover 이벤트 제거하여 항상 스크롤
    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [portfolios]);

  // Duplicate items for seamless infinite scroll
  const items = portfolios.length > 0 ? [...portfolios, ...portfolios] : [];

  if (portfolios.length === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden py-4"
        style={{ scrollBehavior: "auto" }}
      >
        {items.map((item, index) => {
          const videoId = extractVideoId(item.youtubeUrl);
          const thumbnailUrl = item.thumbnailUrl || getYoutubeThumbnail(videoId, 'maxres');
          
          return (
            <div
              key={`${item.id}-${index}`}
              className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] group cursor-pointer"
              onClick={async () => {
                // 서버 사이드 API로 실제 영상 비율 가져오기
                try {
                  const response = await fetch(`/api/youtube/oembed?videoId=${videoId}`);
                  if (response.ok) {
                    const data = await response.json();
                    setVideoAspectRatio(data.aspectRatio);
                  } else {
                    // 실패 시 기본값 사용
                    setVideoAspectRatio(16 / 9);
                  }
                } catch (error) {
                  console.error("Error fetching video aspect ratio:", error);
                  setVideoAspectRatio(16 / 9);
                }
                setSelectedVideo({ videoId, title: item.title });
              }}
            >
              {/* Card with Thumbnail */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-accent/20">
                {/* Thumbnail Image */}
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
                )}
              </div>
              {/* Title Below Thumbnail */}
              <h3 className="text-xs md:text-sm text-muted-foreground text-center line-clamp-2">
                {item.title}
              </h3>
            </div>
          );
        })}
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
