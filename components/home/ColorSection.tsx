"use client";

import { useState, useEffect } from "react";

export default function ColorSection() {
  // PC 버전 영상 ID
  const pcVideoId = "BEEXhZW2GMo";
  // 모바일 버전 영상 ID
  const mobileVideoId = "6GEYb31W9go";

  const [pcVideoDimensions, setPcVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [mobileVideoDimensions, setMobileVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    // PC 버전 영상 비율 가져오기
    fetch(`/api/youtube/video-details?videoId=${pcVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setPcVideoDimensions({ width: data.width, height: data.height });
      })
      .catch((error) => {
        console.error("Error fetching PC video dimensions:", error);
        setPcVideoDimensions({ width: 1280, height: 720 }); // Fallback
      });

    // 모바일 버전 영상 비율 가져오기
    fetch(`/api/youtube/video-details?videoId=${mobileVideoId}`)
      .then((res) => res.json())
      .then((data) => {
        setMobileVideoDimensions({ width: data.width, height: data.height });
      })
      .catch((error) => {
        console.error("Error fetching mobile video dimensions:", error);
        setMobileVideoDimensions({ width: 720, height: 1280 }); // Fallback (9:16)
      });
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-left text-2xl font-bold tracking-widest text-accent">COLOR</h2>
        <p className="text-left text-muted-foreground leading-relaxed mb-8">
          특수한 촬영 방식과 자연스러운 색감과 피부보정, 드레스 디테일 보정으로
          <br className="hidden md:block" />
          가장 예쁜 모습만을 남겨드리고 있습니다.
        </p>
        <div className="mb-8 relative w-full rounded-lg overflow-hidden">
          {/* PC 버전 영상 - 동적 비율 */}
          <div 
            className="hidden md:block relative w-full" 
            style={pcVideoDimensions ? {
              aspectRatio: `${pcVideoDimensions.width} / ${pcVideoDimensions.height}`
            } : {
              aspectRatio: "16 / 9" // Fallback
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${pcVideoId}?autoplay=1&mute=1&loop=1&playlist=${pcVideoId}&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          </div>
          {/* 모바일 버전 영상 - 동적 비율 */}
          <div 
            className="md:hidden relative w-full mx-auto" 
            style={mobileVideoDimensions ? {
              aspectRatio: `${mobileVideoDimensions.width} / ${mobileVideoDimensions.height}`,
              maxWidth: "400px"
            } : {
              aspectRatio: "9 / 16", // Fallback
              maxWidth: "400px"
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${mobileVideoId}?autoplay=1&mute=1&loop=1&playlist=${mobileVideoId}&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
