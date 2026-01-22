/**
 * 라우브필름 짝꿍 코드 시스템
 *
 * 코드 생성 규칙:
 * - 형식: YYMMDD + 계약자 성함
 * - 예시: 250122홍길동
 * - 생성 시점: 관리자가 예약을 "확정(CONFIRMED)" 상태로 변경할 때
 */

import { prisma } from './prisma';
import type { Booking } from '@prisma/client';

export interface PartnerCodeValidation {
  valid: boolean;
  booking?: Booking;
  error?: string;
}

/**
 * 짝꿍 코드 생성
 * @param weddingDate 예식 날짜
 * @param customerName 계약자 성함
 * @returns 생성된 짝꿍 코드 (예: "250122홍길동")
 */
export function generatePartnerCode(weddingDate: Date, customerName: string): string {
  const yy = weddingDate.getFullYear().toString().slice(-2);
  const mm = (weddingDate.getMonth() + 1).toString().padStart(2, '0');
  const dd = weddingDate.getDate().toString().padStart(2, '0');

  // 이름에서 공백 제거
  const cleanName = customerName.replace(/\s/g, '');

  return `${yy}${mm}${dd}${cleanName}`;
}

/**
 * 짝꿍 코드 유효성 검증 및 조회
 * @param code 짝꿍 코드
 * @returns 검증 결과
 */
export async function validatePartnerCode(code: string): Promise<PartnerCodeValidation> {
  if (!code || code.trim() === '') {
    return { valid: false, error: '짝꿍 코드를 입력해주세요.' };
  }

  const trimmedCode = code.trim();

  // DB에서 코드 조회
  const booking = await prisma.booking.findUnique({
    where: { partnerCode: trimmedCode },
  });

  if (!booking) {
    return { valid: false, error: '존재하지 않는 짝꿍 코드입니다.' };
  }

  if (booking.status === 'CANCELLED') {
    return { valid: false, error: '취소된 예약의 코드입니다.' };
  }

  if (booking.isAnonymized) {
    return { valid: false, error: '더 이상 유효하지 않은 코드입니다.' };
  }

  return { valid: true, booking };
}

/**
 * 짝꿍 할인 적용 (양방향)
 * - 신규 고객: 추천인 코드를 입력하면 1만원 할인
 * - 추천인(기존 고객): 신규 고객이 예약 확정되면 1만원 할인
 *
 * @param newBookingId 신규 예약 ID
 * @param referrerCode 추천인 짝꿍 코드
 * @returns 적용 결과
 */
export async function applyReferralDiscount(
  newBookingId: number,
  referrerCode: string
): Promise<{
  success: boolean;
  error?: string;
  newBookingDiscount?: number;
  referrerDiscount?: number;
}> {
  // 추천인 코드 검증
  const validation = await validatePartnerCode(referrerCode);
  if (!validation.valid || !validation.booking) {
    return { success: false, error: validation.error };
  }

  const referrerBooking = validation.booking;

  // 트랜잭션으로 양쪽 할인 적용
  try {
    await prisma.$transaction(async (tx) => {
      // 1. 신규 고객 할인 적용
      await tx.booking.update({
        where: { id: newBookingId },
        data: {
          referralDiscount: 10000,
          referredBy: referrerCode,
          referredByBookingId: referrerBooking.id,
        },
      });

      // 2. 추천인 할인 적용 (기존 할인에 추가)
      await tx.booking.update({
        where: { id: referrerBooking.id },
        data: {
          referralDiscount: {
            increment: 10000,
          },
        },
      });
    });

    return {
      success: true,
      newBookingDiscount: 10000,
      referrerDiscount: 10000,
    };
  } catch (error) {
    console.error('짝꿍 할인 적용 오류:', error);
    return { success: false, error: '짝꿍 할인 적용 중 오류가 발생했습니다.' };
  }
}

/**
 * 짝꿍 코드로 추천한 고객 목록 조회
 * @param partnerCode 짝꿍 코드
 * @returns 추천한 고객 목록
 */
export async function getReferrals(partnerCode: string): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: { referredBy: partnerCode },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 커스텀 짝꿍 코드 설정 (닉네임 요청 시)
 * @param bookingId 예약 ID
 * @param customCode 커스텀 코드
 * @returns 성공 여부
 */
export async function setCustomPartnerCode(
  bookingId: number,
  customCode: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedCode = customCode.trim();

  // 중복 체크
  const existing = await prisma.booking.findUnique({
    where: { partnerCode: trimmedCode },
  });

  if (existing && existing.id !== bookingId) {
    return { success: false, error: '이미 사용 중인 짝꿍 코드입니다.' };
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { partnerCode: trimmedCode },
    });
    return { success: true };
  } catch (error) {
    console.error('짝꿍 코드 변경 오류:', error);
    return { success: false, error: '짝꿍 코드 변경 중 오류가 발생했습니다.' };
  }
}
