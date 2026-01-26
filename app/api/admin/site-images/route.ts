import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
