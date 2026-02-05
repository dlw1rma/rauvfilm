/**
 * 고객 인증 유틸리티
 * - HMAC 서명된 세션 토큰
 * - 만료 시간 검증
 */

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { Reservation } from '@prisma/client';

// 세션 시크릿키 (admin auth와 동일)
function getSessionSecret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error('SESSION_SECRET 환경변수가 설정되지 않았습니다.');
  }
  return value;
}

export interface CustomerSession {
  reservationId: number;
  bookingId?: number;
  customerName: string;
  customerPhone: string;
  referralCode?: string | null;
  exp: number;
}

/**
 * 고객 세션 토큰 생성 (HMAC 서명 포함)
 */
export function createCustomerSessionToken(session: CustomerSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64');

  // HMAC 서명 생성
  const hmac = crypto.createHmac('sha256', getSessionSecret());
  hmac.update(payload);
  const signature = hmac.digest('hex');

  return `${payload}.${signature}`;
}

/**
 * 고객 세션 토큰 검증 및 파싱
 */
export function verifyCustomerSessionToken(token: string): CustomerSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;

    // HMAC 검증
    const hmac = crypto.createHmac('sha256', getSessionSecret());
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // 타이밍 공격 방지를 위한 상수 시간 비교
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) {
      return null;
    }

    // 페이로드 파싱
    const session = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    ) as CustomerSession;

    // 만료 확인
    if (session.exp < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * 현재 고객 세션 가져오기
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');

    if (!sessionCookie?.value) {
      return null;
    }

    // 새 형식 (서명됨) 먼저 시도
    if (sessionCookie.value.includes('.')) {
      return verifyCustomerSessionToken(sessionCookie.value);
    }

    // 이전 형식 (서명 없음) - 마이그레이션 기간 동안 호환성 유지
    // TODO: 일정 기간 후 이 폴백 제거
    const session = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    ) as CustomerSession;

    if (session.exp < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * 현재 로그인된 고객의 예약 정보 가져오기
 */
export async function getCurrentReservation(): Promise<Reservation | null> {
  const session = await getCustomerSession();

  if (!session) {
    return null;
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: session.reservationId },
  });

  return reservation;
}

/**
 * 고객 로그아웃
 */
export async function logoutCustomer(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('customer_session');
}

/**
 * 전화번호 마스킹 (010-****-1234)
 */
export function maskPhone(phone: string): string {
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-****-${phone.slice(7)}`;
  }
  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-***-${phone.slice(6)}`;
  }
  return '***-****-****';
}

/**
 * 전화번호 포맷팅 (01012345678 -> 010-1234-5678)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
