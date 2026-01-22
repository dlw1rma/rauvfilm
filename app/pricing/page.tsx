import type { Metadata } from "next";
import PricingCard from "@/components/pricing/PricingCard";
import EventCard from "@/components/pricing/EventCard";
import DiscountCard from "@/components/pricing/DiscountCard";
import OptionRow from "@/components/pricing/OptionRow";

export const metadata: Metadata = {
  title: "가격 안내 | 라우브필름",
  description:
    "라우브필름 웨딩 영상 촬영 가격 안내입니다. 가성비형, 기본형, 시네마틱형 패키지를 확인하세요.",
  openGraph: {
    title: "가격 안내 | 라우브필름",
    description: "라우브필름 웨딩 영상 촬영 가격 안내입니다.",
  },
};

const pricingPlans = [
  {
    name: "1인 1캠",
    subtitle: "가성비형",
    originalPrice: "340,000",
    price: "310,000",
    description: "신부대기실 + 본식 + 원판촬영",
    videoUrl: "https://www.youtube.com/watch?v=BEEXhZW2GMo",
    features: [
      "카메라가 친터마다 움직임 없이 꼭 촬영",
      "촬영범위: 신부대기실-본식-원판촬영",
      "화질: 4K UHD 초고화질",
      "편집: 기록영상(15-30분), SNS영상(30초~1분)",
      "보정기법: 색감, 피부보정",
      "제공: 클라우드 링크를 메일로 제공",
    ],
    recommendations: [
      "가성비와 시네마틱 영상을 모두 원하는 분",
      "기본적인 웨딩 영상이 필요한 분",
    ],
    popular: false,
  },
  {
    name: "1인 2캠",
    subtitle: "기본형",
    originalPrice: "600,000",
    price: "500,000",
    description: "신부대기실 + 본식 + 원판촬영",
    videoUrl: "https://www.youtube.com/watch?v=BEEXhZW2GMo",
    features: [
      "촬영범위: 신부대기실-본식-원판촬영",
      "화질: 4K UHD 초고화질",
      "편집: 하이라이트(2분) + 기록영상(30분~)",
      "보정기법: 색감, 피부보정",
      "제공: 클라우드 링크를 메일로 제공",
      "요청 시 인터뷰 촬영",
    ],
    recommendations: [
      "색감, 피부보정으로 예쁜 영화의 한 장면을 원하는 분",
      "다양한 구도에서 촬영된 영상을 원하는 신랑신부님",
      '대표작가와 수석실장만 요청시 "짐벌로 촬영됩니다"',
    ],
    gimbalNote: "*짐벌: 카메라의 움직임이 있는 촬영장비",
    popular: true,
  },
  {
    name: "2인 3캠",
    subtitle: "시네마틱형",
    originalPrice: "950,000",
    price: "850,000",
    description: "신부대기실 + 본식 + 원판촬영",
    videoUrl: "https://www.youtube.com/watch?v=BEEXhZW2GMo",
    features: [
      "촬영범위: 신부대기실-본식-원판촬영",
      "화질: 4K UHD 초고화질",
      "편집 (총 5개 영상)",
      "  1. 다큐형 하이라이트(4분)",
      "  2. 다큐형 기록영상(식전/본식/식후 총 30분~)",
      "  3. 인터뷰 영상(4팀~)",
      "보정기법: 색감, 피부보정",
      "제공: 클라우드 링크를 메일로 제공",
    ],
    recommendations: [
      "색감, 피부보정으로 예쁜 영화의 한 장면을 원하는 분",
      "다양한 구도에서 촬영된 영상을 원하는 신랑신부님",
      '대표작가와 수석실장이 동반하며, "짐벌촬영이 포함됩니다"',
    ],
    gimbalNote: "*짐벌: 카메라의 움직임이 있는 촬영장비",
    popular: false,
    isNew: true,
  },
];

const additionalOptions = [
  {
    name: "피로연(2부) / 폐백",
    description: "2부 행사, 폐백, 테이블인사(피로연) 촬영됩니다.",
    price: "50,000",
  },
  {
    name: "메이크업 촬영",
    description: "메이크업 샵부터 촬영됩니다.",
    price: "200,000",
  },
  {
    name: "USB 추가",
    description: "TV에서 재생하기 쉽게 USB에 담아 전달드립니다",
    price: "개당 20,000",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* 히어로 헤더 섹션 */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.08),transparent_50%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-block mb-4 text-xs font-medium tracking-widest text-accent uppercase">
            Wedding Film Package
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            본식 영상 상품
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            소중한 순간을 영화처럼 담아드립니다
          </p>

          {/* 가격 정보 배지 */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-muted border border-border/50 text-sm">
              부가세 포함
            </span>
            <span className="px-4 py-2 rounded-full bg-muted border border-border/50 text-sm">
              최대 할인가 적용
            </span>
          </div>

          <p className="mt-6 text-sm text-muted-foreground/70">
            *서울, 청주 이외 지역은 출장비가 발생합니다
          </p>
        </div>
      </section>

      {/* 상품 카드 그리드 */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* 이벤트 섹션 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block mb-2 text-xs font-medium tracking-widest text-accent uppercase">
              Special Offer
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">진행중인 이벤트</h2>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-accent text-white text-xs font-medium">
                모든 상품 진행 가능
              </span>
              <span className="px-3 py-1 rounded-full bg-muted border border-border text-xs">
                스냅 + 식전영상 모두 선택 가능
              </span>
            </div>
          </div>

          {/* 이벤트 카드 그리드 */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <EventCard
              title="서울 야외촬영"
              description="서울지역 1~2시간 촬영 | 스냅작가가 있을 경우만 프리웨딩 가능"
              items={[
                {
                  label: "스냅촬영",
                  price: "5만원",
                  detail: "원본 전체 + 신부님 셀렉 10장 보정",
                },
                {
                  label: "프리웨딩 식전영상",
                  price: "10만원",
                  detail: "영상촬영 기반 1~2분 하이라이트",
                },
              ]}
            />

            <EventCard
              title="예약후기 작성 이벤트"
              description="예약확정 후 1개월 이내, 카페 또는 자신의 블로그에 후기 작성"
              badge="HOT"
              items={[
                {
                  label: "1건 작성",
                  price: "1만원 할인",
                  detail: "가성비형은 원본전체 전달",
                },
                {
                  label: "2건 작성",
                  price: "2만원 할인",
                  detail: "+ SNS영상",
                },
                {
                  label: "3건 작성",
                  price: "2만원 할인",
                  detail: "+ SNS영상 + 원본영상 전체",
                },
              ]}
            />
          </div>

          {/* 촬영 장소 */}
          <div className="mb-8 p-6 rounded-xl border border-border/50 bg-background">
            <h4 className="text-sm font-medium mb-4">야외촬영 장소</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "노을공원",
                "창경궁",
                "동작대교",
                "잠수교",
                "올림픽공원",
                "서울숲",
              ].map((location) => (
                <span
                  key={location}
                  className="px-3 py-1.5 rounded-full bg-muted border border-border/50 text-sm"
                >
                  {location}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              *위 장소 중 한 곳에서 진행됩니다
            </p>
          </div>

          {/* 할인 정보 카드 */}
          <div className="grid gap-4 md:grid-cols-3">
            <DiscountCard
              title="짝궁할인"
              amount="1만원 할인"
              description="소개하신 분, 소개받으신 분 각 1만원 할인. 소개해 주시는 분은 잔금 0원까지 중복 가능"
            />
            <DiscountCard
              title="블로그/카페 촬영후기"
              amount="총 2만원 페이백"
              description="상품 받으신 날부터 1개월 이내 카페와 자신의 블로그 후기 각각 총 2건 작성"
            />
            <DiscountCard
              title="26년 신년할인"
              amount="5만원 할인"
              description="26년 모든 예약자 대상 (26년 4월까지). *1인 1캠 미적용, 제휴상품 미적용"
            />
          </div>
        </div>
      </section>

      {/* 옵션 섹션 */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <span className="inline-block mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Additional
            </span>
            <h2 className="text-xl font-bold">추가 옵션</h2>
          </div>

          <div className="rounded-xl border border-border/50 bg-background overflow-hidden divide-y divide-border/50">
            {additionalOptions.map((option, index) => (
              <OptionRow key={index} option={option} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-accent/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">상담이 필요하신가요?</h2>
          <p className="text-muted-foreground mb-8">
            카카오톡으로 편하게 문의해주세요
          </p>
          <a
            href="https://pf.kakao.com/_xlXAin/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FEE500] text-[#3C1E1E] font-medium rounded-lg hover:brightness-95 hover:-translate-y-1 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.463 2 10.714c0 2.755 1.87 5.165 4.686 6.527-.192.738-.693 2.67-.793 3.084-.123.505.185.497.39.362.16-.106 2.55-1.73 3.582-2.435.694.097 1.406.148 2.135.148 5.523 0 10-3.463 10-7.714S17.523 3 12 3z" />
            </svg>
            카카오톡 상담하기
          </a>
        </div>
      </section>
    </div>
  );
}
