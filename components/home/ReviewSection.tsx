"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    case "naver_blog":
      return "네이버 블로그";
    case "naver_cafe":
      return "네이버 카페";
    case "instagram":
      return "인스타그램";
    default:
      return "리뷰";
  }
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          // 최대 8개만 표시
          setReviews(data.reviews.slice(0, 8));
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
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-widest">REVIEW</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-widest">REVIEW</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {reviews.map((review) => (
            <a
              key={review.id}
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group aspect-square bg-muted rounded-lg overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer relative"
            >
              {review.imageUrl && !review.imageError ? (
                <img
                  src={review.imageUrl}
                  alt={review.title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("Image load error for review", review.id, review.imageUrl);
                    setReviews((prev) =>
                      prev.map((r) => (r.id === review.id ? { ...r, imageError: true } : r))
                    );
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully for review", review.id);
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <span className="text-xs text-white mb-2">{getSourceLabel(review.sourceType)}</span>
                <h3 className="text-sm font-medium text-white line-clamp-2">{review.title}</h3>
                {review.author && (
                  <p className="text-xs text-white/80 mt-2">- {review.author}</p>
                )}
              </div>
            </a>
          ))}
          {/* 빈 슬롯 채우기 (8개 미만인 경우) */}
          {reviews.length < 8 &&
            Array.from({ length: 8 - reviews.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square bg-muted rounded-lg flex items-center justify-center opacity-30"
              >
                <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
            ))}
        </div>
        <div className="text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center text-accent hover:underline"
          >
            +REVIEW 더 보기
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
