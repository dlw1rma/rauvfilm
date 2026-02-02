"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import YouTubeFacade from "@/components/video/YouTubeFacade";

interface PricingCardProps {
  plan: {
    name: string;
    subtitle: string;
    originalPrice?: string;
    price: string;
    description: string;
    videoUrl?: string;
    features: string[];
    recommendations?: string[];
    gimbalNote?: string;
    popular?: boolean;
    isNew?: boolean;
  };
  index?: number;
}

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url;
}

export default function PricingCard({ plan, index = 0 }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative rounded-2xl border bg-[#1a1a1a] overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:shadow-2xl",
        "border-white/10 hover:border-white/20"
      )}
    >
      {/* 배지 영역 */}
      {(plan.popular || plan.isNew) && (
        <div className="absolute -top-0 -right-0 z-10">
          <div
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-bl-xl",
              plan.popular ? "bg-accent text-white" : "bg-white/20 text-white"
            )}
          >
            {plan.popular ? "BEST" : "NEW"}
          </div>
        </div>
      )}

      <div className="relative p-6 md:p-8 flex flex-col lg:flex-row lg:gap-10">
        {/* 왼쪽: 타입, 가격, 영상 */}
        <div className="lg:w-1/2 flex-shrink-0">
          {/* 타입 라벨 */}
          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-2xl md:text-3xl font-bold text-white">
              {plan.subtitle}
            </span>
            <h3 className="text-base text-white/50 font-medium">{plan.name}</h3>
          </div>

          {/* 가격 영역 */}
          <div className="mb-6 pb-6 border-b border-white/10 lg:border-b-0 lg:pb-0">
            {plan.originalPrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base text-white/40 line-through">
                  {plan.originalPrice}원
                </span>
                <span className="text-xs font-medium text-accent">할인</span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {plan.price}
              </span>
              <span className="text-lg text-white/60">원</span>
            </div>
            <p className="mt-3 text-sm text-white/50">{plan.description}</p>
          </div>

          {/* 미리보기 비디오 */}
          {plan.videoUrl && (
            <div className="mb-6 lg:mb-0 rounded-xl overflow-hidden border border-white/10">
              <YouTubeFacade
                videoId={extractVideoId(plan.videoUrl)}
                title={`${plan.name} 영상`}
              />
            </div>
          )}
        </div>

        {/* 오른쪽: 추천대상, 기능 목록 */}
        <div className="lg:w-1/2">
          {/* 추천 대상 */}
          {plan.recommendations && plan.recommendations.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-bold mb-3 uppercase tracking-wider text-white/40">
                이런 분께 추천
              </h4>
              <ul className="space-y-2">
                {plan.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-white/70"
                  >
                    <span className="mt-0.5 text-white/40">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              {plan.gimbalNote && (
                <p className="mt-3 text-xs text-white/40 italic">
                  {plan.gimbalNote}
                </p>
              )}
            </div>
          )}

          {/* 기능 목록 */}
          <ul className="space-y-3">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <div className={cn(
                  "w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0",
                  plan.popular ? "bg-accent/20" : "bg-white/10"
                )}>
                  <Check className={cn(
                    "w-3 h-3",
                    plan.popular ? "text-accent" : "text-white/60"
                  )} strokeWidth={3} />
                </div>
                <span className="text-white/70 whitespace-pre-line">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
