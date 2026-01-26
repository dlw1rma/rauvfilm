'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Check, ImageIcon } from 'lucide-react';

const CATEGORIES = [
  { key: 'hero-video', name: '히어로 배경', description: '메인 페이지 상단 배경' },
  { key: 'logo', name: '로고', description: '사이트 로고' },
  { key: 'logo-mobile', name: '모바일 로고', description: '모바일용 로고' },
  { key: 'color-before', name: 'Color Before', description: '컬러 보정 전' },
  { key: 'color-after', name: 'Color After', description: '컬러 보정 후' },
  { key: 'about', name: 'About 이미지', description: 'About 페이지 이미지' },
  { key: 'about-team', name: '팀 이미지', description: '팀 소개 이미지' },
];

interface SiteImage {
  id: number;
  category: string;
  publicId: string;
  url: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  title: string | null;
  alt: string | null;
  isActive: boolean;
}

export default function SiteImagesAdminPage() {
  const [images, setImages] = useState<Record<string, SiteImage>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/site-images');
      const data = await res.json();
      // 카테고리별로 정리
      const byCategory: Record<string, SiteImage> = {};
      data.forEach((img: SiteImage) => {
        byCategory[img.category] = img;
      });
      setImages(byCategory);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (category: string, file: File) => {
    setUploading(category);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'site');
    formData.append('siteCategory', category);

    try {
      await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      fetchImages();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">사이트 이미지 관리</h1>
        <p className="text-muted-foreground mt-1">사이트 전반에 사용되는 이미지를 관리합니다</p>
      </div>

      {/* 이미지 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-1">{cat.name}</h3>
            <p className="text-sm text-white/50 mb-4">{cat.description}</p>

            {/* 현재 이미지 미리보기 */}
            {images[cat.key] ? (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-[#111] border border-white/5">
                <Image
                  src={images[cat.key].secureUrl}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-[#111] border border-white/5 flex flex-col items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-white/20 mb-2" />
                <span className="text-white/30 text-sm">이미지 없음</span>
              </div>
            )}

            {/* 업로드 버튼 */}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(cat.key, file);
                }}
              />
              <div
                className={`flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all font-medium ${
                  uploading === cat.key
                    ? 'bg-accent/20 text-accent'
                    : 'bg-accent hover:bg-accent/90 text-white'
                }`}
              >
                {uploading === cat.key ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {images[cat.key] ? '이미지 변경' : '이미지 업로드'}
                  </>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
