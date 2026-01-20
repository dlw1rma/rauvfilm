import type { Metadata } from "next";
import Link from "next/link";
import YouTubeFacade from "@/components/video/YouTubeFacade";

export const metadata: Metadata = {
  title: "가격 안내 | 라우브필름",
  description: "라우브필름 웨딩 영상 촬영 가격 안내입니다. 가성비형, 기본형, 시네마틱형 패키지를 확인하세요.",
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
    videoUrl: "https://www.youtube.com/watch?v=BEEXhZW2GMo", // 예시 URL, 실제 영상으로 교체 필요
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
    videoUrl: "https://www.youtube.com/watch?v=BEEXhZW2GMo", // 예시 URL, 실제 영상으로 교체 필요
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
      "대표작가와 수석실장만 요청시 \"짐벌로 촬영됩니다\"",
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
    videoUrl: "https://www.youtube.com/watch?v=BEEXhZW2GMo", // 예시 URL, 실제 영상으로 교체 필요
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
      "대표작가와 수석실장이 동반하며, \"짐벌촬영이 포함됩니다\"",
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

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold">본식 영상 상품</h1>
          <div className="mb-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>부가세포함 / 최대할인가</span>
          </div>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            *서울, 청주 이외 지역은 출장비가 발생합니다. (불영자 1명 기준)
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 transition-all hover:-translate-y-1 ${
                plan.popular
                  ? "border-accent bg-gradient-to-b from-accent/10 to-transparent shadow-lg shadow-accent/10"
                  : "border-border bg-muted"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-4">
                  <span className="rounded-full bg-accent px-4 py-1 text-sm font-medium text-white">
                    인기
                  </span>
                </div>
              )}
              {plan.isNew && (
                <div className="absolute -top-4 right-4">
                  <span className="rounded-full bg-accent px-4 py-1 text-sm font-medium text-white">
                    NEW
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-medium text-accent">{plan.subtitle}</p>
                <h3 className="mt-1 text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {plan.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">원</span>
                </div>
                {plan.originalPrice && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.subtitle === "가성비형" && "할인이벤트 적용시"}
                    {plan.subtitle === "기본형" && "모든 할인이벤트 적용시"}
                    {plan.subtitle === "시네마틱형" && "제대할인 적용시"}
                  </p>
                )}
              </div>

              {/* Video Preview */}
              {plan.videoUrl && (
                <div className="mb-6">
                  <YouTubeFacade
                    videoId={extractVideoId(plan.videoUrl)}
                    title={`${plan.name} 영상`}
                  />
                </div>
              )}

              {/* Recommendations */}
              {plan.recommendations && plan.recommendations.length > 0 && (
                <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <h4 className="mb-2 text-sm font-medium text-accent">이런 분께 추천</h4>
                  <ul className="space-y-1">
                    {plan.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs text-muted-foreground">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                  {plan.gimbalNote && (
                    <p className="mt-2 text-xs text-muted-foreground">{plan.gimbalNote}</p>
                  )}
                </div>
              )}

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-muted-foreground whitespace-pre-line">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`block w-full rounded-lg py-3 text-center font-medium transition-all hover:-translate-y-0.5 ${
                  plan.popular
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-background text-foreground hover:bg-border"
                }`}
              >
                상담 신청하기
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-16 rounded-xl border border-border bg-muted p-8">
          <h2 className="mb-6 text-xl font-bold">OPTIONS</h2>
          <div className="space-y-4">
            {additionalOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <h3 className="mb-1 font-medium">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{option.price}원</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-muted-foreground">
            궁금한 점이 있으시면 편하게 문의해주세요.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1"
          >
            무료 상담 신청
          </Link>
        </div>
      </div>
    </div>
  );
}
