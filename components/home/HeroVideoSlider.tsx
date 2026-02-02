"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroVideoSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopVideoId = "sfKkrvLg_7g";
  const mobileVideoId = "nfnkQmSDiU8";

  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });
  const [transitioned, setTransitioned] = useState(false);

  // 스크롤 진행도 (0 ~ 1)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // ── Phase 1: 텍스트 등장 (스크롤 0~30%) ──
  const line1Opacity = useTransform(scrollYProgress, [0, 0.06, 0.12], [0, 1, 1]);
  const line1Y = useTransform(scrollYProgress, [0, 0.06, 0.12], [30, 0, 0]);
  const line1Filter = useTransform(scrollYProgress, [0, 0.06], ["blur(8px)", "blur(0px)"]);

  const line2Opacity = useTransform(scrollYProgress, [0.06, 0.12, 0.20], [0, 1, 1]);
  const line2Y = useTransform(scrollYProgress, [0.06, 0.12, 0.20], [30, 0, 0]);
  const line2Filter = useTransform(scrollYProgress, [0.06, 0.12], ["blur(8px)", "blur(0px)"]);

  const line3Opacity = useTransform(scrollYProgress, [0.12, 0.18, 0.28], [0, 1, 1]);
  const line3Y = useTransform(scrollYProgress, [0.12, 0.18, 0.28], [20, 0, 0]);


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

  // ── Phase 3: 비디오 전체화면 → 원본 비율 (스크롤 30~55%) ──
  const rawVideoScale = useTransform(
    scrollYProgress,
    [0, 0.30, 0.55],
    [coverScale, coverScale, 1]
  );
  const rawStickyHeight = useTransform(
    scrollYProgress,
    [0, 0.30, 0.55],
    [windowSize.h || 800, windowSize.h || 800, naturalHeight]
  );

  // 전환 완료 후 스크롤을 올려도 원본 비율 유지 (맨 위로 가야 리셋)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.55 && !transitioned) setTransitioned(true);
    if (v < 0.03 && transitioned) setTransitioned(false);
  });

  const videoScale = transitioned ? 1 : rawVideoScale;
  const stickyHeight = transitioned ? naturalHeight : rawStickyHeight;

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
    <section ref={containerRef} className="relative h-[200vh]">
      {/* sticky 컨테이너: 100vh → 원본 비율 높이로 전환 */}
      <motion.div
        className="sticky top-0 overflow-hidden bg-[#111111] flex items-center justify-center"
        style={{ height: stickyHeight }}
      >
        {/* 비디오 래퍼: 원본 비율, 스케일로 cover↔fit 전환 */}
        <motion.div
          className="relative w-full"
          style={{ aspectRatio, scale: videoScale }}
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.03 }}
            transition={{ duration: 20, ease: "linear" }}
            className="absolute inset-0"
          >
            <iframe
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title={isMobile ? "Hero Video Mobile" : "Hero Video Desktop"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ border: "none" }}
            />
          </motion.div>

          {/* 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/40" />

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

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
            소중한 날의 기억들을
          </motion.h1>

          <motion.h1
            style={{ opacity: line2Opacity, y: line2Y, filter: line2Filter }}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white mb-8 md:mb-10 tracking-wide"
          >
            영원히 간직하세요
          </motion.h1>

          <motion.p
            style={{ opacity: line3Opacity, y: line3Y }}
            className="text-sm md:text-base lg:text-lg text-white/60 tracking-wide font-light"
          >
            기록이 아닌 기억을 남기는 영상을 선사합니다
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

        {/* 하단 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111111] to-transparent z-10" />
      </motion.div>
    </section>
  );
}
