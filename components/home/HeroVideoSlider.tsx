"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroVideoSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopVideoId = "sfKkrvLg_7g";
  const mobileVideoId = "6GEYb31W9go";

  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isLocked, setIsLocked] = useState(true);

  // 애니메이션 시퀀스
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: 첫 번째 줄 시작
    timers.push(setTimeout(() => setAnimationPhase(1), 500));
    // Phase 2: 두 번째 줄 시작
    timers.push(setTimeout(() => setAnimationPhase(2), 1500));
    // Phase 3: 서브타이틀 시작
    timers.push(setTimeout(() => setAnimationPhase(3), 2500));
    // Phase 4: 애니메이션 완료, 스크롤 잠금 해제
    timers.push(setTimeout(() => {
      setAnimationPhase(4);
      setIsLocked(false);
    }, 4000));

    return () => timers.forEach(clearTimeout);
  }, []);

  // 스크롤 잠금
  useEffect(() => {
    if (!isLocked) return;

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [isLocked]);

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

  // 글자별 애니메이션
  const AnimatedText = ({ text, isVisible }: { text: string; isVisible: boolean }) => {
    return (
      <span className="inline-block">
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={isVisible ? {
              opacity: 1,
              y: 0,
              filter: "blur(0px)"
            } : {}}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              ease: "easeOut"
            }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    );
  };

  return (
    <section ref={containerRef} className="relative h-screen">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
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
      </div>

      {/* 텍스트 컨테이너 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {/* 첫 번째 라인 */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white mb-2 md:mb-3 tracking-wide">
          <AnimatedText text="소중한 날의 기억들을" isVisible={animationPhase >= 1} />
        </h1>

        {/* 두 번째 라인 */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium text-white mb-8 md:mb-10 tracking-wide">
          <AnimatedText text="영원히 간직하세요" isVisible={animationPhase >= 2} />
        </h1>

        {/* 세 번째 라인 - 서브타이틀 */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={animationPhase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-sm md:text-base lg:text-lg text-white/60 tracking-wide font-light"
        >
          기록이 아닌 기억을 남기는 영상을 선사합니다
        </motion.p>
      </div>

      {/* 스크롤 유도 */}
      <AnimatePresence>
        {animationPhase >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
        )}
      </AnimatePresence>

      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111111] to-transparent z-10" />
    </section>
  );
}
