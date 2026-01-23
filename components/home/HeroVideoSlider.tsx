"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HeroVideoSlider() {
  // 데스크톱용 가로형 영상 ID
  const desktopVideoId = "sfKkrvLg_7g";
  // 모바일용 세로형 영상 ID
  const mobileVideoId = "6GEYb31W9go";

  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetch(`/api/youtube/video-details?videoId=${desktopVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setDesktopVideoDimensions({ width: data.width, height: data.height });
      })
      .catch(() => {
        setDesktopVideoDimensions({ width: 1280, height: 720 });
      });

    fetch(`/api/youtube/video-details?videoId=${mobileVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setMobileVideoDimensions({ width: data.width, height: data.height });
      })
      .catch(() => {
        setMobileVideoDimensions({ width: 720, height: 1280 });
      });
  }, [desktopVideoId, mobileVideoId]);

  const currentVideoId = isMobile ? mobileVideoId : desktopVideoId;
  const currentDimensions = isMobile ? mobileVideoDimensions : desktopVideoDimensions;

  // Scroll to next section
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-[#111111] flex items-center justify-center">
      {/* Video Background */}
      <div
        className="absolute inset-0 overflow-hidden"
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
        {/* Desktop Video */}
        {!isMobile && (
          <iframe
            src={`https://www.youtube.com/embed/${desktopVideoId}?autoplay=1&mute=1&loop=1&playlist=${desktopVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title="Hero Video Desktop"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              border: "none",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />
        )}

        {/* Mobile Video */}
        {isMobile && (
          <iframe
            src={`https://www.youtube.com/embed/${mobileVideoId}?autoplay=1&mute=1&loop=1&playlist=${mobileVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title="Hero Video Mobile"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              border: "none",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-0" />
      </div>

      {/* Content - Center Aligned with Animation */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight"
        >
          소중한 날의 기억들을
          <br />
          영원히 간직하세요
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-6 md:mt-8 text-base md:text-lg lg:text-xl text-white/70 font-light tracking-wide"
        >
          &apos;기록&apos;이 아닌 &apos;기억&apos;을 남기는 영상을 선사합니다.
        </motion.p>
      </div>

      {/* Scroll Indicator with Bounce Animation */}
      <motion.button
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer group"
        aria-label="Scroll down"
      >
        <span className="text-xs text-white/50 tracking-widest uppercase group-hover:text-white/70 transition-colors">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg
            className="w-6 h-6 text-white/50 group-hover:text-accent transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.div>
      </motion.button>
    </section>
  );
}
