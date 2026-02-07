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
  translations: {
    gallery: string;
    galleryAria: string;
    close: string;
    prev: string;
    next: string;
  };
}

/**
 * Cloudinary URL에 최적화 transformation 추가
 * 썸네일용: 작은 해상도로 빠른 로딩
 */
function getOptimizedThumbnailUrl(secureUrl: string): string {
  // 이미 Cloudinary URL인 경우 transformation 추가
  if (secureUrl.includes('res.cloudinary.com')) {
    // 이미 transformation이 있는 경우 새로 추가
    if (secureUrl.includes('/image/upload/')) {
      const parts = secureUrl.split('/image/upload/');
      if (parts.length === 2) {
        const existingTransform = parts[1].split('/')[0];
        const publicId = parts[1].substring(existingTransform.length + 1);
        // 썸네일용: 최대 너비 400px, 자동 품질, 자동 포맷
        return `${parts[0]}/image/upload/w_400,q_auto,f_auto/${publicId}`;
      }
    }
    // transformation이 없는 경우 추가
    const parts = secureUrl.split('/image/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/image/upload/w_400,q_auto,f_auto/${parts[1]}`;
    }
  }
  return secureUrl;
}

/**
 * 라이트박스용 최적화 URL (로딩 속도 최우선)
 * 최대 너비 400px, 품질 60%로 제한하여 최대한 빠른 로딩
 */
function getLightboxUrl(secureUrl: string): string {
  if (secureUrl.includes('res.cloudinary.com')) {
    if (secureUrl.includes('/image/upload/')) {
      const parts = secureUrl.split('/image/upload/');
      if (parts.length === 2) {
        const existingTransform = parts[1].split('/')[0];
        const publicId = parts[1].substring(existingTransform.length + 1);
        // 로딩 속도 최우선: 최대 너비 400px, 품질 60%, 자동 포맷 (WebP 우선)
        return `${parts[0]}/image/upload/w_400,q_60,f_auto/${publicId}`;
      }
    }
    const parts = secureUrl.split('/image/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/image/upload/w_400,q_60,f_auto/${parts[1]}`;
    }
  }
  return secureUrl;
}

export default function GalleryWithLightbox({ images, locationName, translations }: GalleryWithLightboxProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);


  const goNext = useCallback(() => {
    setImageLoading(true);
    setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setImageLoading(true);
    setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (e.key === "ArrowLeft" && !imageLoading) goPrev();
      if (e.key === "ArrowRight" && !imageLoading) goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goPrev, goNext, imageLoading]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <>
      <div className="mb-12">
        <h2 className="font-bold mb-6">{translations.gallery}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => {
                setCurrentIndex(index);
                setImageLoading(true);
                setLightboxOpen(true);
              }}
              className="relative w-full bg-muted rounded-lg overflow-hidden group text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              style={{
                aspectRatio:
                  image.width && image.height ? `${image.width} / ${image.height}` : "4 / 3",
              }}
            >
              <Image
                src={getOptimizedThumbnailUrl(image.secureUrl)}
                alt={image.alt || `${locationName} ${translations.gallery}`}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
                loading="lazy"
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
          aria-label={translations.galleryAria}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={translations.close}
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
                disabled={imageLoading}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors -translate-x-2 md:translate-x-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={translations.prev}
              >
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* Image */}
            <div className="relative w-full h-[80vh] max-h-[85vh] flex items-center justify-center">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <Image
                src={getLightboxUrl(currentImage.secureUrl)}
                alt={currentImage.alt || `${locationName} ${translations.gallery}`}
                fill
                className={`object-contain transition-opacity duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                sizes="(max-width: 768px) 100vw, 400px"
                priority
                onLoad={() => setImageLoading(false)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                disabled={imageLoading}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors translate-x-2 md:translate-x-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={translations.next}
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
