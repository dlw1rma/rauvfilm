/**
 * 고객 인증 유틸리티
 */

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Booking } from '@prisma/client';

export interface CustomerSession {
  bookingId: number;
  customerName: string;
  customerPhone: string;
  exp: number;
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

    const session = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
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
 * 현재 로그인된 고객의 예약 정보 가져오기
 */
export async function getCurrentBooking(): Promise<Booking | null> {
  const session = await getCustomerSession();

  if (!session) {
    return null;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: session.bookingId },
    include: {
      product: true,
      discountEvent: true,
      reviewSubmissions: true,
    },
  });

  return booking;
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
