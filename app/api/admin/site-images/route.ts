import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정 초기화
if (typeof process.env.CLOUDINARY_CLOUD_NAME === 'string') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// 활성화된 사이트 이미지 조회
export async function GET() {
  try {
    const images = await prisma.siteImage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Fetch site images error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

// Cloudinary에서 선택한 이미지로 사이트 이미지 설정
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const body = await request.json();
    const { category, publicId } = body;

    if (!category || !publicId) {
      return NextResponse.json(
        { error: '카테고리와 이미지 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Cloudinary에서 이미지 정보 가져오기
    const imageInfo = await cloudinary.api.resource(publicId);

    // 기존 활성 이미지 비활성화
    await prisma.siteImage.updateMany({
      where: { category, isActive: true },
      data: { isActive: false },
    });

    // 새 이미지 저장
    const image = await prisma.siteImage.create({
      data: {
        category,
        publicId: imageInfo.public_id,
        url: imageInfo.url,
        secureUrl: imageInfo.secure_url,
        width: imageInfo.width,
        height: imageInfo.height,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('사이트 이미지 설정 오류:', error);
    return NextResponse.json(
      { error: '이미지 설정에 실패했습니다.' },
      { status: 500 }
    );
  }
}
