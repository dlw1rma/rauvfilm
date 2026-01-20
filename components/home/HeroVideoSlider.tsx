"use client";

import { useState, useEffect } from "react";

export default function HeroVideoSlider() {
  // 데스크톱용 가로형 영상 ID
  const desktopVideoId = "sfKkrvLg_7g";
  // 모바일용 세로형 영상 ID (필요시 변경)
  const mobileVideoId = "6GEYb31W9go";
  
  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
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
    fetch(`/api/youtube/video-details?videoId=${desktopVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setDesktopVideoDimensions({ width: data.width, height: data.height });
      })
      .catch((error) => {
        console.error("Error fetching desktop video dimensions:", error);
        setDesktopVideoDimensions({ width: 1280, height: 720 });
      });

    // 모바일용 영상 비율 가져오기
    fetch(`/api/youtube/video-details?videoId=${mobileVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setMobileVideoDimensions({ width: data.width, height: data.height });
      })
      .catch((error) => {
        console.error("Error fetching mobile video dimensions:", error);
        setMobileVideoDimensions({ width: 720, height: 1280 });
      });
  }, [desktopVideoId, mobileVideoId]);

  // 현재 사용할 영상 정보
  const currentVideoId = isMobile ? mobileVideoId : desktopVideoId;
  const currentDimensions = isMobile ? mobileVideoDimensions : desktopVideoDimensions;

  return (
    <section className="relative w-full h-[80vh] min-h-[700px] overflow-hidden bg-black flex items-center">
      {/* Video Background - 배경 비디오 전용 (좌우 밀착 100vw, 수직 중앙 정렬) */}
      <div 
        className="bg-video-full absolute inset-0 overflow-hidden flex items-center justify-center"
        style={currentDimensions ? {
          aspectRatio: `${currentDimensions.width} / ${currentDimensions.height}`,
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
        {/* 데스크톱용 영상 (768px 이상) */}
        {!isMobile && (
          <iframe
            src={`https://www.youtube.com/embed/${desktopVideoId}?autoplay=1&mute=1&loop=1&playlist=${desktopVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title="Hero Video Desktop"
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
        )}
        
        {/* 모바일용 영상 (768px 미만) */}
        {isMobile && (
          <iframe
            src={`https://www.youtube.com/embed/${mobileVideoId}?autoplay=1&mute=1&loop=1&playlist=${mobileVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title="Hero Video Mobile"
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
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 z-0" />
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-10 h-full flex items-center w-full">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="max-w-xl">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg">
              소중한 날의 기억들을
              <br />
              영원히 간직하세요
            </h1>
            <p className="mt-4 text-xs md:text-sm lg:text-base text-white/80">
              &apos;기록&apos;이 아닌 &apos;기억&apos;을 남기는 영상을 선사합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  );
}
