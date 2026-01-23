'use client';

import Image from 'next/image';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

interface CloudinaryImageProps {
  /**
   * Cloudinary public_id 또는 전체 URL
   */
  src: string;
  /**
   * 이미지 alt 텍스트
   */
  alt: string;
  /**
   * 이미지 너비 (픽셀)
   */
  width?: number;
  /**
   * 이미지 높이 (픽셀)
   */
  height?: number;
  /**
   * 이미지 품질 (1-100 또는 'auto')
   */
  quality?: number | 'auto';
  /**
   * 이미지 포맷 ('auto', 'webp', 'jpg', 'png')
   */
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  /**
   * 크롭 모드 ('fill', 'fit', 'scale', 'thumb', 'limit')
   */
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  /**
   * 중력 설정 (크롭 시 사용)
   */
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  /**
   * CSS 클래스명
   */
  className?: string;
  /**
   * 이미지 스타일
   */
  style?: React.CSSProperties;
  /**
   * 이미지 로딩 방식 ('lazy', 'eager')
   */
  loading?: 'lazy' | 'eager';
  /**
   * 이미지 우선순위 (true일 경우 preload)
   */
  priority?: boolean;
  /**
   * 이미지 객체 fit 모드
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /**
   * 이미지 객체 위치
   */
  objectPosition?: string;
  /**
   * 플레이스홀더 (blur 또는 색상)
   */
  placeholder?: 'blur' | 'empty';
  /**
   * blur 데이터 URL (placeholder='blur'일 때 사용)
   */
  blurDataURL?: string;
  /**
   * 이미지 로드 에러 핸들러
   */
  onError?: () => void;
  /**
   * 이미지 로드 완료 핸들러
   */
  onLoad?: () => void;
}

/**
 * Cloudinary 이미지를 최적화하여 표시하는 컴포넌트
 * 
 * @example
 * ```tsx
 * <CloudinaryImage
 *   src="rauvfilm/portfolio/image1"
 *   alt="포트폴리오 이미지"
 *   width={800}
 *   height={600}
 *   quality="auto"
 *   format="webp"
 * />
 * ```
 */
export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  quality = 'auto',
  format = 'auto',
  crop = 'fill',
  gravity = 'auto',
  className,
  style,
  loading = 'lazy',
  priority = false,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder = 'empty',
  blurDataURL,
  onError,
  onLoad,
}: CloudinaryImageProps) {
  // Cloudinary URL 생성
  const imageUrl = getCloudinaryImageUrl(src, {
    width,
    height,
    quality,
    format,
    crop,
    gravity,
  });

  // width와 height가 모두 제공된 경우
  if (width && height) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        priority={priority}
        quality={typeof quality === 'number' ? quality : undefined}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={onError}
        onLoad={onLoad}
        style={{
          objectFit,
          objectPosition,
          ...style,
        }}
      />
    );
  }

  // width만 제공된 경우
  if (width) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={0}
        className={className}
        loading={loading}
        priority={priority}
        quality={typeof quality === 'number' ? quality : undefined}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={onError}
        onLoad={onLoad}
        style={{
          width: '100%',
          height: 'auto',
          objectFit,
          objectPosition,
          ...style,
        }}
      />
    );
  }

  // height만 제공된 경우
  if (height) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={0}
        height={height}
        className={className}
        loading={loading}
        priority={priority}
        quality={typeof quality === 'number' ? quality : undefined}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={onError}
        onLoad={onLoad}
        style={{
          width: 'auto',
          height: '100%',
          objectFit,
          objectPosition,
          ...style,
        }}
      />
    );
  }

  // width와 height가 모두 없는 경우 (fill 모드)
  return (
    <div className={`relative ${className || ''}`} style={style}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={className}
        loading={loading}
        priority={priority}
        quality={typeof quality === 'number' ? quality : undefined}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={onError}
        onLoad={onLoad}
        style={{
          objectFit,
          objectPosition,
        }}
      />
    </div>
  );
}
