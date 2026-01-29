"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** 마우스 위치에 따라 스크롤: 스크롤 가능한 컨테이너 위에서는 해당 컨테이너만 스크롤, 그 외에는 페이지 스크롤 */
function useSelectiveWheelScroll() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target) return;

      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        const style = getComputedStyle(el);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        const isScrollableY = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
        const isScrollableX = overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay";
        if (isScrollableY || isScrollableX) {
          const canScrollY = el.scrollHeight > el.clientHeight;
          const canScrollX = el.scrollWidth > el.clientWidth;
          if (canScrollY && isScrollableY) {
            const atTop = el.scrollTop <= 0;
            const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 1;
            if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
              e.preventDefault();
              el.scrollTop += e.deltaY;
            }
            return;
          }
          if (canScrollX && isScrollableX) {
            const atLeft = el.scrollLeft <= 0;
            const atRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
            if ((e.deltaX < 0 && !atLeft) || (e.deltaX > 0 && !atRight)) {
              e.preventDefault();
              el.scrollLeft += e.deltaX;
            }
            return;
          }
        }
        el = el.parentElement;
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => document.removeEventListener("wheel", handleWheel, { capture: true });
  }, []);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSelectiveWheelScroll();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
