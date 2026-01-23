"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, ImageOff } from "lucide-react";

interface Review {
  id: number;
  title: string;
  excerpt: string | null;
  sourceUrl: string;
  sourceType: string;
  author: string | null;
  imageUrl: string | null;
  imageError?: boolean;
}

function getSourceLabel(sourceType: string) {
  switch (sourceType) {
    case "naver_blog": return "Blog";
    case "naver_cafe": return "Cafe";
    case "instagram": return "Instagram";
    default: return "Review";
  }
}

const reviewLink = "https://search.naver.com/search.naver?query=라우브필름+후기";

// 스태거 애니메이션
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
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// 3D 틸트 카드
function Card3D({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
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
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
    </motion.a>
  );
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews.slice(0, 6));
        }
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-28 px-4 bg-[#111111]">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Review
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="aspect-square bg-[#1a1a1a] rounded-xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-4 bg-[#111111]" style={{ perspective: 1000 }}>
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          Review
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-white/70 mb-12 text-base md:text-lg"
        >
          많은 신랑신부님들과 함께 하며
          <br />
          직접 적어주신 솔직한 후기들입니다.
        </motion.p>

        {/* Review Grid - Stagger + 3D Tilt */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mb-10"
        >
          {reviews.map((review) => {
            const hasValidImageUrl = review.imageUrl &&
              review.imageUrl.trim() !== "" &&
              (review.imageUrl.startsWith("http://") || review.imageUrl.startsWith("https://"));

            return (
              <Card3D
                key={review.id}
                href={review.sourceUrl}
                className="group aspect-square bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a] transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/20 relative cursor-pointer block"
              >
                {hasValidImageUrl && !review.imageError ? (
                  <img
                    src={review.imageUrl!}
                    alt={review.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setReviews((prev) =>
                        prev.map((r) => (r.id === review.id ? { ...r, imageError: true } : r))
                      );
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#888888] bg-[#1a1a1a]">
                    <ImageOff className="w-8 h-8 mb-2" strokeWidth={1} />
                  </div>
                )}

                {/* Source Label */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 rounded-full text-[10px] text-white/80 uppercase tracking-wider backdrop-blur-sm">
                  {getSourceLabel(review.sourceType)}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                    {review.title}
                  </h3>
                  {review.author && (
                    <p className="text-xs text-white/60">- {review.author}</p>
                  )}
                </div>
              </Card3D>
            );
          })}

          {/* Fill empty slots */}
          {reviews.length < 6 &&
            Array.from({ length: 6 - reviews.length }).map((_, i) => (
              <motion.div
                key={`empty-${i}`}
                variants={cardVariants}
                className="aspect-square bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] flex items-center justify-center opacity-30"
              >
                <ImageOff className="w-8 h-8 text-[#888888]" strokeWidth={1} />
              </motion.div>
            ))}
        </motion.div>

        {/* More Reviews Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center"
        >
          <motion.a
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white/80 text-sm font-medium transition-all duration-300 hover:border-accent hover:text-white hover:shadow-xl hover:shadow-accent/20"
          >
            <span>+ 더 많은 후기</span>
            <ExternalLink className="w-4 h-4 group-hover:text-accent transition-colors" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
