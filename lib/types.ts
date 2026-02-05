/**
 * 공통 타입 정의
 */

import type {
  BookingStatus,
  ReviewStatus,
  ReviewPlatform,
  ProductType,
  EventSnapStatus,
  AdminRole,
} from './constants';

// ===== API 응답 타입 =====
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== 상품 =====
export interface Product {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  description?: string | null;
  isActive: boolean;
}

// ===== 할인 이벤트 =====
export interface DiscountEvent {
  id: number;
  name: string;
  amount: number;
  amountFormatted: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isOngoing: boolean;
}

// ===== 예약 (Reservation) =====
export interface ReservationSummary {
  id: number;
  title: string;
  status: BookingStatus;
  statusLabel: string;
  weddingDate: string | null;
  venueName: string | null;
  productType: string | null;
  createdAt: string;
}

export interface ReservationDetail extends ReservationSummary {
  author: string;
  brideName: string | null;
  bridePhone: string | null;
  groomName: string | null;
  groomPhone: string | null;
  weddingTime: string | null;
  venueFloor: string | null;
  guestCount: number | null;
  mainSnapCompany: string | null;
  makeupShoot: boolean;
  paebaekShoot: boolean;
  receptionShoot: boolean;
  usbOption: boolean;
  seonwonpan: boolean;
  gimbalShoot: boolean;
  discountNewYear: boolean;
  discountCouple: boolean;
  discountReview: boolean;
  discountReviewBlog: boolean;
  partnerCode: string | null;
  referredBy: string | null;
  specialNotes: string | null;
  travelFee: number;
  totalAmount: number;
  depositAmount: number;
  discountAmount: number;
  finalBalance: number;
}

// ===== 북킹 (Booking) =====
export interface BookingSummary {
  id: number;
  customerName: string;
  customerPhone: string;
  weddingDate: string;
  weddingVenue: string;
  weddingTime: string | null;
  status: BookingStatus;
  partnerCode: string | null;
  reservationId: number | null;
  product: {
    id: number;
    name: string;
  };
  listPrice: number;
  listPriceFormatted: string;
  finalBalance: number;
  finalBalanceFormatted: string;
}

export interface BookingDetail extends BookingSummary {
  customerEmail: string | null;
  depositAmount: number;
  depositAmountFormatted: string;
  depositPaidAt: string | null;
  travelFee: number;
  travelFeeFormatted: string;
  eventDiscount: number;
  eventDiscountFormatted: string;
  referralDiscount: number;
  referralDiscountFormatted: string;
  reviewDiscount: number;
  reviewDiscountFormatted: string;
  balancePaidAt: string | null;
  videoUrl: string | null;
  contractUrl: string | null;
  adminNote: string | null;
  referredBy: string | null;
  discountEvent: DiscountEvent | null;
}

// ===== 리뷰 제출 =====
export interface ReviewSubmission {
  id: number;
  reservationId: number;
  reviewUrl: string;
  platform: ReviewPlatform;
  status: ReviewStatus;
  amount: number;
  verificationNote: string | null;
  createdAt: string;
  approvedAt: string | null;
}

// ===== 이벤트 스냅 =====
export interface EventSnapApplication {
  id: number;
  type: string;
  status: EventSnapStatus;
  shootDate: string | null;
  shootTime: string | null;
  shootLocation: string | null;
  customerName: string;
  customerPhone: string;
}

// ===== 포트폴리오 =====
export interface Portfolio {
  id: number;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  category: string | null;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
}

// ===== 리뷰 =====
export interface Review {
  id: number;
  source: string;
  sourceUrl: string;
  title: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
}

// ===== 사이트 이미지 =====
export interface SiteImage {
  id: number;
  category: string;
  cloudinaryPublicId: string;
  url: string;
  alt: string | null;
  displayOrder: number;
  isVisible: boolean;
}

// ===== 출장비 규칙 =====
export interface TravelFeeRule {
  id: number;
  branch: string;
  region: string;
  district: string;
  fee: number;
}

// ===== 폼 데이터 타입 =====
export interface ReservationFormData {
  // 기본 정보
  title: string;
  password: string;
  isPrivate: boolean;
  privacyAgreed: boolean;
  termsAgreed: boolean;
  faqRead: boolean;

  // 고객 정보
  brideName: string;
  bridePhone: string;
  groomName: string;
  groomPhone: string;
  productEmail: string;
  overseasResident: boolean;
  isBrideContractor: boolean;
  isGroomContractor: boolean;

  // 예식 정보
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueFloor: string;
  guestCount: string;

  // 상품
  productType: ProductType | '';

  // 옵션
  makeupShoot: boolean;
  paebaekShoot: boolean;
  receptionShoot: boolean;
  usbOption: boolean;
  seonwonpan: boolean;
  gimbalShoot: boolean;

  // 할인
  discountNewYear: boolean;
  discountCouple: boolean;
  discountReview: boolean;
  discountReviewBlog: boolean;
  partnerCode: string;
  referralNickname: string;

  // 기타
  foundPath: string;
  mainSnapCompany: string;
  makeupShop: string;
  dressShop: string;
  deliveryAddress: string;
  playbackDevice: string[];
  specialNotes: string;

  // 커스텀 촬영
  customShootingRequest: boolean;
  customStyle: string[];
  customEditStyle: string[];
  customMusic: string[];
  customLength: string[];
  customEffect: string[];
  customContent: string[];
}

// ===== 세션 타입 =====
export interface CustomerSession {
  reservationId: number;
  customerName: string;
  customerPhone: string;
  referralCode?: string;
  exp: number;
}

export interface AdminSession {
  adminId: number;
  username: string;
  role: AdminRole;
  exp: number;
}

// ===== 가격 계산 결과 =====
export interface PriceCalculation {
  basePrice: number;
  optionsTotal: number;
  travelFee: number;
  subtotal: number;
  discounts: {
    event: number;
    couple: number;
    review: number;
    referral: number;
    special: number;
    total: number;
  };
  deposit: number;
  finalBalance: number;
}
