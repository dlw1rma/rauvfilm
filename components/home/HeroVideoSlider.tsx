"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroVideoSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopVideoId = "sfKkrvLg_7g";
  const mobileVideoId = "6GEYb31W9go";

  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 스크롤 진행도 추적
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // 각 텍스트의 opacity를 스크롤 진행도에 따라 제어
  const line1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [0, 0, 1]);
  const line2Opacity = useTransform(scrollYProgress, [0.2, 0.35, 0.45], [0, 0, 1]);
  const line3Opacity = useTransform(scrollYProgress, [0.4, 0.55, 0.65], [0, 0, 1]);

  // 텍스트 Y 위치 (살짝 위로 올라오는 효과)
  const line1Y = useTransform(scrollYProgress, [0, 0.15, 0.25], [40, 40, 0]);
  const line2Y = useTransform(scrollYProgress, [0.2, 0.35, 0.45], [40, 40, 0]);
  const line3Y = useTransform(scrollYProgress, [0.4, 0.55, 0.65], [40, 40, 0]);

  // 스크롤 유도 아이콘 투명도 (스크롤 시작하면 사라짐)
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

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
  }, []);

  const currentDimensions = isMobile ? mobileVideoDimensions : desktopVideoDimensions;

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      {/* 고정 배경 영상 */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video Background */}
        <div
          style={currentDimensions ? {
            aspectRatio: `${currentDimensions.width} / ${currentDimensions.height}`,
            width: "100vw",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            height: "auto",
            minHeight: "100%",
            position: "absolute"
          } : {
            width: "100vw",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            minHeight: "100%",
            position: "absolute"
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
        </div>

        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 텍스트 컨테이너 */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            style={{ opacity: line1Opacity, y: line1Y }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4"
          >
            소중한 날의 기억들을
          </motion.h1>

          <motion.h1
            style={{ opacity: line2Opacity, y: line2Y }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8"
          >
            영원히 간직하세요
          </motion.h1>

          <motion.p
            style={{ opacity: line3Opacity, y: line3Y }}
            className="text-base md:text-lg lg:text-xl text-white/80"
          >
            &apos;기록&apos;이 아닌 &apos;기억&apos;을 남기는 영상을 선사합니다.
          </motion.p>
        </div>

        {/* 스크롤 유도 (초반에만 표시) */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white/60 text-sm flex flex-col items-center"
          >
            <span className="text-xs tracking-[0.3em] uppercase mb-2">Scroll</span>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
