/**
 * 공통 상수 정의
 * - 상태 라벨 및 색상
 * - 가격 관련 상수
 * - 상품 옵션 가격
 */

// ===== 예약/북킹 상태 =====
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DEPOSIT_COMPLETED: 'DEPOSIT_COMPLETED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: '검토중',
  CONFIRMED: '예약확정',
  DEPOSIT_COMPLETED: '입금완료',
  DELIVERED: '전달완료',
  CANCELLED: '취소',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  CONFIRMED: 'bg-blue-500/10 text-blue-600',
  DEPOSIT_COMPLETED: 'bg-green-500/10 text-green-600',
  DELIVERED: 'bg-purple-500/10 text-purple-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
};

// ===== 리뷰 제출 상태 =====
export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: '대기중',
  MANUAL_REVIEW: '수동 검토 필요',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
};

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  MANUAL_REVIEW: 'bg-orange-500/10 text-orange-600',
  APPROVED: 'bg-green-500/10 text-green-600',
  REJECTED: 'bg-red-500/10 text-red-600',
};

// ===== 리뷰 플랫폼 =====
export const REVIEW_PLATFORM = {
  NAVER_BLOG: 'NAVER_BLOG',
  NAVER_CAFE: 'NAVER_CAFE',
  INSTAGRAM: 'INSTAGRAM',
  OTHER: 'OTHER',
} as const;

export type ReviewPlatform = typeof REVIEW_PLATFORM[keyof typeof REVIEW_PLATFORM];

export const REVIEW_PLATFORM_LABELS: Record<ReviewPlatform, string> = {
  NAVER_BLOG: '네이버 블로그',
  NAVER_CAFE: '네이버 카페',
  INSTAGRAM: '인스타그램',
  OTHER: '기타',
};

// ===== 상품 타입 =====
export const PRODUCT_TYPE = {
  BUDGET: '가성비형',
  STANDARD: '기본형',
  CINEMATIC: '시네마틱형',
} as const;

export type ProductType = typeof PRODUCT_TYPE[keyof typeof PRODUCT_TYPE];

/**
 * 가성비형/1인1캠 상품인지 확인
 * - 예약후기 할인 혜택 제외 (1건만 인정, 원본영상 전달)
 */
export function isBudgetProduct(productType: string | null | undefined): boolean {
  if (!productType) return false;
  const normalized = productType.toLowerCase().replace(/\s/g, '');
  return (
    productType === '가성비형' ||
    normalized.includes('가성비') ||
    normalized.includes('1인1캠') ||
    normalized === '1인1캠'
  );
}

/**
 * 신년할인 제외 대상인지 확인
 * - 1인1캠(가성비형) 및 르메그라피 제휴가는 신년할인 적용 불가
 */
export function isExcludedFromNewYearDiscount(productName: string | null | undefined): boolean {
  if (!productName) return false;
  const normalized = productName.toLowerCase().replace(/\s/g, '');
  return (
    productName === '가성비형' ||
    normalized.includes('가성비') ||
    normalized.includes('1인1캠') ||
    normalized.includes('르메그라피')
  );
}

// ===== 상품 정가 (참조용) =====
export const PRODUCT_PRICES: Record<string, number> = {
  '가성비형': 340000,
  '기본형': 600000,
  '시네마틱형': 950000,
} as const;

// ===== 가격 상수 =====
export const PRICING = {
  DEPOSIT_AMOUNT: 100000, // 예약금 10만원

  // 추가 촬영 옵션 가격
  OPTIONS: {
    MAKEUP_SHOOT: 200000,     // 메이크업샵 촬영
    PAEBAEK_SHOOT: 50000,     // 폐백 촬영
    RECEPTION_SHOOT: 50000,   // 피로연(2부) 촬영
    USB_OPTION: 20000,        // USB 추가
  },

  // 할인 금액
  DISCOUNTS: {
    COUPLE: 10000,            // 짝궁할인 1만원
    REVIEW: 10000,            // 후기할인 1만원 (per review)
    REFERRAL: 10000,          // 추천할인 1만원
  },
} as const;

// ===== 옵션 라벨 =====
export const OPTION_LABELS = {
  makeupShoot: '메이크업샵 촬영',
  paebaekShoot: '폐백 촬영',
  receptionShoot: '피로연(2부) 촬영',
  usbOption: 'USB 추가',
  seonwonpan: '선원판',
  gimbalShoot: '짐벌 촬영',
} as const;

// ===== 할인 라벨 =====
export const DISCOUNT_LABELS = {
  discountNewYear: '신년할인',
  discountCouple: '짝궁할인',
  discountReview: '촬영후기 할인',
  discountReviewBlog: '예약후기',
} as const;

// ===== 이벤트 스냅 상태 =====
export const EVENT_SNAP_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type EventSnapStatus = typeof EVENT_SNAP_STATUS[keyof typeof EVENT_SNAP_STATUS];

export const EVENT_SNAP_STATUS_LABELS: Record<EventSnapStatus, string> = {
  PENDING: '대기중',
  CONFIRMED: '확정',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

// ===== 어드민 역할 =====
export const ADMIN_ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  STAFF: 'STAFF',
} as const;

export type AdminRole = typeof ADMIN_ROLE[keyof typeof ADMIN_ROLE];

// ===== 시간 상수 =====
export const TIME = {
  SESSION_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24시간
  SESSION_EXPIRY_SECONDS: 24 * 60 * 60,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1분
} as const;

// ===== 페이지네이션 =====
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ===== 지역 (출장비 계산용) =====
export const BRANCHES = ['서울점', '청주점'] as const;
export type Branch = typeof BRANCHES[number];

// ===== 유효성 검증 상수 =====
export const VALIDATION = {
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 11,
  NAME_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 5000,
  EMAIL_MAX_LENGTH: 100,
  URL_MAX_LENGTH: 500,
} as const;
