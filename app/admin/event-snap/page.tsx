'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Trash2, Upload, Plus, X, ImageIcon, Cloud } from 'lucide-react';

interface EventSnapImage {
  id: number;
  publicId: string;
  secureUrl: string;
  title: string | null;
  alt: string | null;
  order: number;
  isVisible: boolean;
  isFeatured: boolean;
}

interface Location {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  order: number;
  isVisible: boolean;
  images: EventSnapImage[];
}

export default function EventSnapAdminPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [newLocationForm, setNewLocationForm] = useState({
    name: '',
    nameEn: '',
    slug: '',
    description: '',
  });
  const [showCloudinary, setShowCloudinary] = useState(false);
  const [cloudinaryImages, setCloudinaryImages] = useState<{ publicId: string; secureUrl: string }[]>([]);
  const [loadingCloudinary, setLoadingCloudinary] = useState(false);
  const [cloudinaryFolder, setCloudinaryFolder] = useState('');
  const [addingPublicId, setAddingPublicId] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/admin/event-snap/locations');
      const data = await res.json();
      setLocations(data);
      if (data.length > 0 && !selectedLocation) {
        setSelectedLocation(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedLocation) {
        alert('먼저 장소를 선택하세요.');
        return;
      }

      setUploading(true);

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'event-snap');
        formData.append('locationId', selectedLocation.toString());

        try {
          await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          });
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }

      setUploading(false);
      fetchLocations();
    },
    [selectedLocation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  });

  const fetchCloudinaryImages = async () => {
    setLoadingCloudinary(true);
    try {
      const folderParam = cloudinaryFolder.trim() ? `folder=${encodeURIComponent(cloudinaryFolder.trim())}` : 'folder=all';
      const res = await fetch(`/api/admin/cloudinary/images?${folderParam}&max_results=200`);
      const data = await res.json();
      setCloudinaryImages(data.images || []);
    } catch (e) {
      console.error(e);
      setCloudinaryImages([]);
    } finally {
      setLoadingCloudinary(false);
    }
  };

  const handleSelectFromCloudinary = async (publicId: string, secureUrl: string) => {
    if (!selectedLocation) return;
    setAddingPublicId(publicId);
    try {
      const res = await fetch('/api/admin/event-snap/add-from-cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: selectedLocation, publicId, secureUrl }),
      });
      if (res.ok) {
        fetchLocations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingPublicId(null);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/admin/images/${imageId}?type=event-snap`, {
        method: 'DELETE',
      });
      fetchLocations();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/event-snap/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocationForm),
      });

      if (res.ok) {
        setNewLocationForm({ name: '', nameEn: '', slug: '', description: '' });
        setShowNewLocation(false);
        fetchLocations();
      }
    } catch (error) {
      console.error('Create location failed:', error);
    }
  };

  const selectedLocationData = locations.find((l) => l.id === selectedLocation);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">이벤트 스냅 이미지 관리</h1>
          <p className="text-muted-foreground mt-1">촬영 장소별 이미지를 업로드하고 관리합니다</p>
        </div>
        <button
          onClick={() => setShowNewLocation(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 장소 추가
        </button>
      </div>

      {/* 새 장소 폼 */}
      {showNewLocation && (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">새 촬영 장소</h2>
            <button onClick={() => setShowNewLocation(false)} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateLocation} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">장소명 (한글)</label>
              <input
                type="text"
                value={newLocationForm.name}
                onChange={(e) => setNewLocationForm({ ...newLocationForm, name: e.target.value })}
                placeholder="동작대교"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">장소명 (영문)</label>
              <input
                type="text"
                value={newLocationForm.nameEn}
                onChange={(e) => setNewLocationForm({ ...newLocationForm, nameEn: e.target.value })}
                placeholder="Dongjak Bridge"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">슬러그 (URL용)</label>
              <input
                type="text"
                value={newLocationForm.slug}
                onChange={(e) => setNewLocationForm({ ...newLocationForm, slug: e.target.value })}
                placeholder="dongjak-bridge"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">설명</label>
              <input
                type="text"
                value={newLocationForm.description}
                onChange={(e) => setNewLocationForm({ ...newLocationForm, description: e.target.value })}
                placeholder="서울 야경이 아름다운 촬영지"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
              >
                장소 추가
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 장소 선택 탭 */}
      {locations.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`px-5 py-2.5 rounded-xl transition-all ${
                selectedLocation === loc.id
                  ? 'bg-accent text-white'
                  : 'bg-[#1a1a1a] text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {loc.name}
              <span className="ml-2 text-sm opacity-60">({loc.images.length})</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>아직 등록된 촬영 장소가 없습니다.</p>
          <p className="text-sm mt-1">새 장소 추가 버튼을 클릭하여 시작하세요.</p>
        </div>
      )}

      {/* Cloudinary에서 선택 */}
      {selectedLocation && (
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            onClick={() => { setShowCloudinary(true); setCloudinaryImages([]); setCloudinaryFolder(''); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 bg-[#1a1a1a] text-white/80 hover:border-accent hover:text-accent transition-colors"
          >
            <Cloud className="w-4 h-4" />
            Cloudinary에서 선택
          </button>
        </div>
      )}

      {showCloudinary && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Cloudinary에서 이미지 선택</h3>
              <button onClick={() => setShowCloudinary(false)} className="p-2 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-white/10 flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={cloudinaryFolder}
                onChange={(e) => setCloudinaryFolder(e.target.value)}
                placeholder="폴더 경로 (비우면 전체)"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => fetchCloudinaryImages()}
                disabled={loadingCloudinary}
                className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
              >
                {loadingCloudinary ? '불러오는 중...' : '이미지 불러오기'}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {loadingCloudinary ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
                </div>
              ) : cloudinaryImages.length === 0 ? (
                <p className="text-center text-white/50 py-8">폴더를 입력하고 이미지 불러오기를 누르거나, 비운 뒤 불러오면 전체 이미지가 표시됩니다.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {cloudinaryImages.map((img) => (
                    <button
                      key={img.publicId}
                      type="button"
                      onClick={() => handleSelectFromCloudinary(img.publicId, img.secureUrl)}
                      disabled={addingPublicId === img.publicId}
                      className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-accent transition-colors"
                    >
                      <Image src={img.secureUrl} alt="" fill className="object-cover" sizes="120px" />
                      {addingPublicId === img.publicId && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="text-sm text-white">등록 중...</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 업로드 영역 */}
      {selectedLocation && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-accent bg-accent/10'
              : 'border-white/20 hover:border-accent/50 bg-[#1a1a1a]'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-accent' : 'text-white/40'}`} />
          {isDragActive ? (
            <p className="text-accent text-lg">여기에 드롭하세요</p>
          ) : uploading ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent mx-auto mb-4"></div>
              <p className="text-accent">업로드 중...</p>
            </div>
          ) : (
            <div>
              <p className="text-white/70 text-lg mb-2">클릭하거나 이미지를 드래그하여 업로드</p>
              <p className="text-white/40 text-sm">JPG, PNG, WebP (여러 장 가능)</p>
            </div>
          )}
        </div>
      )}

      {/* 이미지 그리드 */}
      {selectedLocationData && selectedLocationData.images.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {selectedLocationData.name} 이미지 ({selectedLocationData.images.length}장)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedLocationData.images.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10"
              >
                <Image
                  src={image.secureUrl}
                  alt={image.alt || '이벤트 스냅'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-3 bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedLocationData && selectedLocationData.images.length === 0 && (
        <div className="text-center py-12 text-white/50 bg-[#1a1a1a] rounded-xl border border-white/10">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>이 장소에 등록된 이미지가 없습니다.</p>
          <p className="text-sm mt-1">위 영역에 이미지를 드래그하여 업로드하세요.</p>
        </div>
      )}
    </div>
  );
}
