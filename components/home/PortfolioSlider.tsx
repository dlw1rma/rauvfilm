"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { Play } from "lucide-react";

import "swiper/css";
import "swiper/css/free-mode";

interface PortfolioItem {
  id: number;
  title: string;
  youtubeUrl: string;
  thumbnailUrl?: string | null;
}

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return url;
}

function getYoutubeThumbnail(youtubeId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'maxres'): string {
  if (!youtubeId) return '';
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`;
}

export default function PortfolioSlider() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string } | null>(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolios) {
          setPortfolios(data.portfolios);
        }
      })
      .catch((error) => {
        console.error("Error fetching portfolios:", error);
      });
  }, []);

  if (portfolios.length === 0) {
    return null;
  }

  const items = [...portfolios, ...portfolios];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-4"
      >
        <Swiper
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto"
          spaceBetween={20}
          loop={true}
          freeMode={{
            enabled: true,
            momentum: false,
            momentumRatio: 0,
          }}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          speed={5000}
          className="!overflow-visible"
          allowTouchMove={false}
        >
          {items.map((item, index) => {
            const videoId = extractVideoId(item.youtubeUrl);
            const thumbnailUrl = item.thumbnailUrl || getYoutubeThumbnail(videoId, 'maxres');

            return (
              <SwiperSlide
                key={`${item.id}-${index}`}
                className="!w-[280px] md:!w-[320px] lg:!w-[380px]"
              >
                <div
                  className="group cursor-pointer"
                  onClick={() => {
                    setSelectedVideo({
                      videoId,
                      title: item.title
                    });
                  }}
                >
                  {/* Card with Thumbnail */}
                  <div className="relative aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a]">
                    {/* Thumbnail Image */}
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#111111]" />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title Below Thumbnail */}
                  <div className="mt-3 px-1">
                    <h3 className="text-sm md:text-base text-white/80 font-medium line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </motion.div>

      {/* Video Modal with Enhanced Animation */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-accent transition-colors hover:rotate-90 duration-300"
              aria-label="Close"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>

            {/* Video Player */}
            <div
              className="relative max-w-5xl w-full"
              style={{
                aspectRatio: "16 / 9",
                maxHeight: "85vh"
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&controls=1&showinfo=0&modestbranding=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-xl shadow-2xl"
                style={{
                  border: "none"
                }}
              />
            </div>

            {/* Video Title */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white text-lg font-medium max-w-4xl px-4"
            >
              {selectedVideo.title}
            </motion.h3>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
