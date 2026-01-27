'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Check, ImageIcon, X, Search } from 'lucide-react';

const CATEGORIES = [
  { key: 'hero-video', name: '히어로 배경', description: '메인 페이지 상단 배경' },
  { key: 'logo', name: '로고', description: '사이트 로고' },
  { key: 'logo-mobile', name: '모바일 로고', description: '모바일용 로고' },
  { key: 'color-before', name: 'Color Before', description: '컬러 보정 전' },
  { key: 'color-after', name: 'Color After', description: '컬러 보정 후' },
  { key: 'about', name: 'About 이미지', description: 'About 페이지 이미지' },
  { key: 'about-team', name: '팀 이미지', description: '팀 소개 이미지' },
  { key: 'coalition', name: '제휴사 이미지', description: '제휴 페이지 제휴사 이미지' },
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

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
  folder: string;
}

export default function SiteImagesAdminPage() {
  const [images, setImages] = useState<Record<string, SiteImage>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCloudinaryModal, setShowCloudinaryModal] = useState<string | null>(null);
  const [cloudinaryImages, setCloudinaryImages] = useState<CloudinaryImage[]>([]);
  const [loadingCloudinary, setLoadingCloudinary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchImages = async () => {
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/site-images');
      const data = await res.json();
      if (!res.ok) {
        setFetchError((data?.error as string) || '이미지 목록을 불러오는데 실패했습니다.');
        setImages({});
        return;
      }
      if (!Array.isArray(data)) {
        setFetchError('이미지 목록 형식이 올바르지 않습니다.');
        setImages({});
        return;
      }
      const byCategory: Record<string, SiteImage> = {};
      data.forEach((img: SiteImage) => {
        byCategory[img.category] = img;
      });
      setImages(byCategory);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      setFetchError('이미지 목록을 불러오는데 실패했습니다.');
      setImages({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchCloudinaryImages = async (folder: string = 'all') => {
    setLoadingCloudinary(true);
    try {
      const res = await fetch(`/api/admin/cloudinary/images?folder=${encodeURIComponent(folder)}&max_results=200`);
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Cloudinary 이미지 조회 실패:', data.error, data.details);
        alert(`이미지 목록을 불러오는데 실패했습니다: ${data.error || '알 수 없는 오류'}`);
        setCloudinaryImages([]);
        return;
      }
      
      setCloudinaryImages(data.images || []);
      console.log('Cloudinary 이미지 로드 완료:', data.images?.length || 0, '개');
    } catch (error) {
      console.error('Failed to fetch Cloudinary images:', error);
      alert('이미지 목록을 불러오는데 실패했습니다.');
      setCloudinaryImages([]);
    } finally {
      setLoadingCloudinary(false);
    }
  };

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

  const handleSelectFromCloudinary = async (category: string, publicId: string) => {
    setUploading(category);
    try {
      const res = await fetch('/api/admin/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, publicId }),
      });
      if (res.ok) {
        setShowCloudinaryModal(null);
        fetchImages();
      }
    } catch (error) {
      console.error('Failed to set image:', error);
    } finally {
      setUploading(null);
    }
  };

  const openCloudinaryModal = (category: string) => {
    setShowCloudinaryModal(category);
    setSearchQuery('');
    fetchCloudinaryImages(selectedFolder);
  };

  const filteredCloudinaryImages = cloudinaryImages.filter((img) =>
    img.publicId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* 에러 메시지 */}
      {fetchError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3">
          {fetchError}
          <button
            type="button"
            onClick={() => { setFetchError(null); fetchImages(); }}
            className="ml-4 underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

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
            <div className="flex gap-2">
              <label className="flex-1">
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
                      {images[cat.key] ? '변경' : '업로드'}
                    </>
                  )}
                </div>
              </label>
              <button
                onClick={() => openCloudinaryModal(cat.key)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-medium"
              >
                Cloudinary에서 선택
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cloudinary 이미지 선택 모달 */}
      {showCloudinaryModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Cloudinary에서 이미지 선택</h2>
              <button
                onClick={() => setShowCloudinaryModal(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이미지 검색..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                  />
                </div>
                <select
                  value={selectedFolder}
                  onChange={(e) => {
                    setSelectedFolder(e.target.value);
                    fetchCloudinaryImages(e.target.value);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#111] border border-white/10 text-white focus:outline-none focus:border-accent"
                >
                  <option value="all">전체 이미지</option>
                  <option value="rauvfilm">rauvfilm</option>
                  <option value="rauvfilm/portfolio">portfolio</option>
                  <option value="rauvfilm/reviews">reviews</option>
                  <option value="rauvfilm/site">site</option>
                  <option value="rauvfilm/event-snap">event-snap</option>
                </select>
              </div>
            </div>

            {/* 이미지 그리드 */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingCloudinary ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
                </div>
              ) : filteredCloudinaryImages.length === 0 ? (
                <div className="text-center py-20 text-white/50">
                  이미지가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredCloudinaryImages.map((img) => (
                    <button
                      key={img.publicId}
                      onClick={() => handleSelectFromCloudinary(showCloudinaryModal, img.publicId)}
                      disabled={uploading === showCloudinaryModal}
                      className="relative aspect-square rounded-lg overflow-hidden bg-[#111] border border-white/10 hover:border-accent transition-all group"
                    >
                      <Image
                        src={img.secureUrl}
                        alt={img.publicId}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                          선택
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
