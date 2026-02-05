/**
 * 미들웨어: 마이페이지 접근 제한
 *
 * CONFIRMED 상태가 아닌 예약은 마이페이지에 접근할 수 없습니다.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 마이페이지 경로 패턴
const MYPAGE_PATHS = [
  '/mypage',
  '/mypage/reservations',
  '/mypage/review',
  '/mypage/downloads',
  '/mypage/partner-code',
  '/mypage/event-snap',
];

// 로그인 페이지는 접근 허용
const ALLOWED_PATHS = [
  '/mypage/login',
  '/mypage/access-restricted',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 마이페이지가 아니면 통과
  if (!pathname.startsWith('/mypage')) {
    return NextResponse.next();
  }

  // 로그인 페이지 및 접근 제한 페이지는 허용
  if (ALLOWED_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // 고객 세션 쿠키 확인
  const customerSession = request.cookies.get('customer_session');

  if (!customerSession?.value) {
    // 로그인되지 않으면 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/mypage/login', request.url));
  }

  try {
    // 세션 디코딩
    const session = JSON.parse(
      Buffer.from(customerSession.value, 'base64').toString('utf-8')
    );

    // 만료 확인
    if (session.exp < Date.now()) {
      const response = NextResponse.redirect(new URL('/mypage/login', request.url));
      response.cookies.delete('customer_session');
      return response;
    }

    // 세션에 reservationId가 없으면 로그인 페이지로
    if (!session.reservationId) {
      return NextResponse.redirect(new URL('/mypage/login', request.url));
    }

    // 참고: 실제 CONFIRMED 상태 확인은 DB 조회가 필요하므로
    // 페이지 레벨(API)에서 추가 검증합니다.
    // 미들웨어에서는 기본 세션 유효성만 확인합니다.

    return NextResponse.next();
  } catch {
    // 세션 파싱 실패 시 로그인 페이지로
    const response = NextResponse.redirect(new URL('/mypage/login', request.url));
    response.cookies.delete('customer_session');
    return response;
  }
}

export const config = {
  matcher: [
    '/mypage/:path*',
  ],
};
