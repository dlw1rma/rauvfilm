"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroVideoSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopVideoId = "sfKkrvLg_7g";
  const mobileVideoId = "6GEYb31W9go";

  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 스크롤 진행도 (0 ~ 1)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // 첫 번째 줄: 스크롤 0% ~ 15%에서 나타남
  const line1Opacity = useTransform(scrollYProgress, [0, 0.08, 0.15], [0, 1, 1]);
  const line1Y = useTransform(scrollYProgress, [0, 0.08, 0.15], [30, 0, 0]);
  const line1Filter = useTransform(scrollYProgress, [0, 0.08], ["blur(8px)", "blur(0px)"]);

  // 두 번째 줄: 스크롤 10% ~ 25%에서 나타남
  const line2Opacity = useTransform(scrollYProgress, [0.08, 0.16, 0.25], [0, 1, 1]);
  const line2Y = useTransform(scrollYProgress, [0.08, 0.16, 0.25], [30, 0, 0]);
  const line2Filter = useTransform(scrollYProgress, [0.08, 0.16], ["blur(8px)", "blur(0px)"]);

  // 세 번째 줄: 스크롤 20% ~ 35%에서 나타남
  const line3Opacity = useTransform(scrollYProgress, [0.16, 0.24, 0.35], [0, 1, 1]);
  const line3Y = useTransform(scrollYProgress, [0.16, 0.24, 0.35], [20, 0, 0]);

  // 전체 텍스트: 스크롤 50% 이후 위로 올라가며 사라짐
  const textContainerY = useTransform(scrollYProgress, [0.4, 0.7], [0, -150]);
  const textContainerOpacity = useTransform(scrollYProgress, [0.5, 0.7], [1, 0]);

  // 스크롤 인디케이터: 처음에만 보임
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

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
      {/* 고정된 비디오 배경 */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: "linear" }}
          className="absolute inset-0"
        >
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

        {/* 텍스트 컨테이너 - 스크롤에 따라 움직임 */}
        <motion.div
          style={{ y: textContainerY, opacity: textContainerOpacity }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4"
        >
          {/* 첫 번째 라인 */}
          <motion.h1
            style={{
              opacity: line1Opacity,
              y: line1Y,
              filter: line1Filter,
            }}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white mb-2 md:mb-3 tracking-wide"
          >
            소중한 날의 기억들을
          </motion.h1>

          {/* 두 번째 라인 */}
          <motion.h1
            style={{
              opacity: line2Opacity,
              y: line2Y,
              filter: line2Filter,
            }}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white mb-8 md:mb-10 tracking-wide"
          >
            영원히 간직하세요
          </motion.h1>

          {/* 세 번째 라인 - 서브타이틀 */}
          <motion.p
            style={{
              opacity: line3Opacity,
              y: line3Y,
            }}
            className="text-sm md:text-base lg:text-lg text-white/60 tracking-wide font-light"
          >
            기록이 아닌 기억을 남기는 영상을 선사합니다
          </motion.p>
        </motion.div>

        {/* 스크롤 유도 */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center cursor-pointer"
          >
            <motion.span
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-xs text-white/40 tracking-[0.2em] uppercase mb-2"
            >
              Scroll
            </motion.span>
            <ChevronDown className="w-5 h-5 text-white/40" />
          </motion.div>
        </motion.div>

        {/* 하단 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111111] to-transparent z-10" />
      </div>
    </section>
  );
}
