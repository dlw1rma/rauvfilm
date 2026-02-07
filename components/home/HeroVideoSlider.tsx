"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface HeroVideoSliderProps {
  translations: {
    heroLine1: string;
    heroLine2: string;
    heroSubtitle: string;
  };
}

export default function HeroVideoSlider({ translations }: HeroVideoSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopVideoId = "sfKkrvLg_7g";
  const mobileVideoId = "nfnkQmSDiU8";

  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  // 스크롤 진행도 (0 ~ 1) - 헤더 높이(64px) 고려
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 64px", "end start"],
  });

  // ── Phase 1: 텍스트 등장 (스크롤 0~25%) ──
  const line1Opacity = useTransform(scrollYProgress, [0, 0.05, 0.10], [0, 1, 1]);
  const line1Y = useTransform(scrollYProgress, [0, 0.05, 0.10], [30, 0, 0]);
  const line1Filter = useTransform(scrollYProgress, [0, 0.05], ["blur(8px)", "blur(0px)"]);

  const line2Opacity = useTransform(scrollYProgress, [0.05, 0.10, 0.18], [0, 1, 1]);
  const line2Y = useTransform(scrollYProgress, [0.05, 0.10, 0.18], [30, 0, 0]);
  const line2Filter = useTransform(scrollYProgress, [0.05, 0.10], ["blur(8px)", "blur(0px)"]);

  const line3Opacity = useTransform(scrollYProgress, [0.10, 0.15, 0.25], [0, 1, 1]);
  const line3Y = useTransform(scrollYProgress, [0.10, 0.15, 0.25], [20, 0, 0]);


  // 스크롤 인디케이터
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
        setMobileVideoDimensions({ width: 1080, height: 1920 });
      });
  }, []);

  const currentDimensions = isMobile ? mobileVideoDimensions : desktopVideoDimensions;
  const currentVideoId = isMobile ? mobileVideoId : desktopVideoId;

  const aspectRatio = currentDimensions
    ? `${currentDimensions.width} / ${currentDimensions.height}`
    : isMobile ? "9 / 16" : "16 / 9";

  // 원본 비율 기반 높이 계산
  const videoAspect = currentDimensions
    ? currentDimensions.width / currentDimensions.height
    : isMobile ? 9 / 16 : 16 / 9;
  const naturalHeight = windowSize.w > 0 ? windowSize.w / videoAspect : windowSize.h || 800;

  // 전체 화면을 채우기 위한 스케일 (cover)
  const coverScale = windowSize.h > 0 && naturalHeight > 0
    ? Math.max(1, windowSize.h / naturalHeight)
    : 1;

  // 헤더 높이 (64px = 4rem = top-16)
  const HEADER_HEIGHT = 64;

  // 뷰포트 높이에서 헤더 높이를 뺀 실제 가용 높이
  const viewportHeight = windowSize.h > 0 ? windowSize.h - HEADER_HEIGHT : 736;

  // ── Phase 3: 비디오 전체화면 → 원본 비율 (스크롤 25~100%) ──
  // 애니메이션이 스크롤 끝에서 완료되어 다음 섹션이 바로 나옴
  const adjustedCoverScale = viewportHeight > 0 && naturalHeight > 0
    ? Math.max(1, viewportHeight / naturalHeight)
    : coverScale;

  const videoScale = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    [adjustedCoverScale, adjustedCoverScale, 1]
  );
  const stickyHeight = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    [viewportHeight, viewportHeight, naturalHeight]
  );

  // 파티클 위치를 useMemo로 고정
  const particles = useMemo(() =>
    [...Array(10)].map((_, i) => ({
      id: i,
      left: `${(i * 10) % 100}%`,
      top: `${(i * 12) % 100}%`,
      duration: 5 + (i % 3),
      delay: (i % 4) * 1.5,
    })), []
  );

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-[#111111]">
      {/* sticky 컨테이너: 헤더(64px) 바로 아래 고정 */}
      <motion.div
        className="sticky top-16 overflow-hidden bg-[#111111] flex items-center justify-center"
        style={{ height: stickyHeight }}
      >
        {/* 비디오 래퍼: 원본 비율, 스케일로 cover↔fit 전환 */}
        <motion.div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio, scale: videoScale }}
        >
          {/* 유튜브 iframe - 살짝 크게 해서 가장자리 숨김 */}
          <motion.div
            initial={{ scale: 1.02 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, ease: "linear" }}
            className="absolute inset-0"
          >
            <iframe
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title={isMobile ? "Hero Video Mobile" : "Hero Video Desktop"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute w-[104%] h-[104%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ border: "none" }}
            />
          </motion.div>

          {/* 어두운 오버레이 - 전체 덮기 */}
          <div className="absolute -inset-4 bg-black/40" />

          {/* 그라데이션 오버레이 */}
          <div className="absolute -inset-4 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

          {/* 파티클 효과 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-white/15 rounded-full"
                style={{
                  left: particle.left,
                  top: particle.top,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* 텍스트 컨테이너 - sticky 기준 절대 위치 */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4"
        >
          <motion.h1
            style={{ opacity: line1Opacity, y: line1Y, filter: line1Filter }}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white mb-2 md:mb-3 tracking-wide"
          >
            {translations.heroLine1}
          </motion.h1>

          <motion.h1
            style={{ opacity: line2Opacity, y: line2Y, filter: line2Filter }}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white mb-8 md:mb-10 tracking-wide"
          >
            {translations.heroLine2}
          </motion.h1>

          <motion.p
            style={{ opacity: line3Opacity, y: line3Y }}
            className="text-sm md:text-base lg:text-lg text-white/60 tracking-wide font-light"
          >
            {translations.heroSubtitle}
          </motion.p>
        </div>

        {/* 스크롤 유도 */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center cursor-pointer"
          >
            <motion.span
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
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
        </motion.div>

      </motion.div>
    </section>
  );
}
