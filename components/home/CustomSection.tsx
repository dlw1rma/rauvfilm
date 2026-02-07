"use client";

import { motion } from "framer-motion";
import { Film, MessageCircle, Check } from "lucide-react";

interface CustomSectionProps {
  translations: {
    customSubtitle: string;
    customCardTitle: string;
    customDesc: string;
    customFeature1: string;
    customFeature2: string;
    customFeature3: string;
    customFeature4: string;
    customNote: string;
    customCta: string;
  };
}

// 스케일 업 애니메이션
const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// 스태거 애니메이션
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export default function CustomSection({ translations }: CustomSectionProps) {
  const customFeatures = [
    translations.customFeature1,
    translations.customFeature2,
    translations.customFeature3,
    translations.customFeature4,
  ];

  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a] overflow-hidden">
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

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-white/70 leading-relaxed text-base md:text-lg mb-12"
        >
          {translations.customSubtitle}
        </motion.p>

        {/* Central Card */}
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#1a1a1a] rounded-xl p-8 md:p-10 border border-[#2a2a2a] transition-all duration-300 hover:border-accent/50">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Film className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {translations.customCardTitle}
              </h3>
            </div>

            {/* Description */}
            <p className="text-white/70 leading-relaxed text-base md:text-lg mb-8">
              {translations.customDesc.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br className="hidden md:block" />}
                  {line}
                </span>
              ))}
            </p>

            {/* Divider */}
            <div className="border-t border-[#2a2a2a] mb-8" />

            {/* Features Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {customFeatures.map((feature) => (
                <motion.div
                  key={feature}
                  variants={itemVariants}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-5 h-5 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/40 transition-colors">
                    <Check className="w-3 h-3 text-accent" strokeWidth={3} />
                  </div>
                  <span className="text-sm md:text-base text-white/80 group-hover:text-white transition-colors">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Note */}
            <p className="text-[#666666] text-sm mb-8">
              {translations.customNote}
            </p>

            {/* CTA Button */}
            <div className="flex justify-center">
              <motion.a
                href="https://pf.kakao.com/_xlXAin/chat"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-accent text-white font-medium transition-all duration-300 hover:shadow-xl hover:shadow-accent/40"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.div>
                <span>{translations.customCta}</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
