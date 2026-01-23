"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// 글자별 순차 등장 애니메이션
const letterAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.2, 0.65, 0.3, 0.9] as const,
    },
  }),
};

// 단어별 블러 효과 애니메이션
const wordAnimation = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 1.2 + i * 0.15,
      duration: 0.6,
      ease: "easeOut" as const,
    },
  }),
};

// 스크롤 유도 아이콘 애니메이션
const scrollIndicator = {
  animate: {
    y: [0, 12, 0],
    opacity: [0.4, 1, 0.4],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

// 글자별 애니메이션 텍스트 컴포넌트
const AnimatedText = ({
  text,
  className,
  delay = 0
}: {
  text: string;
  className?: string;
  delay?: number;
}) => (
  <motion.span className={className}>
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        custom={i + delay}
        variants={letterAnimation}
        initial="hidden"
        animate="visible"
        className="inline-block"
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </motion.span>
);

// 단어별 애니메이션 텍스트 컴포넌트
const AnimatedWords = ({
  text,
  className
}: {
  text: string;
  className?: string;
}) => (
  <motion.p className={className}>
    {text.split(" ").map((word, i) => (
      <motion.span
        key={i}
        custom={i}
        variants={wordAnimation}
        initial="hidden"
        animate="visible"
        className="inline-block mr-[0.3em]"
      >
        {word}
      </motion.span>
    ))}
  </motion.p>
);

export default function HeroVideoSlider() {
  const desktopVideoId = "sfKkrvLg_7g";
  const mobileVideoId = "6GEYb31W9go";

  const [desktopVideoDimensions, setDesktopVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 패럴랙스 스크롤 효과
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

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

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-[#111111] flex items-center justify-center">
      {/* Video Background with Parallax */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden"
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-0" />
      </motion.div>

      {/* Content with Parallax & Letter Animation */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
      >
        {/* Main Title - Letter by Letter Animation */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
          <AnimatedText text="소중한 날의 기억들을" className="block mb-2" />
          <AnimatedText text="영원히 간직하세요" className="block" delay={9} />
        </h1>

        {/* Subtitle - Word by Word with Blur */}
        <div className="mt-6 md:mt-8">
          <AnimatedWords
            text="'기록'이 아닌 '기억'을 남기는 영상을 선사합니다."
            className="text-base md:text-lg lg:text-xl text-white/70 font-light tracking-wide"
          />
        </div>
      </motion.div>

      {/* Scroll Indicator with Enhanced Bounce Animation */}
      <motion.button
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 cursor-pointer group"
        aria-label="Scroll down"
      >
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          className="text-xs text-white/40 tracking-[0.3em] uppercase group-hover:text-white/60 transition-colors"
        >
          Scroll
        </motion.span>
        <motion.div
          animate={scrollIndicator.animate}
          transition={scrollIndicator.transition}
          className="relative"
        >
          {/* Outer ring pulse */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-2 rounded-full border border-white/20"
          />
          <svg
            className="w-6 h-6 text-white/50 group-hover:text-accent transition-colors duration-300"
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
