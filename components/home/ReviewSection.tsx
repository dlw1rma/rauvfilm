"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageOff, ArrowRight } from "lucide-react";

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

// 스태거 애니메이션
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// 배열 셔플 함수
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 랜덤으로 8개 선택
  const displayReviews = useMemo(() => {
    if (reviews.length <= 8) return reviews;
    return shuffleArray(reviews).slice(0, 8);
  }, [reviews]);

  if (loading) {
    return (
      <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            고객후기
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="aspect-square bg-[#1a1a1a] rounded-lg"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center text-sm font-semibold tracking-[0.2em] text-accent uppercase"
        >
          고객후기
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-white/70 mb-10 text-base md:text-lg"
        >
          많은 신랑신부님들과 함께 하며
          <br />
          직접 적어주신 솔직한 후기들입니다.
        </motion.p>

        {/* Review Grid - 4x2 썸네일 그리드 */}
        {displayReviews.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10"
          >
            {displayReviews.map((review) => {
              const hasValidImageUrl = review.imageUrl &&
                review.imageUrl.trim() !== "" &&
                (review.imageUrl.startsWith("http://") || review.imageUrl.startsWith("https://"));

              return (
                <motion.a
                  key={review.id}
                  href={review.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={cardVariants}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]"
                >
                  {/* 썸네일 이미지 */}
                  {hasValidImageUrl && !review.imageError ? (
                    <Image
                      src={review.imageUrl!}
                      alt={review.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setReviews((prev) =>
                          prev.map((r) => (r.id === review.id ? { ...r, imageError: true } : r))
                        );
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#555555] bg-[#1a1a1a]">
                      <ImageOff className="w-10 h-10" strokeWidth={1} />
                    </div>
                  )}

                  {/* 호버 시 오버레이 - 제목과 작성자 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex flex-col justify-end p-3 md:p-4">
                    <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="text-sm md:text-base font-semibold text-white line-clamp-2 mb-1">
                        {review.title}
                      </h3>
                      {review.author && (
                        <p className="text-xs md:text-sm text-white/70">
                          {review.author}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16 mb-10"
          >
            <p className="text-white/50 text-base">
              아직 등록된 후기가 없습니다.
            </p>
            <p className="text-white/40 text-sm mt-2">
              촬영 후 후기를 작성해주시면 할인 혜택을 드립니다.
            </p>
          </motion.div>
        )}

        {/* 전체 후기 보기 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <motion.a
            href="/reviews"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-full bg-accent text-white text-sm font-medium transition-all duration-300 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/20"
          >
            <span>전체 후기 보기</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
