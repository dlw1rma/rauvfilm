# 라우브필름 디자인 수정 및 기능 연결 프롬프트

> 이 프롬프트를 Claude Code에 전달하세요.

---

## 🎯 목표

현재 만들어진 기본 사이트를 **아임웹 원본 사이트(rauvfilm.co.kr)**와 동일한 디자인과 구조로 수정하고, 필요한 외부 연결을 완료한다.

---

## 📋 1. 카카오톡 채널 연결

### 요구사항
- 화면 우측 하단에 **카카오톡 채널 플로팅 버튼** 추가
- 클릭 시 카카오톡 채널 채팅으로 이동

### 카카오 채널 정보
```
채널 Public ID: _xlXAin
```

### 구현 방법
1. `src/app/layout.tsx`에 카카오 SDK 스크립트 추가:
```html
<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js"></script>
```

2. 플로팅 버튼 컴포넌트 생성 (`src/components/KakaoChannelButton.tsx`):
```tsx
'use client'
import { useEffect } from 'react'
import Image from 'next/image'

export function KakaoChannelButton() {
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('YOUR_JAVASCRIPT_KEY') // 카카오 앱키 필요시
    }
  }, [])

  const handleClick = () => {
    window.open('https://pf.kakao.com/_xlXAin/chat', '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform"
    >
      <img 
        src="https://developers.kakao.com/assets/img/about/logos/channel/consult_small_yellow_pc.png"
        alt="카카오톡 상담"
        className="w-full h-full"
      />
    </button>
  )
}
```

3. layout.tsx에 컴포넌트 추가

---

## 📋 2. 로고 연결

### 로고 이미지 URL (원본 사이트에서 사용 중)
```
메인 로고 (밝은 버전): https://cdn.imweb.me/thumbnail/20250816/e07d5d643aa5d.png
모바일 로고: https://cdn.imweb.me/thumbnail/20250816/1d6d5f22ad202.png
```

### 구현
1. `public/` 폴더에 로고 이미지 다운로드하여 저장
   - `/public/logo.png` (메인)
   - `/public/logo-mobile.png` (모바일)

2. Header 컴포넌트에서 로고 이미지 사용:
```tsx
<Link href="/">
  <Image 
    src="/logo.png" 
    alt="라우브필름" 
    width={150} 
    height={40}
    className="hidden md:block"
  />
  <Image 
    src="/logo-mobile.png" 
    alt="라우브필름" 
    width={120} 
    height={35}
    className="md:hidden"
  />
</Link>
```

---

## 📋 3. 네비게이션 메뉴 구조 (원본과 동일하게)

### 메뉴 구조
```
- ABOUT (/about)
- PRODUCT (/product) → 가격/상품 페이지
- PORTFOLIO (/portfolio)
- EVENT SNAP (/event-snap)
  └ 동작대교 (/event-snap/djbg)
  └ 창경궁 (/event-snap/chg)
  └ 노을공원 (/event-snap/nepark)
  └ 올림픽공원 (/event-snap/olpark)
- RESERVATION (/reservation)
  └ FAQ (/faq)
  └ 제휴 (/coalition)
```

### Header 컴포넌트 수정
- 드롭다운 메뉴 기능 추가 (EVENT SNAP, RESERVATION)
- 호버 시 서브메뉴 표시
- 모바일: 햄버거 메뉴 → 슬라이드 메뉴

---

## 📋 4. 홈페이지 섹션 구조 (원본과 동일하게)

### 섹션 순서
1. **Hero 섹션**
   - 슬로건: "소중한 날의 기억들을 영원히 간직하세요"
   - 서브: "'기록'이 아닌 '기억'을 남기는 영상을 선사합니다."

2. **포트폴리오 슬라이더**
   - 무한 자동 스크롤 (좌→우)
   - 썸네일 + 웨딩홀 이름 + 영문 이름
   - 호버 시 확대 효과

3. **SERVICE 섹션** (2x3 그리드)
   - 상품 구성 (Product)
   - 예약 절차 (Reservation process)
   - 계약 약관 (Contract terms)
   - FAQ
   - 라우브필름에 대해서 (About)
   - TIP (활용법)

4. **COLOR 섹션**
   - Before/After 비교 슬라이더
   - 텍스트: "특수한 촬영 방식과 자연스러운 색감..."

5. **CAMERA 섹션**
   - 사용 장비 소개: FX3, A7S3, A7M4
   - 소니 브랜드 강조

6. **DIRECTOR 섹션**
   - 대표 감독 소개
   - VFX, 유튜브 프로덕션 출신 강조

7. **CUSTOM 섹션**
   - 커스텀 영상 안내
   - 카카오톡 채널 상담 유도

8. **REVIEW 섹션**
   - 후기 이미지 그리드
   - "+REVIEW" 버튼 → 네이버 검색 결과로 링크
   ```
   https://search.naver.com/search.naver?query=라우브필름+후기
   ```

9. **NOTICE 섹션**
   - 공지사항 (카카오톡 상담채널 변경 안내 등)

10. **Footer**
    - SNS 링크: 인스타그램, 유튜브, 네이버 블로그
    - 사업자 정보
    - 이용약관, 개인정보처리방침

---

## 📋 5. 포트폴리오 페이지

### 데이터 구조 (예시)
```typescript
const portfolioItems = [
  {
    id: 1,
    title: "더링크 호텔 (링크홀)",
    subtitle: "The Link (LINK HOLL)",
    camera: "2인3캠",
    youtubeUrl: "https://www.youtube.com/watch?v=VIDEO_ID",
    thumbnailUrl: "/portfolio/thelink.jpg"
  },
  // ... 더 추가
]
```

### 레이아웃
- 그리드: 4열 (데스크톱) / 2열 (태블릿) / 1열 (모바일)
- 카드 디자인:
  - 썸네일 이미지
  - 호버 시 살짝 위로 올라오는 애니메이션
  - 웨딩홀 이름 (한글)
  - 영문 이름
  - 촬영 구성 (1인2캠 등)

---

## 📋 6. EVENT SNAP (야외스냅) 페이지

### 구조
- 메인 페이지: 촬영 장소 목록 (카드 그리드)
- 상세 페이지: 각 장소별 갤러리

### 장소 목록
```typescript
const eventSnapLocations = [
  { id: 'djbg', name: '동작대교', nameEn: 'Dongjak Bridge' },
  { id: 'chg', name: '창경궁', nameEn: 'Changgyeonggung' },
  { id: 'nepark', name: '노을공원', nameEn: 'Noeul Park' },
  { id: 'olpark', name: '올림픽공원', nameEn: 'Olympic Park' },
]
```

---

## 📋 7. 디자인 상세 스펙

### 색상 (절대 변경 금지)
```css
--background: #111111;      /* 메인 배경 */
--accent: #e50914;          /* 포인트 빨간색 */
--text-primary: #ffffff;    /* 흰색 텍스트 */
--text-secondary: #e5e7eb;  /* 회색 텍스트 */
--card-bg: #1a1a1a;         /* 카드 배경 */
--border: #2a2a2a;          /* 테두리 */
```

### 폰트
```css
font-family: 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, 'Malgun Gothic', sans-serif;
```

### 카드 호버 효과
```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(229, 9, 20, 0.15);
}
```

### 버튼 스타일
```css
.btn-primary {
  background: #e50914;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: #ff1a1a;
  transform: translateY(-2px);
}
```

### 섹션 타이틀 스타일
```css
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.1em;
}
```

---

## 📋 8. SNS 링크

```typescript
const socialLinks = {
  instagram: 'https://www.instagram.com/rauvfilm/',
  youtube: 'https://www.youtube.com/@rauvfilm_Cine',
  naverBlog: 'https://blog.naver.com/rauvfilm',
  kakaoChannel: 'https://pf.kakao.com/_xlXAin/chat'
}
```

---

## 📋 9. Footer 정보

```typescript
const footerInfo = {
  ceo: 'Sehan Son',
  tel: '010-4512-3587',
  email: 'rauvfilm@naver.com',
  businessNo: '728-10-02901',
  copyright: '© 2026 라우브필름 All rights reserved.'
}
```

---

## 📋 10. 작업 우선순위

1. **[긴급]** 카카오톡 채널 플로팅 버튼 추가
2. **[긴급]** 로고 이미지 적용
3. **[높음]** Header 네비게이션 메뉴 구조 수정 (드롭다운 포함)
4. **[높음]** 홈페이지 섹션 구조 원본과 일치시키기
5. **[높음]** 포트폴리오 슬라이더 (무한 자동 스크롤)
6. **[중간]** Footer SNS 링크 및 사업자 정보
7. **[중간]** EVENT SNAP 페이지 구조
8. **[낮음]** Before/After 비교 슬라이더
9. **[낮음]** 세부 애니메이션 조정

---

## 📋 11. 참고 URL

- 원본 사이트: https://www.rauvfilm.co.kr
- ABOUT 페이지: https://www.rauvfilm.co.kr/ABOUT
- PRODUCT 페이지: https://www.rauvfilm.co.kr/PRODUCT
- PORTFOLIO 페이지: https://www.rauvfilm.co.kr/portfolio
- EVENT SNAP: https://www.rauvfilm.co.kr/EVENTSNAP

---

## ⚠️ 주의사항

1. **색상 절대 변경 금지** - 검은 배경 #111111, 빨간 포인트 #e50914 유지
2. **폰트 통일** - Apple SD Gothic Neo만 사용
3. **반응형 필수** - 모바일 우선 설계
4. **호버 애니메이션** - 모든 인터랙티브 요소에 부드러운 트랜지션
5. **이미지 최적화** - Next.js Image 컴포넌트 사용

---

이 프롬프트를 기반으로 작업을 진행해줘. 우선순위가 [긴급]인 것부터 시작하고, 완료될 때마다 git push 해줘.
