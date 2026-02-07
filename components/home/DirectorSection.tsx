"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { UserCheck, Film, Monitor, Camera } from "lucide-react";

interface DirectorSectionProps {
  translations: {
    directorSubtitle: string;
    directorFeature1Title: string;
    directorFeature1Desc: string;
    directorFeature2Title: string;
    directorFeature2Desc: string;
    directorFeature3Title: string;
    directorFeature3Desc: string;
    directorFeature4Title: string;
    directorFeature4Desc: string;
    directorNote: string;
  };
}

// 스태거 애니메이션
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

// 타이틀 라인 확장 애니메이션
const titleLineExpand = {
  hidden: { width: 0 },
  visible: {
    width: "60px",
    transition: { duration: 0.8, ease: "easeInOut" as const, delay: 0.3 },
  },
};

// 3D 틸트 카드 컴포넌트
function Card3D({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set((mouseX / rect.width) - 0.5);
    y.set((mouseY / rect.height) - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(25px)" }}>{children}</div>
    </motion.div>
  );
}

export default function DirectorSection({ translations }: DirectorSectionProps) {
  const directorFeatures = [
    { icon: UserCheck, title: translations.directorFeature1Title, description: translations.directorFeature1Desc },
    { icon: Film, title: translations.directorFeature2Title, description: translations.directorFeature2Desc },
    { icon: Monitor, title: translations.directorFeature3Title, description: translations.directorFeature3Desc },
    { icon: Camera, title: translations.directorFeature4Title, description: translations.directorFeature4Desc },
  ];

  return (
    <section className="py-20 md:py-28 px-4 bg-[#111111] overflow-hidden" style={{ perspective: 1000 }}>
      <div className="mx-auto max-w-4xl">
        {/* Section Title with Line Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-4 text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm font-semibold tracking-[0.2em] text-accent uppercase"
          >
            Director
          </motion.h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-white/70 leading-relaxed text-base md:text-lg mb-12"
        >
          {translations.directorSubtitle}
        </motion.p>

        {/* 2x2 Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8"
        >
          {directorFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card3D key={feature.title} className="h-full">
                <div className="group flex flex-col items-start gap-4 rounded-xl bg-[#1a1a1a] p-6 md:p-8 border border-[#2a2a2a] transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/20 h-full min-h-[160px]">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors"
                  >
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-accent" strokeWidth={1.5} />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm md:text-base text-[#888888] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card3D>
            );
          })}
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-[#666666] text-sm"
        >
          {translations.directorNote}
        </motion.p>
      </div>
    </section>
  );
}
