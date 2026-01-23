"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export default function NoticeSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="mx-auto max-w-4xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Notice
        </motion.h2>

        {/* Notice Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#1a1a1a] rounded-xl p-6 md:p-8 border border-[#2a2a2a]"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" strokeWidth={1.5} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-white mb-3">
                카카오톡 상담채널 변경 안내
              </h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed mb-4">
                기존 카카오톡 오픈채팅도 유지는 되지만
                <br className="hidden md:block" />
                신규 고객님들께서는 사업자인증이 되어 있는
                <br className="hidden md:block" />
                <span className="text-white/80">카카오톡 채널</span>로 문의 부탁드립니다.
              </p>

              {/* Date */}
              <p className="text-xs text-[#888888]">
                2025. 07. 27.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
