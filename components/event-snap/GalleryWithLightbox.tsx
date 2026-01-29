"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  secureUrl: string;
  alt: string | null;
  width?: number | null;
  height?: number | null;
}

interface GalleryWithLightboxProps {
  images: GalleryImage[];
  locationName: string;
}

export default function GalleryWithLightbox({ images, locationName }: GalleryWithLightboxProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goPrev, goNext]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <>
      <div className="mb-12">
        <h2 className="font-bold mb-6">갤러리</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => {
                setCurrentIndex(index);
                setLightboxOpen(true);
              }}
              className="relative w-full bg-muted rounded-lg overflow-hidden group text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              style={{
                aspectRatio:
                  image.width && image.height ? `${image.width} / ${image.height}` : "4 / 3",
              }}
            >
              <Image
                src={image.secureUrl}
                alt={image.alt || `${locationName} 갤러리`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="갤러리 이미지 보기"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-6xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors -translate-x-2 md:translate-x-0"
                aria-label="이전"
              >
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* Image */}
            <div className="relative w-full h-[80vh] max-h-[85vh] flex items-center justify-center">
              <Image
                src={currentImage.secureUrl}
                alt={currentImage.alt || `${locationName} 갤러리`}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1152px"
                priority
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors translate-x-2 md:translate-x-0"
                aria-label="다음"
              >
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
