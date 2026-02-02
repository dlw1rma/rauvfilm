"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Portfolio } from "@prisma/client";

interface PortfolioItem {
  id: number;
  title: string;
  videoId: string;
  category: string;
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

export default function PortfolioPageClient() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string; aspectRatio?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

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
            thumbnailUrl: p.thumbnailUrl,
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
  const desktopHeroVideoId = "IbiUX6n7eEM";
  // 모바일용 세로형 영상 ID (필요시 변경)
  const mobileHeroVideoId = "6GEYb31W9go";
  
  const [desktopHeroVideoDimensions, setDesktopHeroVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileHeroVideoDimensions, setMobileHeroVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일/데스크톱 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // 데스크톱용 영상 비율 가져오기
    fetch(`/api/youtube/video-details?videoId=${desktopHeroVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setDesktopHeroVideoDimensions({ width: data.width, height: data.height });
      })
      .catch((error) => {
        console.error("Error fetching desktop hero video dimensions:", error);
        setDesktopHeroVideoDimensions({ width: 1280, height: 720 });
      });

    // 모바일용 영상 비율 가져오기
    fetch(`/api/youtube/video-details?videoId=${mobileHeroVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setMobileHeroVideoDimensions({ width: data.width, height: data.height });
      })
      .catch((error) => {
        console.error("Error fetching mobile hero video dimensions:", error);
        setMobileHeroVideoDimensions({ width: 720, height: 1280 });
      });
  }, [desktopHeroVideoId, mobileHeroVideoId]);

  // 현재 사용할 영상 정보
  const currentHeroVideoId = isMobile ? mobileHeroVideoId : desktopHeroVideoId;
  const currentHeroVideoDimensions = isMobile ? mobileHeroVideoDimensions : desktopHeroVideoDimensions;

  // 원본 비율 기반 aspect ratio
  const heroAspectRatio = currentHeroVideoDimensions
    ? `${currentHeroVideoDimensions.width} / ${currentHeroVideoDimensions.height}`
    : isMobile ? "9 / 16" : "16 / 9";

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "가성비형":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "기본형":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "시네마틱형":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-accent/10 text-accent border-accent/30";
    }
  };

  // 카테고리 목록 추출
  const categories = ["전체", ...Array.from(new Set(portfolioItems.map(item => item.category)))];

  // 필터링 (카테고리 + 검색)
  const filteredItems = portfolioItems.filter((item) => {
    // 카테고리 필터
    if (selectedCategory !== "전체" && item.category !== selectedCategory) {
      return false;
    }
    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
        {/* Hero Video Section - 원본 비율 유지 */}
        <section className="relative w-full bg-black mb-16">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: heroAspectRatio }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${currentHeroVideoId}?autoplay=1&mute=1&loop=1&playlist=${currentHeroVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title={isMobile ? "Portfolio Hero Video Mobile" : "Portfolio Hero Video Desktop"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ border: "none" }}
              allowFullScreen
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            {/* Content - Left Aligned */}
            <div className="absolute inset-0 z-10 flex items-center">
              <div className="container mx-auto px-6 md:px-12 lg:px-16">
                <div className="max-w-2xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg mb-6"
                  >
                    PORTFOLIO
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="space-y-2 text-white/90 text-sm md:text-base lg:text-lg leading-relaxed drop-shadow-md"
                  >
                    <p>상품 종류, 커스텀 여부를 잘 확인해주세요!</p>
                    <p>대표와 수석실장 촬영만이</p>
                    <p>짐벌(움직임이 있는) 커스텀 촬영으로 진행 가능하며</p>
                    <p>이외 촬영은 움직임이 없이 촬영됩니다.</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* 스크롤 유도 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <motion.span
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[10px] text-white/50 tracking-[0.25em] uppercase mb-2"
                >
                  Scroll
                </motion.span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-5 h-5 text-white/50" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                >
                  <ChevronDown className="w-5 h-5 text-white/30 -mt-3" />
                </motion.div>
              </motion.div>
            </div>

            {/* 하단 페이드 */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111111] to-transparent z-10" />
          </div>
        </section>

        <div className="py-20 px-4">
          <div className="mx-auto max-w-7xl">
            {/* Category Filter - Minimal Underline Style */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-8 md:gap-12 border-b border-border">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative pb-4 text-sm md:text-base font-medium tracking-wide transition-colors ${
                      selectedCategory === category
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                    {/* Active Indicator */}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 transition-transform duration-300 origin-center ${
                        selectedCategory === category
                          ? "bg-accent scale-x-100"
                          : "bg-transparent scale-x-0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="제목으로 검색..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="검색어 지우기"
                  >
                    <svg
                      className="h-5 w-5"
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
                )}
              </div>
              {(searchQuery || selectedCategory !== "전체") && (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  {filteredItems.length}개의 결과를 찾았습니다
                </p>
              )}
            </div>

            {/* Video Grid */}
            {portfolioItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">등록된 포트폴리오가 없습니다.</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                검색어 지우기
              </button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                // DB에 저장된 썸네일이 있으면 우선 사용, 없으면 YouTube 썸네일 사용
                const thumbnailUrl = item.thumbnailUrl || getYoutubeThumbnail(item.videoId, 'maxres');
                
                return (
                  <div
                    key={item.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      const vid = { videoId: item.videoId, title: item.title, aspectRatio: "16 / 9" };
                      setSelectedVideo(vid);
                      fetch(`/api/youtube/video-details?videoId=${item.videoId}`)
                        .then(r => r.json())
                        .then(d => {
                          if (d.width && d.height) {
                            setSelectedVideo(prev => prev?.videoId === item.videoId ? { ...prev, aspectRatio: `${d.width} / ${d.height}` } : prev);
                          }
                        })
                        .catch(() => {});
                    }}
                  >
                    {/* Thumbnail - 박스형 디자인 제거, 깔끔한 디자인 */}
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-accent/20">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            // 썸네일 로딩 실패 시 YouTube 기본 썸네일로 대체
                            const target = e.target as HTMLImageElement;
                            target.src = getYoutubeThumbnail(item.videoId, 'hq');
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-muted to-background flex items-center justify-center">
                          <svg className="w-16 h-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.258.232-.423.557-.328l5.603 3.112z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Category & Title - Minimal Style */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-base font-medium group-hover:text-accent transition-colors line-clamp-2">
                        {item.title}
                      </h3>
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

            {/* Video Player - 모달 플레이어 (영상 비율에 맞춤) */}
            <div
              className="relative max-w-5xl w-full"
              style={{
                aspectRatio: selectedVideo.aspectRatio || "16 / 9",
                maxHeight: "85vh",
                maxWidth: selectedVideo.aspectRatio && parseFloat(selectedVideo.aspectRatio.split("/")[0]) < parseFloat(selectedVideo.aspectRatio.split("/")[1]) ? "400px" : undefined,
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
