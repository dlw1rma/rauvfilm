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
      className="flex gap-4 overflow-x-hidden py-4"
      style={{ scrollBehavior: "auto" }}
    >
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] group cursor-pointer"
        >
          {/* Card with Thumbnail */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-accent/20">
            {/* Thumbnail Image */}
            {item.youtubeId ? (
              <img
                src={getYoutubeThumbnail(item.youtubeId, 'maxres')}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play Icon - Top Right */}
            <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-accent/80 transition-colors">
              <svg
                className="w-5 h-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            {/* Text Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-base md:text-lg leading-tight">
                {item.titleEn}
              </h3>
              <p className="text-white/60 text-xs mt-1">
                {item.subtitle}
              </p>
            </div>
          </div>

          {/* Card Info - Below */}
          <div className="px-1">
            <h4 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">
              {item.title}({item.camera})
            </h4>
            <p className="text-xs text-muted-foreground tracking-wider mt-0.5">
              {item.titleEn.toUpperCase()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
