"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign, Calendar, FileText, HelpCircle, Lightbulb, Play } from "lucide-react";

const serviceItemsTop = [
  {
    title: "상품 구성",
    titleEn: "Product",
    href: "/pricing",
    icon: DollarSign,
  },
  {
    title: "예약 절차",
    titleEn: "Reservation",
    href: "/reservation-process",
    icon: Calendar,
  },
  {
    title: "계약 약관",
    titleEn: "Terms",
    href: "/terms",
    icon: FileText,
  },
  {
    title: "FAQ",
    titleEn: "FAQ",
    href: "/faq",
    icon: HelpCircle,
  },
];

const serviceItemsBottom = [
  {
    title: "라우브필름에 대해서 알아보세요",
    subtitle: "결혼식 영상에 대한 라우브필름의 철학",
    href: "/about",
    icon: Lightbulb,
  },
  {
    title: "[TIP] 라우브필름 최대로 활용하기",
    subtitle: "영상 시청 방법, 커스텀 요청 방법 등등",
    href: "/tip",
    icon: Play,
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function ServiceSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <motion.h2
          {...fadeInUp}
          transition={{ duration: 0.6 }}
          className="mb-12 text-left text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Service
        </motion.h2>

        {/* Top 4 Cards - Square Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-4 md:mb-5">
          {serviceItemsTop.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="group flex flex-col items-center justify-center rounded-xl bg-[#1a1a1a] p-6 md:p-8 border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10 min-h-[180px] md:min-h-[200px]"
                >
                  {/* Icon Circle */}
                  <div className="w-14 h-14 md:w-16 md:h-16 mb-5 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-accent" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-white mb-1.5 group-hover:text-accent transition-colors text-center">
                    {item.title}
                  </h3>

                  {/* English Title */}
                  <p className="text-xs md:text-sm text-[#888888] text-center">
                    {item.titleEn}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom 2 Wide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {serviceItemsBottom.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="group flex items-start gap-5 rounded-xl bg-[#1a1a1a] p-6 md:p-8 border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10 min-h-[140px] md:min-h-[160px]"
                >
                  {/* Icon Circle */}
                  <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-accent" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#888888] line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
