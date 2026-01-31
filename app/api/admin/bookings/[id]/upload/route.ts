/**
 * 관리자 - 영상/계약서 업로드 API
 * POST /api/admin/bookings/[id]/upload
 *
 * 영상 링크와 계약서 파일 URL을 등록합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';
import { safeParseInt, isValidUrl, sanitizeString } from '@/lib/validation';
import { sendTemplateSms } from '@/lib/solapi';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  // 서명 검증 추가
  return validateSessionToken(adminSession.value);
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
    const bookingId = safeParseInt(id, 0, 1, 2147483647);
    if (bookingId === 0) {
      return NextResponse.json(
        { error: '잘못된 예약 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { videoUrl, contractUrl } = body;

    // URL 검증
    if (videoUrl && !isValidUrl(videoUrl)) {
      return NextResponse.json(
        { error: '올바른 영상 URL 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    if (contractUrl && !isValidUrl(contractUrl)) {
      return NextResponse.json(
        { error: '올바른 계약서 URL 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    const sanitizedVideoUrl = videoUrl ? sanitizeString(videoUrl, 2000) : null;
    const sanitizedContractUrl = contractUrl ? sanitizeString(contractUrl, 2000) : null;

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
      if (videoUrl && ['COMPLETED', 'DEPOSIT_PAID'].includes(booking.status)) {
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

    // 카카오 알림톡 발송 (실패해도 업로드 자체는 성공 처리)
    if (booking.customerPhone) {
      if (sanitizedContractUrl && sanitizedContractUrl !== booking.contractUrl) {
        try {
          const result = await sendTemplateSms(
            booking.customerPhone,
            'contract',
            booking.customerName,
            sanitizedContractUrl,
          );
          console.log('[알림톡] 계약서 안내 발송 성공:', { to: booking.customerPhone, groupId: result.groupId });
        } catch (sendError) {
          console.error('[알림톡] 계약서 안내 발송 실패:', sendError);
        }
      }
      if (sanitizedVideoUrl && sanitizedVideoUrl !== booking.videoUrl) {
        try {
          const result = await sendTemplateSms(
            booking.customerPhone,
            'video',
            booking.customerName,
            sanitizedVideoUrl,
          );
          console.log('[알림톡] 영상 안내 발송 성공:', { to: booking.customerPhone, groupId: result.groupId });
        } catch (sendError) {
          console.error('[알림톡] 영상 안내 발송 실패:', sendError);
        }
      }
    }

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
