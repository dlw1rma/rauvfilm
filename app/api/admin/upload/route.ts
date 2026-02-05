import { NextRequest, NextResponse } from 'next/server';
import { uploadImageFile } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // 관리자 인증 확인
  const authResponse = await requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string; // "event-snap", "site"
    const locationId = formData.get('locationId') as string; // 이벤트 스냅용
    const siteCategory = formData.get('siteCategory') as string; // 사이트 이미지 카테고리

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Cloudinary에 업로드
    const folder =
      category === 'event-snap'
        ? `rauvfilm/event-snap/${locationId}`
        : `rauvfilm/site/${siteCategory}`;

    const uploadResult = await uploadImageFile(file, folder);

    // DB에 저장
    if (category === 'event-snap' && locationId) {
      const image = await prisma.eventSnapImage.create({
        data: {
          publicId: uploadResult.publicId,
          url: uploadResult.url,
          secureUrl: uploadResult.secureUrl,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          locationId: parseInt(locationId),
        },
      });
      return NextResponse.json({ success: true, image });
    }

    if (category === 'site' && siteCategory) {
      // 기존 활성 이미지 비활성화 (같은 카테고리)
      await prisma.siteImage.updateMany({
        where: { category: siteCategory, isActive: true },
        data: { isActive: false },
      });

      const image = await prisma.siteImage.create({
        data: {
          category: siteCategory,
          publicId: uploadResult.publicId,
          url: uploadResult.url,
          secureUrl: uploadResult.secureUrl,
          width: uploadResult.width,
          height: uploadResult.height,
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, image });
    }

    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);

    // 에러 메시지 상세화
    let errorMessage = '이미지 업로드에 실패했습니다.';
    if (error instanceof Error) {
      if (error.message.includes('CLOUDINARY')) {
        errorMessage = 'Cloudinary 서버에 연결할 수 없습니다. 환경 변수를 확인해주세요.';
      } else if (error.message.includes('size')) {
        errorMessage = '파일 크기가 너무 큽니다.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
