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

  // Duplicate for seamless infinite scroll
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
          spaceBetween={16}
          loop={true}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.5,
          }}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={4000}
          className="!overflow-visible"
        >
          {items.map((item, index) => {
            const videoId = extractVideoId(item.youtubeUrl);
            const thumbnailUrl = item.thumbnailUrl || getYoutubeThumbnail(videoId, 'maxres');

            return (
              <SwiperSlide
                key={`${item.id}-${index}`}
                className="!w-[280px] md:!w-[320px] lg:!w-[380px]"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    setSelectedVideo({
                      videoId,
                      title: item.title
                    });
                  }}
                >
                  {/* Card with Thumbnail */}
                  <div className="relative aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] transition-all duration-300 group-hover:border-accent group-hover:shadow-lg group-hover:shadow-accent/20">
                    {/* Thumbnail Image */}
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#111111]" />
                    )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      {/* Play Icon */}
                      <div className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                        <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
                          <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title Below Thumbnail */}
                  <div className="mt-3 px-1">
                    <h3 className="text-sm md:text-base text-white font-medium line-clamp-1 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </motion.div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-accent transition-colors"
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
            </button>

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
                className="absolute inset-0 w-full h-full rounded-lg"
                style={{
                  border: "none"
                }}
              />
            </div>

            {/* Video Title */}
            <h3 className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white text-lg font-medium max-w-4xl px-4">
              {selectedVideo.title}
            </h3>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
