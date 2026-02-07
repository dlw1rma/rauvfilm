import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 모든 장소 조회 (관리자용 - 이미지 포함)
export async function GET() {
  try {
    const locations = await prisma.eventSnapLocation.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Fetch locations error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

// 새 장소 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameEn, nameJa, slug, description, descriptionEn, descriptionJa, order } = body;

    const location = await prisma.eventSnapLocation.create({
      data: {
        name,
        nameEn,
        nameJa,
        slug,
        description,
        descriptionEn,
        descriptionJa,
        order: order || 0,
      },
    });

    return NextResponse.json({ success: true, location });
  } catch (error) {
    console.error('Create location error:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
