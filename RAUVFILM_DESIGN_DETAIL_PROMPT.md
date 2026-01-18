# 라우브필름 디자인 상세 수정 프롬프트

> 이 프롬프트를 Claude Code에 전달하세요.

---

## 🎯 목표

첨부된 이미지를 참고하여 라우브필름 웹사이트를 원본과 **완벽히 동일하게** 수정한다.
모든 작업은 **반응형(모바일/태블릿/데스크톱)**으로 제작한다.

---

## 📋 1. 히어로 섹션 (최상단) - 이미지 1 참고

### 요구사항
- **배경**: 정적 이미지가 아닌 **YouTube 영상**을 배경으로 사용 (음소거, 자동재생, 반복)
- **영상 위에 어두운 오버레이** 적용 (영상 위 텍스트 가독성 확보)
- **텍스트 위치**: 화면 **좌측 중앙**에 배치
- **전체 높이**: 화면 전체 높이 (100vh) 또는 최소 600px

### 텍스트 내용 (정확히 이대로)
```
소중한 날의 기억들을
영원히 간직하세요

'기록'이 아닌 '기억'을 남기는 영상을 선사합니다.
```

### 텍스트 스타일
```css
/* 메인 타이틀 */
.hero-title {
  font-size: 2.5rem;        /* 모바일: 1.75rem */
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* 서브 타이틀 */
.hero-subtitle {
  font-size: 1rem;          /* 모바일: 0.875rem */
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 1.5rem;
}
```

### 구현 코드 예시
```tsx
// components/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* YouTube 배경 영상 */}
      <div className="absolute inset-0">
        <iframe
          src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
          className="absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
      
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* 텍스트 콘텐츠 - 좌측 중앙 */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              소중한 날의 기억들을<br />
              영원히 간직하세요
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/80">
              '기록'이 아닌 '기억'을 남기는 영상을 선사합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### 히어로 배경 영상
- 라우브필름 유튜브 채널에서 적절한 웨딩 영상 선택
- 또는 Vimeo 사용 가능 (더 깔끔한 임베드)
- **임시로 정적 이미지 사용 가능** (나중에 영상으로 교체)

---

## 📋 2. 포트폴리오 슬라이더 (히어로 바로 아래) - 이미지 1, 3 참고

### 요구사항
- 히어로 섹션 **바로 아래**에 위치
- **무한 자동 스크롤** (좌→우, 끊김 없이)
- 각 카드에 **재생 아이콘** 표시
- 호버 시 카드 확대 효과

### 카드 디자인
```
┌─────────────────────────────┐
│  ▶ (재생 아이콘, 우측 상단)   │
│                             │
│    [썸네일 이미지/영상]       │
│                             │
│    Sindorim Wedding City    │  ← 영문 제목 (굵게, 흰색)
│    Cinematic Wedding Film   │  ← 서브텍스트 (작게, 회색)
│                             │
├─────────────────────────────┤
│  신도림웨딩시티(1인2캠)        │  ← 한글 제목
│  SINDORIM WEDDINGCITY       │  ← 영문 대문자
└─────────────────────────────┘
```

### 슬라이더 구현
```tsx
// 무한 스크롤을 위해 Swiper.js 또는 CSS 애니메이션 사용
// 추천: embla-carousel 또는 swiper

// 설치
// npm install swiper

// 또는 순수 CSS 무한 스크롤
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.slider-track {
  display: flex;
  animation: scroll 30s linear infinite;
}
```

### 포트폴리오 데이터 구조
```typescript
// src/data/portfolio.ts
export const portfolioItems = [
  {
    id: 1,
    titleKo: "신도림웨딩시티",
    titleEn: "Sindorim Wedding City",
    subtitle: "Cinematic Wedding Film",
    camera: "1인2캠",
    youtubeId: "VIDEO_ID_HERE",
    thumbnail: "/portfolio/sindorim.jpg" // 또는 유튜브 썸네일 자동
  },
  {
    id: 2,
    titleKo: "세인트메리엘",
    titleEn: "Saint Meriel",
    subtitle: "Cinematic Wedding Film",
    camera: "1인2캠",
    youtubeId: "VIDEO_ID_HERE",
    thumbnail: "/portfolio/stmeriel.jpg"
  },
  {
    id: 3,
    titleKo: "강동루벨",
    titleEn: "Gangdong Lovell",
    subtitle: "Cinematic Wedding Film",
    camera: "1인2캠",
    youtubeId: "VIDEO_ID_HERE",
    thumbnail: "/portfolio/gangdong.jpg"
  },
  {
    id: 4,
    titleKo: "아펠가모 잠실",
    titleEn: "Apelgamo Jamsil",
    subtitle: "Cinematic Wedding Film",
    camera: "1인2캠",
    youtubeId: "VIDEO_ID_HERE",
    thumbnail: "/portfolio/apelgamo.jpg"
  },
  // 더 추가...
]
```

### 유튜브 썸네일 자동 가져오기
```typescript
// 유튜브 ID로 썸네일 URL 생성
const getYoutubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  // 또는 hqdefault.jpg (더 작은 사이즈)
}
```

---

## 📋 3. SERVICE 섹션 - 이미지 3 참고

### 레이아웃
- 섹션 타이틀: "SERVICE" (좌측 상단, 빨간색 #e50914)
- **4열 그리드** (데스크톱) → **2열** (태블릿) → **2열** (모바일)

### 카드 목록 (상단 4개)
```
1. 상품 구성 (Product) - 아이콘: 달러 동그라미
2. 예약 절차 (Reservation process) - 아이콘: 캘린더
3. 계약 약관 (Contract terms) - 아이콘: 문서
4. FAQ - 아이콘: 물음표
```

### 카드 목록 (하단 2개, 넓은 카드)
```
5. 라우브필름에 대해서 알아보세요.
   - 서브: 결혼식 영상에 대한 라우브필름의 철학.
   - 아이콘: 차트/그래프

6. [TIP] 라우브필름 최대로 활용하기.
   - 서브: 영상 시청 방법, 커스텀 요청 방법 등등.
   - 아이콘: 전구
```

### 카드 스타일
```css
.service-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: #e50914;
  box-shadow: 0 10px 30px rgba(229, 9, 20, 0.1);
}
```

---

## 📋 4. COLOR 섹션 (Before/After) - 이미지 3 참고

### 요구사항
- 섹션 타이틀: "COLOR"
- 설명 텍스트: "특수한 촬영 방식과 자연스러운 색감과 피부보정, 드레스 디테일 보정으로 가장 예쁜 모습만을 남겨드리고 있습니다."
- **Before/After 비교 슬라이더** 구현
- 가운데 드래그 막대로 비교

### 구현 방법
```bash
# 라이브러리 설치
npm install react-compare-slider
```

```tsx
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'

<ReactCompareSlider
  itemOne={<ReactCompareSliderImage src="/color/after.jpg" alt="After" />}
  itemTwo={<ReactCompareSliderImage src="/color/before.jpg" alt="Before" />}
/>
```

---

## 📋 5. Footer (최하단) - 이미지 2 참고

### 구조
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  본식스냅 제휴업체              [ 르메그라피 버튼 ]            │
│                                                             │
│                    ⓘ  ▶  💬                                │
│                 (인스타) (유튜브) (네이버블로그)                │
│                                                             │
│        CEO : Sehan Son | TEL : 010-4512-3587               │
│   E-mail : rauvfilm@naver.com | Business No : 728-10-02901 │
│                                                             │
│              이용약관    개인정보처리방침                      │
│                                                             │
│         Copyright © 2026 라우브필름 All rights reserved.     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SNS 아이콘 (정확히 3개)
```typescript
const socialLinks = [
  { 
    name: 'Instagram', 
    url: 'https://www.instagram.com/rauvfilm/',
    icon: 'instagram' // Lucide 아이콘 또는 커스텀 SVG
  },
  { 
    name: 'YouTube', 
    url: 'https://www.youtube.com/@rauvfilm_Cine',
    icon: 'youtube'
  },
  { 
    name: 'Naver Blog', 
    url: 'https://blog.naver.com/rauvfilm',
    icon: 'naver' // 커스텀 네이버 아이콘 필요
  },
]
```

### 네이버 블로그 아이콘 SVG
```tsx
// 네이버 블로그 아이콘 (커스텀)
const NaverBlogIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
  </svg>
)
```

### 제휴업체 버튼
```tsx
<a 
  href="https://르메그라피링크" 
  target="_blank"
  className="px-8 py-3 border border-gray-600 rounded text-gray-400 hover:border-white hover:text-white transition-all"
>
  르메그라피
</a>
```

---

## 📋 6. 반응형 브레이크포인트

### Tailwind 기본 브레이크포인트 사용
```
sm: 640px   (모바일 가로)
md: 768px   (태블릿)
lg: 1024px  (작은 데스크톱)
xl: 1280px  (데스크톱)
2xl: 1536px (큰 데스크톱)
```

### 각 섹션별 반응형

#### 히어로 섹션
```css
/* 모바일 */
.hero-title { font-size: 1.75rem; }
.hero-subtitle { font-size: 0.875rem; }

/* 태블릿 이상 */
@media (min-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1rem; }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .hero-title { font-size: 3rem; }
  .hero-subtitle { font-size: 1.125rem; }
}
```

#### 포트폴리오 슬라이더
```css
/* 모바일: 1.5개 보이기 */
/* 태블릿: 2.5개 보이기 */
/* 데스크톱: 4.5개 보이기 */
```

#### SERVICE 그리드
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* 상단 4개 카드 */}
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  {/* 하단 2개 넓은 카드 */}
</div>
```

#### Footer
```css
/* 모바일: 세로 스택 */
/* 태블릿 이상: 가로 배치 */
```

---

## 📋 7. 네비게이션 헤더

### 데스크톱
- 로고 좌측, 메뉴 우측
- 메뉴: ABOUT | PRODUCT | PORTFOLIO | EVENT SNAP | RESERVATION

### 모바일
- 로고 좌측, 햄버거 메뉴 우측
- 햄버거 클릭 시 전체화면 메뉴 오버레이

### 스크롤 시 헤더 변화
```tsx
// 스크롤 시 배경색 추가
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50)
  }
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

<header className={`fixed top-0 w-full z-50 transition-all ${
  scrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-transparent'
}`}>
```

---

## 📋 8. 카카오톡 문의 버튼

### 위치
- 화면 우측 하단 고정
- 이미지 1 참고: "문의" 버튼 (노란색 배경)

### 구현
```tsx
<a
  href="https://pf.kakao.com/_xlXAin/chat"
  target="_blank"
  className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-yellow-400 text-black px-4 py-3 rounded-full shadow-lg hover:bg-yellow-300 transition-all"
>
  <MessageCircle className="w-5 h-5" />
  <span className="font-medium">문의</span>
</a>
```

---

## 📋 9. 작업 순서 (우선순위)

1. **[1단계]** 히어로 섹션 - 영상 배경 + 텍스트 좌측 배치
2. **[2단계]** 포트폴리오 슬라이더 - 무한 자동 스크롤
3. **[3단계]** SERVICE 섹션 - 그리드 레이아웃
4. **[4단계]** Footer - SNS 아이콘 (네이버 블로그 포함)
5. **[5단계]** 카카오톡 문의 버튼
6. **[6단계]** 전체 반응형 테스트 및 수정
7. **[7단계]** COLOR 섹션 Before/After 슬라이더

---

## 📋 10. 필요한 패키지 설치

```bash
# 슬라이더
npm install swiper

# Before/After 비교
npm install react-compare-slider

# 아이콘 (이미 있으면 스킵)
npm install lucide-react
```

---

## ⚠️ 중요 체크리스트

- [ ] 모든 섹션 모바일에서 테스트
- [ ] 히어로 영상 모바일에서 재생 확인
- [ ] 포트폴리오 슬라이더 터치 스와이프 동작
- [ ] 카카오톡 버튼 모바일에서 위치 확인
- [ ] Footer SNS 링크 모두 동작 확인
- [ ] 스크롤 시 헤더 배경 변화 확인

---

## 🎬 히어로 배경 영상 (임시)

유튜브 채널에서 적절한 영상 ID를 선택하거나, 일단 정적 이미지로 작업 후 나중에 교체:

```typescript
// 임시 배경 이미지 (꽃 이미지)
const heroBackground = "https://cdn.imweb.me/thumbnail/20250716/a72da7c99c85f.jpg"

// 또는 유튜브 영상 ID (나중에 교체)
const heroVideoId = "YOUR_VIDEO_ID"
```

---

이 프롬프트를 기반으로 작업을 진행해줘.
각 단계 완료할 때마다 git push 해주고, 완료 후 다음 단계 진행해줘.
모바일 반응형은 각 단계마다 같이 작업해줘.
