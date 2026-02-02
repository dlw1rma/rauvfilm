import type { Metadata } from "next";
import PricingCard from "@/components/pricing/PricingCard";
import OptionRow from "@/components/pricing/OptionRow";
import TravelCostGuide from "@/components/pricing/TravelCostGuide";

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
    videoUrl: "https://youtu.be/d7dWvR3TAEo",
    features: [
      "카메라가 친터마다 움직임 없이 꼭 촬영",
      "화질: 4K UHD 초고화질",
      "편집: 기록영상(15-30분), SNS영상(30초~1분)",
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
    videoUrl: "https://youtu.be/3ieuC7Ul5ko",
    features: [
      "화질: 4K UHD 초고화질",
      "편집: 하이라이트(2분) + 기록영상(30분~)",
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
    videoUrl: "https://youtu.be/sfKkrvLg_7g",
    features: [
      "화질: 4K UHD 초고화질",
      "편집 (총 5개 영상)\n1. 다큐형 하이라이트(4분)\n2. 다큐형 기록영상(식전/본식/식후 총 30분~)\n3. 인터뷰 영상(4팀~)",
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
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* 이벤트 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#111111] via-[#0a0a0a] to-[#111111]">
        <div className="mx-auto max-w-6xl">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-accent uppercase tracking-wider">Now Available</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">진행중인 이벤트</h2>
            <p className="text-white/50">모든 상품에 적용 가능 · 스냅 + 식전영상 중복 가능</p>
          </div>

          {/* 메인 이벤트 카드 2개 */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* 서울 야외촬영 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">서울 야외촬영</h3>
                      <p className="text-sm text-white/40">서울지역 1~2시간 촬영</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-medium text-white">스냅촬영</p>
                        <p className="text-xs text-white/40 mt-1">원본 전체 + 신부님 셀렉 10장 보정</p>
                      </div>
                      <span className="text-xl font-bold text-white">5만원</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-medium text-white">프리웨딩 식전영상</p>
                        <p className="text-xs text-white/40 mt-1">영상촬영 기반 1~2분 하이라이트</p>
                      </div>
                      <span className="text-xl font-bold text-white">10만원</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/30">*스냅작가가 있을 경우만 프리웨딩 가능</p>
                </div>
              </div>
            </div>

            {/* 예약후기 작성 이벤트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-3xl border border-white/10 overflow-hidden">
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-full">HOT</span>
                </div>
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">예약후기 작성 이벤트</h3>
                    <p className="text-sm text-white/40">예약확정 후 1개월 이내, 카페 또는 자신의 블로그에 후기 작성</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">1</span>
                        <div>
                          <p className="font-medium text-white">1건 작성</p>
                          <p className="text-xs text-white/40">가성비형은 원본전체 전달</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-accent">1만원 할인</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">2</span>
                        <div>
                          <p className="font-medium text-white">2건 작성</p>
                          <p className="text-xs text-white/40">+ SNS영상</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-accent">2만원 할인</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">3</span>
                        <div>
                          <p className="font-medium text-white">3건 작성</p>
                          <p className="text-xs text-white/40">+ SNS영상 + 원본영상 전체</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-accent">2만원 할인</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 촬영 장소 */}
          <div className="mb-12 p-6 rounded-2xl bg-[#151515] border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white/60">야외촬영 장소</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["노을공원", "창경궁", "동작대교", "잠수교", "올림픽공원", "서울숲"].map((location) => (
                <span
                  key={location}
                  className="px-4 py-2 rounded-full bg-white/5 text-sm text-white/70 hover:bg-white/10 transition-colors cursor-default"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>

          {/* 할인 혜택 */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* 짝꿍할인 */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">짝꿍할인</h4>
              <p className="text-2xl font-bold text-accent mb-3">1만원 할인</p>
              <p className="text-xs text-white/40 leading-relaxed">소개하신 분, 소개받으신 분 각 1만원 할인. 소개해 주시는 분은 잔금 0원까지 중복 가능</p>
            </div>

            {/* 촬영후기 */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">블로그/카페 촬영후기</h4>
              <p className="text-2xl font-bold text-accent mb-3">총 2만원 페이백</p>
              <p className="text-xs text-white/40 leading-relaxed">상품 받으신 날부터 1개월 이내 카페와 자신의 블로그 후기 각각 총 2건 작성</p>
            </div>

            {/* 신년할인 */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">26년 신년할인</h4>
              <p className="text-2xl font-bold text-accent mb-3">5만원 할인</p>
              <p className="text-xs text-white/40 leading-relaxed">26년 모든 예약자 대상 (26년 4월까지). *1인 1캠 미적용, 제휴상품 미적용</p>
            </div>
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

      {/* 출장비 안내 섹션 */}
      <TravelCostGuide />

    </div>
  );
}
