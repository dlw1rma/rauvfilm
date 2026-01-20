import type { Metadata } from "next";
import Link from "next/link";

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
    features: [
      "4K 화질의 총 2개 영상",
      "기록영상 (15~30분)",
      "SNS영상(30초~1분)",
    ],
    popular: false,
  },
  {
    name: "1인 2캠",
    subtitle: "기본형",
    originalPrice: "600,000",
    price: "500,000",
    description: "신부대기실 + 본식 + 원판촬영",
    features: [
      "4K 화질의 총 2개 영상",
      "하이라이트 (2분~)",
      "기록영상(30분~)",
      "요청 시 인터뷰 촬영",
    ],
    popular: true,
  },
  {
    name: "2인 3캠",
    subtitle: "시네마틱형",
    originalPrice: "950,000",
    price: "850,000",
    description: "신부대기실 + 본식 + 원판촬영",
    features: [
      "4K 화질의 총 5개 영상",
      "다큐형 하이라이트 (2분~)",
      "다큐형 기록영상(식전/본식/식후 총 30분~)",
      "인터뷰 영상 (4팀~)",
    ],
    popular: false,
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
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold">PRICE</h1>
          <div className="mb-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>부가세포함 / 최대할인가</span>
          </div>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            서울, 청주 외 출장비 발생
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent px-4 py-1 text-sm font-medium text-white">
                    인기
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
              </div>

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
                    <span className="text-sm text-muted-foreground">
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

        {/* Additional Info */}
        <div className="mt-16 rounded-xl border border-border bg-muted p-8">
          <h2 className="mb-6 text-xl font-bold">추가 안내사항</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">예약 및 결제</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 계약금 30% 선입금</li>
                <li>• 잔금은 촬영 당일 결제</li>
                <li>• 예식일 2주 전까지 취소 시 계약금 환불</li>
                <li>• 우천 시 일정 조율 가능</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium">제작 기간</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 가성비형: 촬영 후 약 2-3주</li>
                <li>• 기본형: 촬영 후 약 3-4주</li>
                <li>• 시네마틱형: 촬영 후 약 4-6주</li>
                <li>• 성수기에는 조금 더 걸릴 수 있습니다</li>
              </ul>
            </div>
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
