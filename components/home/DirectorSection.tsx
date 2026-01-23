"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const features = [
  "VFX 프로덕션 출신",
  "유튜브 프로덕션 출신",
  "표준 DI 작업 공간",
  "대표 직접 제작",
];

// 스태거 애니메이션
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

// 슬라이드 인 애니메이션
const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function DirectorSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#111111] overflow-hidden">
      <div className="mx-auto max-w-4xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Director
        </motion.h2>

        {/* Main Description - Slide from Left */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            대표가 인정한 실력을 갖고 있는 감독님들만 있기에
            <br className="hidden md:block" />
            예약이 불가능한 일정이 있을 수 있습니다.
          </p>
        </motion.div>

        {/* Second Description - Slide from Right */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            촬영만큼 중요한 영상보정은 가장 아름답고 멋진 모습을
            <br className="hidden md:block" />
            오랫동안 남겨드리기 위해서 VFX와 유튜브 프로덕션 출신의
            <br className="hidden md:block" />
            <motion.span
              initial={{ color: "rgba(255,255,255,0.7)" }}
              whileInView={{ color: "#ffffff" }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="font-medium"
            >
              대표감독이 직접 제작
            </motion.span>
            하고 있습니다.
          </p>
        </motion.div>

        {/* Feature Grid - Stagger */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1a1a1a] rounded-xl p-6 md:p-8 border border-[#2a2a2a]"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                variants={itemVariants}
                className="flex items-center gap-3 group"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.3 }}
                  className="w-5 h-5 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/40 transition-colors"
                >
                  <Check className="w-3 h-3 text-accent" strokeWidth={3} />
                </motion.div>
                <span className="text-sm md:text-base text-white/80 group-hover:text-white transition-colors">
                  {feature}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
