"use client";

export default function HeroVideoSlider() {
  // 단일 영상 ID: sfKkrvLg_7g
  const videoId = "sfKkrvLg_7g";

  return (
    <section className="relative w-full min-h-[400px] max-h-[60vh] overflow-hidden bg-black">
      {/* Video Background - 좌우 고정, 위아래는 잘려도 됨 */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
          title="Hero Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute inset-0 w-full h-full"
          style={{ 
            border: "none",
            objectFit: "cover",
            width: "100%",
            height: "100%"
          }}
          allowFullScreen
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="max-w-xl">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg">
              소중한 날의 기억들을
              <br />
              영원히 간직하세요
            </h1>
            <p className="mt-4 text-xs md:text-sm lg:text-base text-white/80">
              &apos;기록&apos;이 아닌 &apos;기억&apos;을 남기는 영상을 선사합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  );
}
