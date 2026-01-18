"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { heroVideos } from "@/src/data/portfolio";

export default function HeroVideoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroVideos.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroVideos.length) % heroVideos.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  const currentVideo = heroVideos[currentIndex];

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <iframe
          key={currentVideo.youtubeId}
          src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${currentVideo.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
          title={currentVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute w-[300%] h-[300%] -top-[100%] -left-[100%] pointer-events-none"
          style={{ border: "none" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="mb-8">
          <span className="inline-block px-4 py-1 text-sm tracking-widest border border-white/30 rounded-full mb-6">
            {currentVideo.camera}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            {currentVideo.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 tracking-widest">
            {currentVideo.titleEn}
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          <Link
            href="/portfolio"
            className="inline-flex h-12 items-center justify-center rounded bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:scale-105"
          >
            PORTFOLIO
          </Link>
          <Link
            href="/reservation"
            className="inline-flex h-12 items-center justify-center rounded border border-white/50 px-8 text-base font-medium text-white transition-all hover:bg-white/10 hover:scale-105"
          >
            RESERVATION
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        aria-label="이전 영상"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        aria-label="다음 영상"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {heroVideos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white scale-125"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`영상 ${index + 1}`}
          />
        ))}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute bottom-8 right-8 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        aria-label={isPlaying ? "일시정지" : "재생"}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  );
}
