/**
 * 관리자 - 영상/계약서 업로드 API
 * POST /api/admin/bookings/[id]/upload
 *
 * 영상 링크와 계약서 파일 URL을 등록합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return !!adminSession?.value;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await request.json();
    const { videoUrl, contractUrl } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // 영상 URL 업데이트
    if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl || null;

      // 영상 최초 업로드 시 업로드일 기록 (5년 파기 기준)
      if (videoUrl && !booking.videoUploadedAt) {
        updateData.videoUploadedAt = new Date();
      }

      // 영상 업로드 완료 시 상태 변경
      if (videoUrl && booking.status === 'COMPLETED') {
        updateData.status = 'DELIVERED';
      }
    }

    // 계약서 URL 업데이트
    if (contractUrl !== undefined) {
      updateData.contractUrl = contractUrl || null;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        videoUrl: updatedBooking.videoUrl,
        contractUrl: updatedBooking.contractUrl,
        videoUploadedAt: updatedBooking.videoUploadedAt,
        status: updatedBooking.status,
      },
      message: '파일이 등록되었습니다.',
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
