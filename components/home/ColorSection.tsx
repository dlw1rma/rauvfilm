"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

export default function ColorSection() {
  // PC 버전 영상 ID
  const pcVideoId = "BEEXhZW2GMo";
  // 모바일 버전 영상 ID
  const mobileVideoId = "6GEYb31W9go";

  const [pcVideoDimensions, setPcVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  const defaultBefore = "https://via.placeholder.com/800x450/1a1a1a/666666?text=Before";
  const defaultAfter = "https://via.placeholder.com/800x450/1a1a1a/e50914?text=After";
  const [beforeImage, setBeforeImage] = useState(defaultBefore);
  const [afterImage, setAfterImage] = useState(defaultAfter);

  // 드래그 힌트: 사용자가 실제로 슬라이드할 때만 사라짐
  const [showDragHint, setShowDragHint] = useState(true);

  const handleSliderPositionChange = () => {
    if (showDragHint) {
      setShowDragHint(false);
    }
  };

  useEffect(() => {
    fetch("/api/site-images")
      .then((res) => res.json())
      .then((data: Record<string, { secureUrl?: string }>) => {
        if (data["color-before"]?.secureUrl) setBeforeImage(data["color-before"].secureUrl);
        if (data["color-after"]?.secureUrl) setAfterImage(data["color-after"].secureUrl);
      })
      .catch(() => {});

    fetch(`/api/youtube/video-details?videoId=${pcVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setPcVideoDimensions({ width: data.width, height: data.height });
      })
      .catch(() => {
        setPcVideoDimensions({ width: 1280, height: 720 });
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

  return (
    <section className="py-20 md:py-28 px-4 bg-[#111111]">
      <div className="mx-auto max-w-4xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-left text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Color
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-left text-white/70 leading-relaxed mb-10 text-base md:text-lg"
        >
          특수한 촬영 방식과 자연스러운 색감과 피부보정, 드레스 디테일 보정으로
          <br className="hidden md:block" />
          가장 예쁜 모습만을 남겨드리고 있습니다.
        </motion.p>

        {/* Before/After Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 relative w-full rounded-xl overflow-hidden border border-[#2a2a2a]"
        >
          <ReactCompareSlider
            itemOne={
              <ReactCompareSliderImage
                src={beforeImage}
                alt="Before color correction"
                style={{ objectFit: "cover" }}
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src={afterImage}
                alt="After color correction"
                style={{ objectFit: "cover" }}
              />
            }
            handle={
              <div
                style={{
                  width: "1.5px",
                  height: "100%",
                  background: "#e50914",
                  boxShadow: "0 0 6px rgba(229, 9, 20, 0.4)",
                }}
              />
            }
            position={50}
            onPositionChange={handleSliderPositionChange}
            className="aspect-video"
          />

          {/* 드래그 유도 힌트 오버레이 - 슬라이더 위에 별도 레이어 */}
          <AnimatePresence>
            {showDragHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <div className="flex items-center gap-0">
                  {/* 왼쪽 화살표 */}
                  <motion.div
                    animate={{ x: [0, -10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                      <path d="M15 4L7 12L15 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>

                  {/* 중앙 원 */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-10 h-10 rounded-full bg-accent border-2 border-white/90 flex items-center justify-center shadow-xl mx-1"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M5 9H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <path d="M7 6.5L4.5 9L7 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11 6.5L13.5 9L11 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>

                  {/* 오른쪽 화살표 */}
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                      <path d="M9 4L17 12L9 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Labels */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 rounded-full text-xs text-white/80 uppercase tracking-wider pointer-events-none">
            Before
          </div>
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-accent/90 rounded-full text-xs text-white uppercase tracking-wider pointer-events-none">
            After
          </div>
        </motion.div>

        {/* Instruction Text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-[#888888] text-sm mb-12"
        >
          가운데 막대를 움직여 비교해보세요
        </motion.p>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative w-full rounded-xl overflow-hidden border border-[#2a2a2a]"
        >
          {/* PC Version Video */}
          <div
            className="hidden md:block relative w-full"
            style={{
              aspectRatio: pcVideoDimensions
                ? `${pcVideoDimensions.width} / ${pcVideoDimensions.height}`
                : "16 / 9"
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${pcVideoId}?autoplay=1&mute=1&loop=1&playlist=${pcVideoId}&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          </div>

          {/* Mobile Version Video */}
          <div
            className="md:hidden relative w-full mx-auto"
            style={{
              aspectRatio: mobileVideoDimensions
                ? `${mobileVideoDimensions.width} / ${mobileVideoDimensions.height}`
                : "9 / 16",
              maxWidth: mobileVideoDimensions && mobileVideoDimensions.width > mobileVideoDimensions.height
                ? undefined
                : "400px"
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${mobileVideoId}?autoplay=1&mute=1&loop=1&playlist=${mobileVideoId}&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
