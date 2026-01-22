# 라우브필름 예약/정산 시스템 구현 프롬프트

> Claude Code에게 전달하세요. 단계별로 진행합니다.

---

## 🎯 시스템 개요

라우브필름의 예약-정산-고객관리 통합 시스템을 구축합니다.

### 핵심 기능
1. **잔금 자동 계산 시스템** - 실시간 할인 적용
2. **짝꿍 코드(추천인) 시스템** - 양방향 할인
3. **후기 자동 검증 시스템** - 키워드/글자수 체크
4. **고객 마이페이지** - 성함+전화번호 로그인
5. **관리자 대시보드** - 예약 관리, 승인, 업로드
6. **개인정보 5년 자동 파기**

---

## 📋 Phase 1: 데이터베이스 스키마 확장

### prisma/schema.prisma에 추가할 모델들

```prisma
// ============================================
// 라우브필름 예약/정산 시스템 스키마
// ============================================

// 상품 (촬영 패키지)
model Product {
  id          Int      @id @default(autoincrement())
  name        String   // "1인 2캠", "2인 3캠" 등
  price       Int      // 정가 (원)
  description String?  @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  bookings    Booking[]
}

// 할인 이벤트 (신년 할인 등)
model DiscountEvent {
  id          Int       @id @default(autoincrement())
  name        String    // "2025 신년 할인"
  amount      Int       // 할인 금액 (원)
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  
  bookings    Booking[]
}

// 예약 (핵심 테이블)
model Booking {
  id              Int           @id @default(autoincrement())
  
  // 고객 정보
  customerName    String        // 계약자 성함
  customerPhone   String        // 전화번호 (로그인용)
  customerEmail   String?
  
  // 예식 정보
  weddingDate     DateTime
  weddingVenue    String        // 예식장
  weddingTime     String?       // 예식 시간
  
  // 상품 및 가격
  product         Product       @relation(fields: [productId], references: [id])
  productId       Int
  listPrice       Int           // 정가 (예약 시점 기록)
  
  // 예약금
  depositAmount   Int           @default(100000)  // 10만원
  depositPaidAt   DateTime?     // 예약금 입금일
  
  // 할인 적용
  discountEvent   DiscountEvent? @relation(fields: [discountEventId], references: [id])
  discountEventId Int?
  eventDiscount   Int           @default(0)       // 이벤트 할인 금액
  
  // 짝꿍 할인
  referralDiscount Int          @default(0)       // 추천 할인 (1만원)
  referredBy       String?      // 추천인 짝꿍코드
  
  // 후기 할인
  reviewDiscount   Int          @default(0)       // 후기 할인 (1만원)
  
  // 최종 잔금 (자동 계산됨)
  finalBalance     Int          @default(0)
  balancePaidAt    DateTime?    // 잔금 입금일
  
  // 짝꿍 코드 (이 고객의 코드)
  partnerCode      String?      @unique  // "250122홍길동"
  
  // 예약 상태
  status           BookingStatus @default(PENDING)
  
  // 관리자 업로드
  videoUrl         String?      // 영상 링크
  contractUrl      String?      // 계약서 파일
  videoUploadedAt  DateTime?    // 영상 업로드일 (5년 파기 기준)
  
  // 메모
  adminNote        String?      @db.Text
  
  // 타임스탬프
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  
  // 개인정보 파기 여부
  isAnonymized     Boolean      @default(false)
  anonymizedAt     DateTime?
  
  // 관계
  reviews          ReviewSubmission[]
  referrals        Booking[]    @relation("ReferralRelation")
  referrer         Booking?     @relation("ReferralRelation", fields: [referredByBookingId], references: [id])
  referredByBookingId Int?
}

// 예약 상태
enum BookingStatus {
  PENDING      // 예약 대기
  CONFIRMED    // 확정 (짝꿍코드 생성)
  DEPOSIT_PAID // 예약금 입금 완료
  COMPLETED    // 촬영 완료
  DELIVERED    // 영상 전달 완료
  CANCELLED    // 취소
}

// 후기 제출
model ReviewSubmission {
  id              Int            @id @default(autoincrement())
  booking         Booking        @relation(fields: [bookingId], references: [id])
  bookingId       Int
  
  reviewUrl       String         // 후기 링크
  platform        ReviewPlatform // 플랫폼
  
  // 자동 검증 결과
  autoVerified    Boolean        @default(false)
  titleValid      Boolean?       // 제목 키워드 포함 여부
  contentValid    Boolean?       // 본문 가이드 준수 여부
  characterCount  Int?           // 글자 수
  
  // 승인 상태
  status          ReviewStatus   @default(PENDING)
  verifiedAt      DateTime?
  verifiedBy      String?        // 관리자 ID (수동 승인 시)
  
  // 거절 사유
  rejectReason    String?
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

// 후기 플랫폼
enum ReviewPlatform {
  NAVER_BLOG
  NAVER_CAFE
  INSTAGRAM
  OTHER
}

// 후기 상태
enum ReviewStatus {
  PENDING     // 검토 대기
  AUTO_APPROVED   // 자동 승인
  MANUAL_REVIEW   // 수동 검토 필요
  APPROVED    // 승인 (할인 적용)
  REJECTED    // 거절
}

// 관리자
model Admin {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  password    String   // bcrypt 해시
  name        String
  role        AdminRole @default(STAFF)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum AdminRole {
  SUPER_ADMIN
  STAFF
}

// 시스템 설정
model SystemSetting {
  id          Int      @id @default(autoincrement())
  key         String   @unique
  value       String
  updatedAt   DateTime @updatedAt
}
```

---

## 📋 Phase 2: 잔금 자동 계산 로직

### src/lib/pricing.ts

```typescript
/**
 * 잔금 계산 공식:
 * Final Balance = 정가 - 예약금(10만원) - 이벤트할인 - 짝꿍할인 - 후기할인
 */

interface BalanceCalculation {
  listPrice: number;          // 정가
  depositAmount: number;      // 예약금 (10만원)
  eventDiscount: number;      // 이벤트 할인
  referralDiscount: number;   // 짝꿍 할인 (1만원)
  reviewDiscount: number;     // 후기 할인 (1만원)
  finalBalance: number;       // 최종 잔금
}

export function calculateBalance(
  listPrice: number,
  options: {
    depositAmount?: number;
    eventDiscount?: number;
    hasReferral?: boolean;
    reviewCount?: number;
  }
): BalanceCalculation {
  const depositAmount = options.depositAmount ?? 100000;
  const eventDiscount = options.eventDiscount ?? 0;
  const referralDiscount = options.hasReferral ? 10000 : 0;
  const reviewDiscount = (options.reviewCount ?? 0) * 10000;
  
  const finalBalance = Math.max(
    0,
    listPrice - depositAmount - eventDiscount - referralDiscount - reviewDiscount
  );
  
  return {
    listPrice,
    depositAmount,
    eventDiscount,
    referralDiscount,
    reviewDiscount,
    finalBalance,
  };
}
```

---

## 📋 Phase 3: 짝꿍 코드 시스템

### 코드 생성 규칙
- 형식: `YYMMDD` + `계약자 성함`
- 예시: `250122홍길동`
- 생성 시점: 관리자가 예약을 "확정(CONFIRMED)" 상태로 변경할 때

### src/lib/partnerCode.ts

```typescript
/**
 * 짝꿍 코드 생성
 */
export function generatePartnerCode(weddingDate: Date, customerName: string): string {
  const yy = weddingDate.getFullYear().toString().slice(-2);
  const mm = (weddingDate.getMonth() + 1).toString().padStart(2, '0');
  const dd = weddingDate.getDate().toString().padStart(2, '0');
  
  return `${yy}${mm}${dd}${customerName}`;
}

/**
 * 짝꿍 코드 검증 및 조회
 */
export async function validatePartnerCode(code: string): Promise<{
  valid: boolean;
  booking?: Booking;
  error?: string;
}> {
  // DB에서 코드 조회
  const booking = await prisma.booking.findUnique({
    where: { partnerCode: code },
  });
  
  if (!booking) {
    return { valid: false, error: '존재하지 않는 코드입니다.' };
  }
  
  if (booking.status === 'CANCELLED') {
    return { valid: false, error: '취소된 예약의 코드입니다.' };
  }
  
  return { valid: true, booking };
}
```

### 짝꿍 할인 적용 로직
- 신규 고객이 예약 시 기존 고객의 코드 입력
- 관리자가 예약 확정 시:
  1. 신규 고객 잔금에서 1만원 차감
  2. 추천인(기존 고객) 잔금에서도 1만원 차감

---

## 📋 Phase 4: 후기 자동 검증 시스템

### 검증 항목
1. **제목 검사**: '라우브필름' 또는 '본식DVD' 포함
2. **본문 검사**: 최소 글자 수 (예: 500자 이상)
3. **플랫폼 분류**: 네이버 블로그(자동), 네이버 카페(수동)

### src/lib/reviewVerification.ts

```typescript
import * as cheerio from 'cheerio';

interface VerificationResult {
  platform: ReviewPlatform;
  canAutoVerify: boolean;
  titleValid: boolean;
  contentValid: boolean;
  characterCount: number;
  status: ReviewStatus;
}

const REQUIRED_KEYWORDS = ['라우브필름', '본식DVD', '본식dvd', 'rauvfilm'];
const MIN_CHARACTER_COUNT = 500;

/**
 * 후기 URL 분석 및 검증
 */
export async function verifyReview(url: string): Promise<VerificationResult> {
  // 플랫폼 판별
  const platform = detectPlatform(url);
  
  // 네이버 카페는 비공개라 자동 검증 불가
  if (platform === 'NAVER_CAFE') {
    return {
      platform,
      canAutoVerify: false,
      titleValid: false,
      contentValid: false,
      characterCount: 0,
      status: 'MANUAL_REVIEW',
    };
  }
  
  // 네이버 블로그 등 공개 글 크롤링
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 제목 추출 및 검사
    const title = $('title').text() || $('h1').first().text();
    const titleValid = REQUIRED_KEYWORDS.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // 본문 추출 및 검사
    const content = $('.se-main-container').text() || $('article').text() || $('body').text();
    const characterCount = content.replace(/\s/g, '').length;
    const contentValid = characterCount >= MIN_CHARACTER_COUNT;
    
    // 자동 승인 여부
    const canAutoVerify = titleValid && contentValid;
    
    return {
      platform,
      canAutoVerify,
      titleValid,
      contentValid,
      characterCount,
      status: canAutoVerify ? 'AUTO_APPROVED' : 'MANUAL_REVIEW',
    };
  } catch (error) {
    return {
      platform,
      canAutoVerify: false,
      titleValid: false,
      contentValid: false,
      characterCount: 0,
      status: 'MANUAL_REVIEW',
    };
  }
}

function detectPlatform(url: string): ReviewPlatform {
  if (url.includes('blog.naver.com')) return 'NAVER_BLOG';
  if (url.includes('cafe.naver.com')) return 'NAVER_CAFE';
  if (url.includes('instagram.com')) return 'INSTAGRAM';
  return 'OTHER';
}
```

---

## 📋 Phase 5: 고객 마이페이지

### 로그인 방식
- 성함 + 전화번호로 로그인 (별도 비밀번호 없음)
- 전화번호는 마지막 4자리로 간편 인증 옵션

### 마이페이지 기능
1. **실시간 잔금 확인** - 할인 내역 상세 표시
2. **내 짝꿍 코드** - 복사 버튼
3. **후기 링크 제출** - 검증 결과 실시간 표시
4. **영상 다운로드** - 관리자 업로드 후 표시
5. **계약서 다운로드**

### 페이지 구조
```
/mypage
├── /mypage/login          - 로그인 (성함 + 전화번호)
├── /mypage                - 대시보드 (잔금, 예약 정보)
├── /mypage/partner-code   - 짝꿍 코드 확인/공유
├── /mypage/review         - 후기 제출
└── /mypage/downloads      - 영상/계약서 다운로드
```

---

## 📋 Phase 6: 관리자 대시보드

### 관리자 기능
1. **예약 목록** - 상태별 필터링
2. **예약 확정** - 상태 변경 시 짝꿍코드 자동 생성
3. **짝꿍 코드 수정** - 닉네임 요청 시 수동 변경
4. **후기 승인** - 수동 검토 필요한 후기 승인/거절
5. **영상/계약서 업로드** - 파일 링크 등록
6. **할인 이벤트 관리** - 이벤트 생성/수정/종료

### 페이지 구조
```
/admin
├── /admin/login           - 관리자 로그인
├── /admin                  - 대시보드 (통계)
├── /admin/bookings        - 예약 관리
├── /admin/bookings/[id]   - 예약 상세/수정
├── /admin/reviews         - 후기 승인 관리
├── /admin/events          - 할인 이벤트 관리
└── /admin/settings        - 시스템 설정
```

---

## 📋 Phase 7: 개인정보 5년 자동 파기

### 파기 규칙
- 기준일: `videoUploadedAt` (영상 업로드일)
- 5년 경과 시 자동 마스킹 처리

### 마스킹 대상
- customerName → "***"
- customerPhone → "***-****-****"
- customerEmail → "***@***.***"

### 자동 실행 (Cron Job)
```typescript
// src/lib/cron/anonymize.ts

export async function anonymizeOldBookings() {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  
  const bookingsToAnonymize = await prisma.booking.findMany({
    where: {
      videoUploadedAt: { lte: fiveYearsAgo },
      isAnonymized: false,
    },
  });
  
  for (const booking of bookingsToAnonymize) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        customerName: '***',
        customerPhone: '***-****-****',
        customerEmail: '***@***.***',
        isAnonymized: true,
        anonymizedAt: new Date(),
      },
    });
  }
  
  console.log(`Anonymized ${bookingsToAnonymize.length} bookings`);
}
```

---

## 📋 API 엔드포인트 목록

### 고객용
```
POST   /api/auth/customer-login     - 고객 로그인 (성함+전화번호)
GET    /api/mypage/booking          - 내 예약 정보
GET    /api/mypage/balance          - 잔금 상세
POST   /api/mypage/review           - 후기 제출
GET    /api/mypage/partner-code     - 내 짝꿍 코드
GET    /api/partner-code/validate   - 짝꿍 코드 유효성 검사
```

### 관리자용
```
POST   /api/admin/login             - 관리자 로그인
GET    /api/admin/bookings          - 예약 목록
PUT    /api/admin/bookings/[id]     - 예약 수정
PUT    /api/admin/bookings/[id]/confirm  - 예약 확정
PUT    /api/admin/bookings/[id]/partner-code  - 짝꿍코드 수정
POST   /api/admin/bookings/[id]/upload  - 영상/계약서 업로드
GET    /api/admin/reviews           - 후기 목록
PUT    /api/admin/reviews/[id]      - 후기 승인/거절
GET    /api/admin/events            - 이벤트 목록
POST   /api/admin/events            - 이벤트 생성
```

---

## 🚀 구현 순서

### 1단계: 데이터베이스 (먼저)
1. prisma/schema.prisma 업데이트
2. npx prisma db push
3. npx prisma generate

### 2단계: 핵심 로직
1. src/lib/pricing.ts - 잔금 계산
2. src/lib/partnerCode.ts - 짝꿍 코드
3. src/lib/reviewVerification.ts - 후기 검증

### 3단계: API 라우트
1. 고객 인증 API
2. 마이페이지 API
3. 관리자 API

### 4단계: 프론트엔드
1. 고객 마이페이지 UI
2. 관리자 대시보드 UI

### 5단계: 자동화
1. 개인정보 파기 Cron
2. 후기 자동 검증

---

## ⚠️ 주의사항

1. **보안**: 관리자 페이지는 반드시 인증 필요
2. **검증**: 전화번호 형식 검증 필수
3. **동시성**: 짝꿍 할인 적용 시 트랜잭션 사용
4. **백업**: 개인정보 파기 전 백업 고려
5. **로깅**: 모든 할인/수정 내역 로깅

---

이 프롬프트를 기반으로 1단계부터 순서대로 구현해줘.
각 단계 완료 후 git commit & push 해줘.
질문이 있으면 물어봐.
