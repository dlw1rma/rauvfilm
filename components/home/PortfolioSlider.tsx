"use client";

import { useEffect, useRef } from "react";
import { portfolioItems, getYoutubeThumbnail } from "@/src/data/portfolio";

export default function PortfolioSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const scroll = () => {
      scrollPosition += speed;

      // Reset when we've scrolled half the content (since we duplicate it)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    // Start scrolling
    animationId = requestAnimationFrame(scroll);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Duplicate items for seamless infinite scroll
  const items = [...portfolioItems, ...portfolioItems];

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-hidden"
      style={{ scrollBehavior: "auto" }}
    >
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="flex-shrink-0 w-[280px] md:w-[320px] group cursor-pointer"
        >
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3 transition-transform group-hover:scale-105">
            {item.youtubeId ? (
              <img
                src={getYoutubeThumbnail(item.youtubeId, 'hq')}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-muted-foreground group-hover:text-accent transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
              </div>
            )}
            <div className="absolute bottom-2 right-2">
              <span className="bg-accent/80 text-white text-xs px-2 py-1 rounded">
                {item.camera}
              </span>
            </div>
          </div>
          <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground tracking-wider">
            {item.titleEn}
          </p>
        </div>
      ))}
    </div>
  );
}
