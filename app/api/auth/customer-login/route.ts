/**
 * 고객 로그인 API
 * POST /api/auth/customer-login
 *
 * 성함 + 전화번호로 로그인 (Reservation 테이블 조회)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/encryption';

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

    // Reservation 테이블에서 조회 (계약자 성함 + 전화번호)
    // 암호화된 필드이므로 모든 예약을 가져와서 복호화 후 비교
    const reservations = await prisma.reservation.findMany({
      orderBy: {
        createdAt: 'desc', // 최신 예약 우선
      },
      take: 100, // 최근 100개만 조회 (성능 최적화)
    });

    // 복호화 후 비교
    const reservation = reservations.find((r) => {
      const decryptedAuthor = decrypt(r.author) || '';
      const decryptedBrideName = decrypt(r.brideName) || '';
      const decryptedGroomName = decrypt(r.groomName) || '';
      const decryptedBridePhone = decrypt(r.bridePhone) || '';
      const decryptedGroomPhone = decrypt(r.groomPhone) || '';

      const trimmedName = name.trim();
      
      // 신부 정보로 로그인
      if (decryptedBrideName === trimmedName && decryptedBridePhone.replace(/[^0-9]/g, '') === normalizedPhone) {
        return true;
      }
      // 신랑 정보로 로그인
      if (decryptedGroomName === trimmedName && decryptedGroomPhone.replace(/[^0-9]/g, '') === normalizedPhone) {
        return true;
      }
      // 계약자 이름 + 신부 전화번호
      if (decryptedAuthor === trimmedName && decryptedBridePhone.replace(/[^0-9]/g, '') === normalizedPhone) {
        return true;
      }
      // 계약자 이름 + 신랑 전화번호
      if (decryptedAuthor === trimmedName && decryptedGroomPhone.replace(/[^0-9]/g, '') === normalizedPhone) {
        return true;
      }
      
      return false;
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '일치하는 예약 정보를 찾을 수 없습니다.\n성함과 예약 시 입력한 전화번호를 확인해주세요.' },
        { status: 404 }
      );
    }

    // 세션 토큰 생성
    const decryptedAuthor = decrypt(reservation.author) || '';
    const sessionToken = Buffer.from(
      JSON.stringify({
        reservationId: reservation.id,
        customerName: decryptedAuthor,
        customerPhone: normalizedPhone,
        referralCode: reservation.referralCode,
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
      reservation: {
        id: reservation.id,
        customerName: decryptedAuthor,
        weddingDate: reservation.weddingDate,
        venueName: reservation.venueName,
        status: reservation.status,
        referralCode: reservation.referralCode,
        productType: reservation.productType,
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
