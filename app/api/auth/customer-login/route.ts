/**
 * 고객 로그인 API
 * POST /api/auth/customer-login
 *
 * 성함 + 전화번호로 로그인 (별도 비밀번호 없음)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// 전화번호 정규화 (하이픈 제거)
function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    // 입력 검증
    if (!name || !phone) {
      return NextResponse.json(
        { error: '성함과 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      return NextResponse.json(
        { error: '올바른 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 예약 조회 (성함 + 전화번호로)
    const booking = await prisma.booking.findFirst({
      where: {
        customerName: name.trim(),
        customerPhone: normalizedPhone,
        isAnonymized: false, // 개인정보 파기되지 않은 예약만
      },
      include: {
        product: true,
        discountEvent: true,
        reviewSubmissions: true,
      },
      orderBy: {
        createdAt: 'desc', // 최신 예약 우선
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '일치하는 예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 세션 토큰 생성 (간단한 구현 - 실제로는 JWT 등 사용 권장)
    const sessionToken = Buffer.from(
      JSON.stringify({
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24시간 후 만료
      })
    ).toString('base64');

    // 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set('customer_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    });

    // 응답 (민감 정보 제외)
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        weddingDate: booking.weddingDate,
        weddingVenue: booking.weddingVenue,
        status: booking.status,
        partnerCode: booking.partnerCode,
        product: {
          name: booking.product.name,
        },
      },
    });
  } catch (error) {
    console.error('고객 로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
