/**
 * 라우브필름 잔금 계산 시스템
 *
 * 잔금 계산 공식:
 * Final Balance = 정가 - 예약금(10만원) - 이벤트할인 - 짝꿍할인 - 후기할인
 */

export interface BalanceCalculation {
  listPrice: number;          // 정가
  travelFee: number;          // 출장비
  depositAmount: number;      // 예약금 (10만원)
  eventDiscount: number;      // 이벤트 할인
  referralDiscount: number;   // 짝꿍 할인 (1만원)
  reviewDiscount: number;     // 후기 할인 (1만원 x 후기 수)
  totalDiscount: number;      // 총 할인 금액
  finalBalance: number;       // 최종 잔금
}

export interface CalculateBalanceOptions {
  depositAmount?: number;     // 예약금 (기본 10만원)
  travelFee?: number;         // 출장비
  eventDiscount?: number;     // 이벤트 할인 금액
  hasReferral?: boolean;      // 짝꿍 코드 사용 여부
  approvedReviewCount?: number; // 승인된 후기 수
}

// 상수
export const DEFAULT_DEPOSIT_AMOUNT = 100000;  // 10만원
export const REFERRAL_DISCOUNT_AMOUNT = 10000; // 짝꿍 할인 1만원
export const REVIEW_DISCOUNT_AMOUNT = 10000;   // 후기 할인 1만원 (건당)

/**
 * 잔금 계산 함수
 * @param listPrice 정가
 * @param options 할인 옵션
 * @returns 상세 계산 결과
 */
export function calculateBalance(
  listPrice: number,
  options: CalculateBalanceOptions = {}
): BalanceCalculation {
  const depositAmount = options.depositAmount ?? DEFAULT_DEPOSIT_AMOUNT;
  const travelFee = options.travelFee ?? 0;
  const eventDiscount = options.eventDiscount ?? 0;
  const referralDiscount = options.hasReferral ? REFERRAL_DISCOUNT_AMOUNT : 0;
  const reviewDiscount = (options.approvedReviewCount ?? 0) * REVIEW_DISCOUNT_AMOUNT;

  const totalDiscount = eventDiscount + referralDiscount + reviewDiscount;

  // 최종 잔금 = 정가 + 출장비 - 예약금 - 총 할인
  // 음수가 되지 않도록 처리
  const finalBalance = Math.max(0, listPrice + travelFee - depositAmount - totalDiscount);

  return {
    listPrice,
    travelFee,
    depositAmount,
    eventDiscount,
    referralDiscount,
    reviewDiscount,
    totalDiscount,
    finalBalance,
  };
}

/**
 * 잔금 계산 결과를 포맷팅된 문자열로 반환
 * @param calculation 계산 결과
 * @returns 포맷팅된 문자열
 */
export function formatBalanceBreakdown(calculation: BalanceCalculation): string {
  const formatKRW = (amount: number) => amount.toLocaleString('ko-KR') + '원';

  const lines = [
    `정가: ${formatKRW(calculation.listPrice)}`,
    `예약금: -${formatKRW(calculation.depositAmount)}`,
  ];

  if (calculation.eventDiscount > 0) {
    lines.push(`이벤트 할인: -${formatKRW(calculation.eventDiscount)}`);
  }
  if (calculation.referralDiscount > 0) {
    lines.push(`짝꿍 할인: -${formatKRW(calculation.referralDiscount)}`);
  }
  if (calculation.reviewDiscount > 0) {
    lines.push(`후기 할인: -${formatKRW(calculation.reviewDiscount)}`);
  }

  lines.push(`─────────────────`);
  lines.push(`최종 잔금: ${formatKRW(calculation.finalBalance)}`);

  return lines.join('\n');
}

/**
 * 금액을 한국 원화 형식으로 포맷팅
 * @param amount 금액
 * @returns 포맷팅된 문자열 (예: "100,000원")
 */
export function formatKRW(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

/**
 * venueRegion에서 시/도와 구/군을 파싱
 * @param venueRegion "서울특별시 강남구" 형태의 문자열
 * @returns { region: string, district: string | null }
 */
export function parseVenueRegion(venueRegion: string): { region: string; district: string | null } {
  if (!venueRegion) return { region: '', district: null };
  const parts = venueRegion.trim().split(/\s+/);
  return {
    region: parts[0] || '',
    district: parts[1] || null,
  };
}

