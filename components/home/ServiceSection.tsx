"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

// 스태거 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

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
      <Link href={href} className="block h-full" style={{ transform: "translateZ(20px)" }}>
        {children}
      </Link>
    </motion.div>
  );
}

export default function ServiceSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]" style={{ perspective: 1000 }}>
      <div className="mx-auto max-w-6xl">
        {/* Section Title with Line Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left text-sm font-semibold tracking-[0.2em] text-accent uppercase"
          >
            Service
          </motion.h2>
          <motion.div
            variants={titleLineExpand}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="h-0.5 bg-accent mt-3"
          />
        </motion.div>

        {/* Top 4 Cards - Stagger Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-4 md:mb-5"
        >
          {serviceItemsTop.map((item) => {
            const Icon = item.icon;
            return (
              <Card3D key={item.title} href={item.href} className="h-full">
                <div className="group flex flex-col items-center justify-center rounded-xl bg-[#1a1a1a] p-6 md:p-8 border border-[#2a2a2a] transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/20 min-h-[180px] md:min-h-[200px] h-full">
                  {/* Icon with Bounce Animation on Hover */}
                  <motion.div
                    whileHover={{ y: -5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="w-14 h-14 md:w-16 md:h-16 mb-5 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors"
                  >
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-accent" strokeWidth={1.5} />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-white mb-1.5 group-hover:text-accent transition-colors text-center">
                    {item.title}
                  </h3>

                  {/* English Title */}
                  <p className="text-xs md:text-sm text-[#888888] text-center">
                    {item.titleEn}
                  </p>
                </div>
              </Card3D>
            );
          })}
        </motion.div>

        {/* Bottom 2 Wide Cards - Stagger Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
        >
          {serviceItemsBottom.map((item) => {
            const Icon = item.icon;
            return (
              <Card3D key={item.title} href={item.href} className="h-full">
                <div className="group flex items-start gap-5 rounded-xl bg-[#1a1a1a] p-6 md:p-8 border border-[#2a2a2a] transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/20 min-h-[140px] md:min-h-[160px] h-full">
                  {/* Icon with Rotation on Hover */}
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors"
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-accent" strokeWidth={1.5} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#888888] line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Arrow Icon with Slide Animation */}
                  <motion.div
                    initial={{ x: 0, opacity: 0 }}
                    whileHover={{ x: 5 }}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </motion.div>
                </div>
              </Card3D>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
