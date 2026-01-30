"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** 마우스 위치 아래에 스크롤 가능한 컨테이너가 있는지 확인 */
function findScrollableAncestor(target: HTMLElement | null): HTMLElement | null {
  let el = target;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      if (el.scrollHeight > el.clientHeight) {
        return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
      prevent: (node) => {
        // 스크롤 가능한 컨테이너 안에 있으면 Lenis 스크롤을 막음
        return !!findScrollableAncestor(node as HTMLElement);
      },
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
