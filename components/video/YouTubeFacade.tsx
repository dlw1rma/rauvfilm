"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  className?: string;
}

function getYouTubeThumbnail(videoId: string, quality: "maxres" | "hq" = "maxres") {
  if (quality === "maxres") {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function YouTubeFacade({
  videoId,
  title,
  className,
}: YouTubeFacadeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  if (isLoaded) {
    return (
      <div className={cn("relative aspect-video w-full", className)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full rounded-lg"
        />
      </div>
    );
  }

  const thumbnailUrl = thumbnailError
    ? getYouTubeThumbnail(videoId, "hq")
    : getYouTubeThumbnail(videoId, "maxres");

  return (
    <button
      onClick={() => setIsLoaded(true)}
      className={cn(
        "group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg bg-muted",
        className
      )}
      aria-label={`${title} 영상 재생`}
    >
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => {
          if (!thumbnailError) {
            setThumbnailError(true);
          }
        }}
        unoptimized
      />
      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent transition-transform group-hover:scale-110">
          <svg
            className="ml-0.5 h-5 w-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      {/* Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-sm font-medium text-white line-clamp-2">{title}</p>
      </div>
    </button>
  );
}
