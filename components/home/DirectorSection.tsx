"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { UserCheck, Film, Monitor, Camera } from "lucide-react";

const directorFeatures = [
  {
    icon: UserCheck,
    title: "검증된 실력",
    description: "대표가 인정한 실력을 갖춘 감독님들만 함께합니다."
  },
  {
    icon: Film,
    title: "대표 직접 제작",
    description: "VFX와 유튜브 프로덕션 출신의 대표감독이 직접 제작합니다."
  },
  {
    icon: Monitor,
    title: "표준 DI 작업공간",
    description: "영화, 드라마와 동일한 표준 DI 작업환경"
  },
  {
    icon: Camera,
    title: "전문 장비",
    description: "Sony FX3, A7S3, A7M4 전문 시네마 장비 사용"
  },
];

// 스태거 애니메이션
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
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

export default function DirectorSection() {
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
          프로페셔널한 감독진이 함께합니다
        </motion.p>

        {/* 2x2 Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
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
          ※ 검증된 감독진으로 예약 불가 일정이 있을 수 있습니다.
        </motion.p>
      </div>
    </section>
  );
}
