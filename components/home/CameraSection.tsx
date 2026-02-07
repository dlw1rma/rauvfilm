"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Camera, Video, Aperture } from "lucide-react";

interface CameraSectionProps {
  translations: {
    cameraDetail: string;
    cameraDesc1: string;
    cameraDesc2: string;
    cameraDesc3: string;
    cameraDesc4: string;
    cameraNote: string;
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
  hidden: { opacity: 0, y: 25, scale: 0.95 },
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

// 텍스트 마스크 reveal 효과
const textReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] as const, delay: 0.2 },
  },
};

// 3D 틸트 카드
function Card3D({ children, className }: { children: React.ReactNode; className?: string }) {
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
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
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
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      <div style={{ transform: "translateZ(25px)" }}>{children}</div>
    </motion.div>
  );
}

export default function CameraSection({ translations }: CameraSectionProps) {
  const cameras = [
    {
      name: "SONY FX3",
      desc: "Cinema Line",
      detail: translations.cameraDetail,
      icon: Camera,
    },
    {
      name: "SONY A7S3",
      desc: "Low Light Master",
      icon: Video,
    },
    {
      name: "SONY A7M4",
      desc: "High Resolution",
      icon: Aperture,
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]" style={{ perspective: 1000 }}>
      <div className="mx-auto max-w-4xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Camera
        </motion.h2>

        {/* Main Description with Text Reveal */}
        <motion.div
          variants={textReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-white/70 leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            {translations.cameraDesc1}
            <br className="hidden md:block" />
            {translations.cameraDesc2}
            <br className="hidden md:block" />
            <span className="text-white font-medium">FX3, A7S3, A7M4</span>{translations.cameraDesc3}
            <br className="hidden md:block" />
            {translations.cameraDesc4}
          </p>
        </motion.div>

        {/* Camera Cards - Stagger + 3D Tilt */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          className="grid md:grid-cols-3 gap-5 md:gap-6"
        >
          {cameras.map((camera) => {
            const Icon = camera.icon;
            return (
              <Card3D key={camera.name}>
                <div className="group bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a] text-center transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/20">
                  {/* Icon with Pulse Animation */}
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="w-16 h-16 mx-auto mb-5 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors relative"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-accent/20"
                    />
                    <Icon className="w-7 h-7 text-accent relative z-10" strokeWidth={1.5} />
                  </motion.div>

                  {/* Camera Name */}
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-accent transition-colors">
                    {camera.name}
                  </h3>

                  {/* English Subtitle */}
                  <p className="text-sm text-accent/80 mb-2">{camera.desc}</p>

                  {/* Detail */}
                  <p className="text-xs text-[#888888]">{camera.detail}</p>
                </div>
              </Card3D>
            );
          })}
        </motion.div>

        {/* Additional Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-[#666666] text-sm mt-10"
        >
          {translations.cameraNote}
        </motion.p>
      </div>
    </section>
  );
}
