/**
 * 이벤트 스냅 - Cloudinary에서 선택한 이미지를 장소에 등록
 * POST /api/admin/event-snap/add-from-cloudinary
 * Body: { locationId: number, publicId: string, secureUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authResponse = await requireAdminAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const { locationId, publicId, secureUrl } = body;

    if (!locationId || !publicId || !secureUrl) {
      return NextResponse.json(
        { error: 'locationId, publicId, secureUrl가 필요합니다.' },
        { status: 400 }
      );
    }

    const loc = await prisma.eventSnapLocation.findUnique({
      where: { id: Number(locationId) },
    });
    if (!loc) {
      return NextResponse.json({ error: '해당 장소가 없습니다.' }, { status: 404 });
    }

    await prisma.eventSnapImage.create({
      data: {
        locationId: Number(locationId),
        publicId: String(publicId),
        url: String(secureUrl),
        secureUrl: String(secureUrl),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('이벤트 스냅 Cloudinary 등록 오류:', error);
    return NextResponse.json(
      { error: '이미지 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
