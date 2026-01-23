"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const features = [
  "VFX 프로덕션 출신",
  "유튜브 프로덕션 출신",
  "표준 DI 작업 공간",
  "대표 직접 제작",
];

export default function DirectorSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#111111]">
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

        {/* Main Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-14"
        >
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-2xl mx-auto mb-6">
            대표가 인정한 실력을 갖고 있는 감독님들만 있기에
            <br className="hidden md:block" />
            예약이 불가능한 일정이 있을 수 있습니다.
          </p>
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            촬영만큼 중요한 영상보정은 가장 아름답고 멋진 모습을
            <br className="hidden md:block" />
            오랫동안 남겨드리기 위해서 VFX와 유튜브 프로덕션 출신의
            <br className="hidden md:block" />
            <span className="text-white font-medium">대표감독이 직접 제작</span>하고 있습니다.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1a1a1a] rounded-xl p-6 md:p-8 border border-[#2a2a2a]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent" strokeWidth={3} />
                </div>
                <span className="text-sm md:text-base text-white/80">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
