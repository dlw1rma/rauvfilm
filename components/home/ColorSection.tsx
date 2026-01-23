"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";

export default function ColorSection() {
  // PC 버전 영상 ID
  const pcVideoId = "BEEXhZW2GMo";
  // 모바일 버전 영상 ID
  const mobileVideoId = "6GEYb31W9go";

  const [pcVideoDimensions, setPcVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  // Before/After 이미지 (placeholder - 나중에 교체)
  const beforeImage = "https://via.placeholder.com/800x450/1a1a1a/666666?text=Before";
  const afterImage = "https://via.placeholder.com/800x450/1a1a1a/e50914?text=After";

  useEffect(() => {
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
              <ReactCompareSliderHandle
                buttonStyle={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(229, 9, 20, 0.9)",
                  border: "none",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(229, 9, 20, 0.5)",
                }}
                linesStyle={{
                  width: 2,
                  background: "#e50914",
                }}
              />
            }
            position={50}
            className="aspect-video"
          />

          {/* Labels */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 rounded-full text-xs text-white/80 uppercase tracking-wider">
            Before
          </div>
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-accent/90 rounded-full text-xs text-white uppercase tracking-wider">
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
            style={pcVideoDimensions ? {
              aspectRatio: `${pcVideoDimensions.width} / ${pcVideoDimensions.height}`
            } : {
              aspectRatio: "16 / 9"
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
            style={mobileVideoDimensions ? {
              aspectRatio: `${mobileVideoDimensions.width} / ${mobileVideoDimensions.height}`,
              maxWidth: "400px"
            } : {
              aspectRatio: "9 / 16",
              maxWidth: "400px"
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
