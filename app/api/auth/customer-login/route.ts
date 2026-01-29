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
    const { name, phone, email } = body;
    const loginEmail = (email || '').trim().toLowerCase();
    const loginPhone = phone ? normalizePhone(phone) : '';

    // 입력 검증: 성함 + (전화번호 또는 이메일)
    if (!name || (!loginPhone && !loginEmail)) {
      return NextResponse.json(
        { error: '성함과 전화번호(또는 해외 거주 시 이메일)를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (loginPhone && (loginPhone.length < 10 || loginPhone.length > 11)) {
      return NextResponse.json(
        { error: '올바른 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Reservation 테이블에서 조회 (계약자 성함 + 전화번호 또는 이메일)
    const reservations = await prisma.reservation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    const trimmedName = name.trim();

    // 복호화 후 비교
    const reservation = reservations.find((r) => {
      const decryptedAuthor = decrypt(r.author) || '';
      const decryptedBrideName = decrypt(r.brideName) || '';
      const decryptedGroomName = decrypt(r.groomName) || '';
      const decryptedBridePhone = decrypt(r.bridePhone) || '';
      const decryptedGroomPhone = decrypt(r.groomPhone) || '';
      const decryptedProductEmail = (decrypt(r.productEmail) || '').trim().toLowerCase();

      // 해외 거주: 성함 + 이메일로 로그인
      if (r.overseasResident && loginEmail) {
        if (decryptedProductEmail !== loginEmail) return false;
        if (decryptedAuthor === trimmedName || decryptedBrideName === trimmedName || decryptedGroomName === trimmedName) {
          return true;
        }
        return false;
      }

      // 일반: 전화번호로 로그인
      if (!loginPhone) return false;
      const normalizedBride = decryptedBridePhone.replace(/[^0-9]/g, '');
      const normalizedGroom = decryptedGroomPhone.replace(/[^0-9]/g, '');
      if (decryptedBrideName === trimmedName && normalizedBride === loginPhone) return true;
      if (decryptedGroomName === trimmedName && normalizedGroom === loginPhone) return true;
      if (decryptedAuthor === trimmedName && (normalizedBride === loginPhone || normalizedGroom === loginPhone)) return true;
      return false;
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '일치하는 예약 정보를 찾을 수 없습니다.\n성함과 예약 시 입력한 전화번호를 확인해주세요.' },
        { status: 404 }
      );
    }

    // 세션 토큰 생성 (해외 거주 시 customerPhone에 이메일 저장)
    const decryptedAuthor = decrypt(reservation.author) || '';
    const decryptedEmail = reservation.overseasResident ? (decrypt(reservation.productEmail) || '') : '';
    const sessionToken = Buffer.from(
      JSON.stringify({
        reservationId: reservation.id,
        customerName: decryptedAuthor,
        customerPhone: reservation.overseasResident ? decryptedEmail : loginPhone,
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
