# 라우브필름(Rauvfilm) 프로젝트 종합 컨텍스트

> Claude Code에게 전달하는 프로젝트 전체 맥락입니다.
> 이 문서를 통해 프로젝트의 방향성, 가치관, 기술적 결정 사항을 이해하고 일관된 개발을 진행해주세요.

---

## 1. 프로젝트 개요

### 1.1 사업 정보
- **회사명**: 라우브필름 (Rauvfilm)
- **업종**: 웨딩 영상 촬영 (본식 DVD, 시네마틱 영상 제작)
- **운영자**: 손세한
- **현재 사이트**: https://www.rauvfilm.co.kr (아임웹 호스팅 중)
- **목표**: 아임웹에서 자체 호스팅으로 완전 전환

### 1.2 전환 배경
- 아임웹의 플랫폼 제한사항 (최적화 어려움, PageSpeed 점수 개선 불가)
- 장기적 확장성 확보 (네이버 예약 연동, 결제 시스템 등)
- 백엔드 개발 자유도 필요
- 월 3만원 이하 예산 내 운영

### 1.3 핵심 가치관
1. **확장성 우선**: 시간이 걸리더라도 장기적으로 확장 가능한 구조
2. **버그 없는 안정성**: 프로덕션 환경에서 안정적인 운영
3. **학습 기반 성장**: 운영자가 직접 유지보수할 수 있도록 학습 가능한 구조
4. **비용 효율성**: 월 3만원 이하 운영비 유지

---

## 2. 기술 스택 (확정)

### 2.1 프론트엔드
```
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui (권장)
```

### 2.2 백엔드
```
API: Next.js API Routes (Route Handlers)
ORM: Prisma
Database: Neon PostgreSQL (무료 티어)
Authentication: Auth.js (NextAuth.js v5) - 네이버/카카오 OAuth
```

### 2.3 인프라
```
Hosting: Cloudtype (Hobby 플랜, 월 ₩5,500)
Repository: GitHub (https://github.com/dlw1rma/rauvfilm)
Video Hosting: YouTube 임베드 (비용 절감)
Image Hosting: Cloudinary (무료 티어 25GB)
```

### 2.4 개발 환경
```
Local Path: C:\Users\tpgks\OneDrive\바탕 화면\rauvfilm\rauvfilm
Node.js: v24.13.0
Package Manager: npm
Editor: VS Code
```

---

## 3. 디자인 시스템

### 3.1 컬러 팔레트
```css
/* 필수 준수 색상 */
--background: #111111;      /* 바탕색 - 검은색 */
--accent: #e50914;          /* 포인트 컬러 - 빨간색 (Netflix 스타일) */
--text-primary: #ffffff;    /* 본문 강조 글씨 - 흰색 */
--text-secondary: #e5e7eb;  /* 본문 기본 글씨 - 회색 */
--card-background: #1a1a1a; /* 카드/박스 배경 */
--border: #2a2a2a;          /* 테두리 */
```

### 3.2 타이포그래피
```css
font-family: 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif;
/* 단 하나의 폰트만 사용 - 일관성 유지 */
```

### 3.3 디자인 원칙
1. **텍스트 박스형 디자인**: 콘텐츠를 박스로 감싸는 카드 스타일
2. **호버 애니메이션**: 버튼/카드에 마우스 올리면 살짝 들어올려지는 효과
   ```css
   transition: transform 0.2s ease, box-shadow 0.2s ease;
   &:hover {
     transform: translateY(-4px);
     box-shadow: 0 10px 30px rgba(229, 9, 20, 0.2);
   }
   ```
3. **미니멀리즘**: 불필요한 장식 배제, 콘텐츠 중심
4. **다크 테마 일관성**: 전체 사이트 다크 모드 고정

### 3.4 Tailwind 설정 (tailwind.config.ts에 적용)
```typescript
const config = {
  theme: {
    extend: {
      colors: {
        background: '#111111',
        foreground: '#ffffff',
        accent: {
          DEFAULT: '#e50914',
          hover: '#ff1a1a',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1a1a1a',
          foreground: '#e5e7eb',
        },
        border: '#2a2a2a',
      },
      fontFamily: {
        sans: ['Apple SD Gothic Neo', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
}
```

---

## 4. 사이트 구조 및 페이지

### 4.1 페이지 맵
```
/ (홈)
├── /portfolio (포트폴리오)
│   └── /portfolio/[id] (개별 영상 상세)
├── /pricing (가격 안내)
├── /reservation (예약 게시판)
│   ├── /reservation/new (글 작성)
│   └── /reservation/[id] (글 상세)
├── /reviews (고객 후기)
└── /contact (문의하기)
```

### 4.2 각 페이지 상세 요구사항

#### 홈페이지 (/)
- 히어로 섹션: 대표 영상 또는 이미지
- 간략한 소개 문구
- 주요 섹션 링크 (포트폴리오, 가격, 예약)
- CTA 버튼 (문의하기)

#### 포트폴리오 (/portfolio)
- YouTube 영상 임베드 갤러리
- 그리드 레이아웃 (반응형)
- 썸네일 클릭 시 영상 재생 (Facade Pattern 적용 - 성능 최적화)
- 카테고리 필터 (선택사항)

#### 가격 안내 (/pricing)
- 3개 티어 서비스 패키지 표시
- 각 패키지별 포함 내용 리스트
- 문의 버튼 연결

#### 예약 게시판 (/reservation)
- 게시글 CRUD (작성, 조회, 수정, 삭제)
- 비밀글 기능 (비밀번호 입력)
- 작성자명, 연락처, 예식일, 장소 필드
- 관리자만 전체 글 열람 가능 (향후)

#### 고객 후기 (/reviews)
- 네이버 블로그/카페 리뷰 수동 큐레이션
- 이미지 + 출처 링크 형태
- 카드 그리드 레이아웃

#### 문의하기 (/contact)
- 문의 폼 (이름, 연락처, 이메일, 예식일, 메시지)
- 폼 제출 시 이메일 알림 또는 DB 저장
- 회사 연락처 정보 표시

### 4.3 공통 컴포넌트
```
components/
├── layout/
│   ├── Header.tsx (네비게이션 포함)
│   ├── Footer.tsx
│   └── Navigation.tsx
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ... (shadcn/ui 컴포넌트들)
├── video/
│   ├── VideoPlayer.tsx (YouTube Facade)
│   └── VideoGrid.tsx
└── forms/
    ├── ContactForm.tsx
    └── ReservationForm.tsx
```

---

## 5. 데이터베이스 스키마 (Prisma)

### 5.1 예약 게시판
```prisma
model Reservation {
  id          Int       @id @default(autoincrement())
  title       String
  content     String    @db.Text
  author      String
  password    String    // bcrypt 해시
  phone       String?
  email       String?
  weddingDate DateTime?
  location    String?
  isPrivate   Boolean   @default(false)
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 5.2 포트폴리오
```prisma
model Portfolio {
  id          Int      @id @default(autoincrement())
  title       String
  description String?  @db.Text
  youtubeUrl  String
  thumbnailUrl String?
  category    String?
  featured    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 5.3 문의
```prisma
model Contact {
  id          Int       @id @default(autoincrement())
  name        String
  phone       String
  email       String?
  weddingDate DateTime?
  message     String    @db.Text
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())
}
```

### 5.4 고객 후기
```prisma
model Review {
  id          Int      @id @default(autoincrement())
  title       String
  imageUrl    String
  sourceUrl   String   // 네이버 블로그/카페 원본 링크
  sourceType  String   // 'naver_blog', 'naver_cafe', 'instagram'
  order       Int      @default(0)
  isVisible   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 6. API 설계

### 6.1 예약 게시판 API
```
GET    /api/reservations          - 목록 조회
POST   /api/reservations          - 글 작성
GET    /api/reservations/[id]     - 상세 조회
PUT    /api/reservations/[id]     - 수정
DELETE /api/reservations/[id]     - 삭제
POST   /api/reservations/[id]/verify - 비밀번호 확인
```

### 6.2 포트폴리오 API
```
GET    /api/portfolio             - 목록 조회
GET    /api/portfolio/[id]        - 상세 조회
```

### 6.3 문의 API
```
POST   /api/contact               - 문의 제출
```

---

## 7. SEO 최적화 (네이버 중점)

### 7.1 필수 적용 사항
- **SSR/SSG 활용**: Next.js App Router의 서버 컴포넌트 기본 사용
- **메타데이터**: 각 페이지별 title, description, og:image
- **시맨틱 HTML**: 적절한 heading 구조 (h1 > h2 > h3)
- **모바일 최적화**: 반응형 필수, 모바일 퍼스트

### 7.2 타겟 키워드
```
웨딩DVD, 본식영상, 결혼식DVD, 웨딩영상, 본식DVD
```

### 7.3 구조화된 데이터 (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "라우브필름",
  "description": "웨딩 영상 촬영 전문 업체",
  "url": "https://rauvfilm.co.kr",
  "priceRange": "₩₩"
}
```

---

## 8. 개발 단계별 로드맵

### Phase 1: 기초 설정 (현재 완료)
- [x] Next.js 프로젝트 생성
- [x] GitHub 연결
- [x] Cloudtype 배포
- [ ] Tailwind 다크 테마 설정
- [ ] 기본 레이아웃 (Header, Footer)

### Phase 2: 정적 페이지
- [ ] 홈페이지 UI
- [ ] 포트폴리오 페이지 (YouTube 임베드)
- [ ] 가격 안내 페이지
- [ ] 문의 페이지 (폼 UI만)

### Phase 3: 데이터베이스 연동
- [ ] Neon PostgreSQL 설정
- [ ] Prisma 스키마 정의
- [ ] 마이그레이션 실행

### Phase 4: 동적 기능
- [ ] 예약 게시판 CRUD
- [ ] 문의 폼 제출 기능
- [ ] 고객 후기 관리

### Phase 5: 인증 및 관리자
- [ ] Auth.js 설정 (네이버/카카오)
- [ ] 관리자 페이지
- [ ] 콘텐츠 관리 기능

### Phase 6: 최적화 및 런칭
- [ ] 성능 최적화 (이미지, 코드 스플리팅)
- [ ] SEO 최종 점검
- [ ] 도메인 연결 (rauvfilm.co.kr)
- [ ] 프로덕션 런칭

---

## 9. 현재 프로젝트 상태

### 9.1 완료된 작업
```
✅ Next.js 14 프로젝트 생성 (TypeScript, Tailwind, App Router)
✅ GitHub 저장소 연결 (https://github.com/dlw1rma/rauvfilm)
✅ Cloudtype 배포 연동 (자동 배포 설정됨)
✅ 기본 개발 환경 세팅
```

### 9.2 다음 즉시 작업
```
1. globals.css 수정 - 다크 테마 색상 적용
2. tailwind.config.ts 수정 - 커스텀 컬러 추가
3. layout.tsx 수정 - 폰트 및 기본 스타일
4. Header, Footer 컴포넌트 생성
5. 홈페이지 기본 UI 구성
```

### 9.3 프로젝트 폴더 구조 (목표)
```
rauvfilm/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── portfolio/
│   │   ├── pricing/
│   │   ├── reservation/
│   │   ├── reviews/
│   │   ├── contact/
│   │   └── api/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── video/
│   │   └── forms/
│   └── lib/
│       ├── prisma.ts
│       └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
├── tailwind.config.ts
└── package.json
```

---

## 10. 참고 사항

### 10.1 현재 아임웹 사이트 특징 (유지할 것)
- 검은 배경 + 빨간 포인트의 시네마틱 느낌
- 미니멀한 레이아웃
- 영상 중심 포트폴리오
- 텍스트 박스형 카드 디자인

### 10.2 개선할 점
- 페이지 로딩 속도 최적화
- 모바일 사용성 개선
- SEO 점수 향상
- 관리자 기능 추가

### 10.3 운영자 특성
- 서버/데이터베이스 경험 없음 (학습 의지 있음)
- HTML/CSS/JavaScript 기초 이해
- 장기적 관점에서 직접 유지보수 희망

### 10.4 예산
- 월 3만원 이하 유지
- 현재 예상: Cloudtype ₩5,500 + 도메인 ₩880/월 ≈ ₩6,380/월

---

## 11. 코드 컨벤션

### 11.1 파일/폴더 네이밍
- 컴포넌트: PascalCase (예: `VideoPlayer.tsx`)
- 페이지: lowercase (Next.js App Router 규칙)
- 유틸리티: camelCase (예: `formatDate.ts`)

### 11.2 컴포넌트 구조
```tsx
// 1. imports
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 2. types
interface Props {
  title: string
  className?: string
}

// 3. component
export function ComponentName({ title, className }: Props) {
  // hooks
  const [state, setState] = useState()
  
  // handlers
  const handleClick = () => {}
  
  // render
  return (
    <div className={cn('base-styles', className)}>
      {title}
    </div>
  )
}
```

### 11.3 스타일링 원칙
- Tailwind CSS 클래스 우선
- 복잡한 스타일은 `cn()` 유틸리티로 조합
- 반복되는 스타일은 컴포넌트화

---

## 12. 명령어 참고

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### Prisma 명령어
```bash
npx prisma generate      # 클라이언트 생성
npx prisma db push       # 스키마 반영
npx prisma studio        # DB GUI 열기
```

### Git 배포
```bash
git add .
git commit -m "커밋 메시지"
git push
# Cloudtype 자동 배포 시작
```

---

## 13. 환경 변수 (나중에 설정)

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="https://rauvfilm.co.kr"

# OAuth (향후)
NAVER_CLIENT_ID=""
NAVER_CLIENT_SECRET=""
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""
```

---

**이 문서를 기반으로 일관된 방향성을 유지하며 개발을 진행해주세요.**
**질문이 있으면 이 컨텍스트를 참고하여 프로젝트 가치관에 맞게 결정해주세요.**
