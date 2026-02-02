import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** 공개: 활성 사이트 이미지를 카테고리별 1건씩 반환 (로고, Color Before/After 등 홈/헤더용) */
export async function GET() {
  try {
    const images = await prisma.siteImage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const byCategory: Record<string, { secureUrl: string; url?: string; width?: number; height?: number; alt?: string | null }> = {};
    for (const img of images) {
      if (!byCategory[img.category]) {
        byCategory[img.category] = {
          secureUrl: img.secureUrl,
          url: img.url,
          width: img.width ?? undefined,
          height: img.height ?? undefined,
          alt: img.alt ?? undefined,
        };
      }
    }

    return NextResponse.json(byCategory);
  } catch (error) {
    console.error('Fetch site images (public) error:', error);
    return NextResponse.json({ error: '이미지를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
