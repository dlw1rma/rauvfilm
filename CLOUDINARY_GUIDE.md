# Cloudinary 이미지 통합 가이드

이 프로젝트는 Cloudinary를 사용하여 이미지를 최적화하고 관리합니다.

## 설정

### 1. 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가하세요:

```env
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

Cloudinary 계정이 없다면 [cloudinary.com](https://cloudinary.com)에서 무료 계정을 생성하세요.

### 2. Cloudinary 대시보드에서 확인할 정보

- **Cloud Name**: 대시보드 상단에 표시됩니다
- **API Key**: Settings > Security 탭에서 확인 가능
- **API Secret**: Settings > Security 탭에서 확인 가능 (한 번만 표시되므로 복사해두세요)

## 사용 방법

### 방법 1: CloudinaryImage 컴포넌트 사용 (권장)

가장 간단하고 최적화된 방법입니다.

```tsx
import CloudinaryImage from '@/components/ui/CloudinaryImage';

// 기본 사용법
<CloudinaryImage
  src="rauvfilm/portfolio/image1"
  alt="포트폴리오 이미지"
  width={800}
  height={600}
/>

// 자동 포맷 및 품질 최적화
<CloudinaryImage
  src="rauvfilm/reviews/review1"
  alt="리뷰 이미지"
  width={400}
  height={400}
  quality="auto"
  format="webp"
  crop="fill"
  gravity="face" // 얼굴 중심으로 크롭
/>

// 반응형 이미지 (width만 지정)
<CloudinaryImage
  src="rauvfilm/gallery/photo1"
  alt="갤러리 사진"
  width={1200}
  quality="auto"
  format="auto"
/>

// Fill 모드 (컨테이너 크기에 맞춤)
<div className="relative w-full h-64">
  <CloudinaryImage
    src="rauvfilm/hero/hero-image"
    alt="히어로 이미지"
    objectFit="cover"
    priority
  />
</div>
```

### 방법 2: 유틸리티 함수 직접 사용

URL만 필요한 경우:

```tsx
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import Image from 'next/image';

const imageUrl = getCloudinaryImageUrl('rauvfilm/portfolio/image1', {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'webp',
  crop: 'fill',
  gravity: 'auto',
});

<Image src={imageUrl} alt="이미지" width={800} height={600} />
```

### 방법 3: 서버 사이드 업로드

API 라우트에서 이미지를 업로드하는 경우:

```typescript
import { uploadToCloudinary } from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File;
  
  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  // 파일을 Buffer로 변환
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // Cloudinary에 업로드
    const result = await uploadToCloudinary(
      buffer,
      'rauvfilm/uploads', // 폴더 경로
      `image-${Date.now()}` // 커스텀 public_id (선택사항)
    );

    return NextResponse.json({
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('업로드 실패:', error);
    return NextResponse.json(
      { error: '업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

## 주요 기능

### 1. 자동 이미지 최적화

- **자동 포맷 변환**: 브라우저가 지원하는 최적 포맷(WebP 등)으로 자동 변환
- **자동 품질 조정**: `quality="auto"`로 Cloudinary가 최적 품질 자동 선택
- **반응형 이미지**: 다양한 화면 크기에 맞춰 자동 조정

### 2. 크롭 및 변환 옵션

```tsx
// fill: 지정한 크기에 맞춰 크롭
crop="fill"
gravity="face" // 얼굴 중심으로 크롭

// fit: 비율 유지하며 크기 조정
crop="fit"

// scale: 비율 유지하며 확대/축소
crop="scale"

// thumb: 썸네일 생성
crop="thumb"
```

### 3. 이미지 삭제

```typescript
import { deleteFromCloudinary } from '@/lib/cloudinary';

// 서버 사이드에서만 사용 가능
await deleteFromCloudinary('rauvfilm/portfolio/image1');
```

## 실제 사용 예시

### 리뷰 섹션에 적용

```tsx
// components/home/ReviewSection.tsx
import CloudinaryImage from '@/components/ui/CloudinaryImage';

{reviews.map((review) => (
  <div key={review.id} className="aspect-square">
    <CloudinaryImage
      src={review.imageUrl || 'rauvfilm/placeholder'}
      alt={review.title}
      width={400}
      height={400}
      quality="auto"
      format="webp"
      crop="fill"
      gravity="auto"
      className="rounded-lg"
    />
  </div>
))}
```

### 포트폴리오 갤러리에 적용

```tsx
// app/portfolio/page.tsx
import CloudinaryImage from '@/components/ui/CloudinaryImage';

<div className="grid grid-cols-3 gap-4">
  {portfolioItems.map((item) => (
    <CloudinaryImage
      key={item.id}
      src={item.cloudinaryId}
      alt={item.title}
      width={600}
      height={400}
      quality="auto"
      format="webp"
      crop="fill"
      loading="lazy"
    />
  ))}
</div>
```

## 주의사항

1. **환경 변수**: 프로덕션 환경에서도 반드시 환경 변수를 설정하세요.
2. **public_id 형식**: `folder/subfolder/image-name` 형식을 권장합니다.
3. **이미지 크기**: 너무 큰 원본 이미지는 업로드 전에 압축하는 것을 권장합니다.
4. **비용**: Cloudinary 무료 플랜은 월 25GB 저장공간과 25GB 대역폭을 제공합니다.

## 문제 해결

### 이미지가 표시되지 않는 경우

1. 환경 변수가 올바르게 설정되었는지 확인
2. `public_id`가 정확한지 확인 (폴더 경로 포함)
3. Cloudinary 대시보드에서 이미지가 업로드되었는지 확인
4. 브라우저 콘솔에서 에러 메시지 확인

### 타입 에러가 발생하는 경우

```bash
npm install --save-dev @types/node
```

## 추가 리소스

- [Cloudinary 공식 문서](https://cloudinary.com/documentation)
- [Next.js Image 컴포넌트](https://nextjs.org/docs/app/api-reference/components/image)
- [Cloudinary 변환 옵션](https://cloudinary.com/documentation/image_transformations)
