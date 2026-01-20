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

    // Start scrolling
    animationId = requestAnimationFrame(scroll);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [portfolios]);

  // Duplicate items for seamless infinite scroll
  const items = portfolios.length > 0 ? [...portfolios, ...portfolios] : [];

  if (portfolios.length === 0) {
    return null;
  }

  return (
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
            onClick={() => {
              window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
            }}
          >
            {/* Card with Thumbnail */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-accent/20">
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

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Play Icon - Top Right */}
              <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-accent/80 transition-colors">
                <svg
                  className="w-5 h-5 text-white ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Text Overlay - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base md:text-lg leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
