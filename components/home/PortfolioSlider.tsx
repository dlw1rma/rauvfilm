"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

// 3D 틸트 카드 컴포넌트
function Card3D({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set((mouseX / width) - 0.5);
    y.set((mouseY / height) - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
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
        style={{ perspective: 1000 }}
      >
        <Swiper
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto"
          spaceBetween={20}
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
                style={{ perspective: 1000 }}
              >
                <Card3D
                  className="group cursor-pointer"
                  onClick={() => {
                    setSelectedVideo({
                      videoId,
                      title: item.title
                    });
                  }}
                >
                  {/* Card with Thumbnail */}
                  <div className="relative aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a] transition-all duration-300 group-hover:border-accent group-hover:shadow-xl group-hover:shadow-accent/30">
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

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      {/* Play Icon with Scale Animation */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileHover={{ scale: 1.1 }}
                        className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300"
                      >
                        <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-accent/50">
                          <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Title Below Thumbnail */}
                  <div className="mt-3 px-1">
                    <h3 className="text-sm md:text-base text-white font-medium line-clamp-1 group-hover:text-accent transition-colors duration-300">
                      {item.title}
                    </h3>
                  </div>
                </Card3D>
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
