"use client";

import { useEffect, useRef } from "react";

const portfolioItems = [
  { id: 1, title: "더링크호텔", subtitle: "The Link Hotel", type: "2인3캠" },
  { id: 2, title: "그랜드워커힐", subtitle: "Grand Walkerhill", type: "2인2캠" },
  { id: 3, title: "포시즌스호텔", subtitle: "Four Seasons", type: "2인3캠" },
  { id: 4, title: "시그니엘서울", subtitle: "Signiel Seoul", type: "2인2캠" },
  { id: 5, title: "반얀트리클럽", subtitle: "Banyan Tree Club", type: "2인3캠" },
  { id: 6, title: "JW메리어트", subtitle: "JW Marriott", type: "2인2캠" },
  { id: 7, title: "파라다이스시티", subtitle: "Paradise City", type: "2인3캠" },
  { id: 8, title: "서울신라호텔", subtitle: "The Shilla Seoul", type: "2인2캠" },
];

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
            <div className="absolute bottom-2 right-2">
              <span className="bg-accent/80 text-white text-xs px-2 py-1 rounded">
                {item.type}
              </span>
            </div>
          </div>
          <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground tracking-wider">
            {item.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}
