"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function CustomSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="mx-auto max-w-4xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Custom
        </motion.h2>

        {/* Main Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-2xl mx-auto mb-6">
            신랑신부님의 가져가실 소중한 영상을 위해
            <br className="hidden md:block" />
            대표 촬영 한정으로 원하시는 형식의 영상을
            <br className="hidden md:block" />
            <span className="text-white font-medium">최대한 반영하여 작업</span>하고 있습니다.
          </p>
          <p className="text-white/50 leading-relaxed text-sm md:text-base max-w-xl mx-auto">
            원하시는 형식이 있다면 카카오톡 채널로 상담 후
            <br className="hidden md:block" />
            신청서 작성 부탁드립니다.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <a
            href="https://pf.kakao.com/_xlXAin/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5 text-accent" />
            <span>상담 문의하기</span>
            <svg
              className="w-4 h-4 text-[#888888] group-hover:text-accent group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-[#666666] text-xs mt-8"
        >
          * 요청 형식에 따라 추가비용 발생 또는 반영 불가할 수 있습니다
        </motion.p>
      </div>
    </section>
  );
}
