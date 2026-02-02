import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 공개 장소 및 이미지 조회
export async function GET() {
  try {
    const locations = await prisma.eventSnapLocation.findMany({
      where: { isVisible: true },
      include: {
        images: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    const response = NextResponse.json(locations);
    response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");
    return response;
  } catch (error) {
    console.error('Fetch public locations error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
