import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "가격 안내 | 라우브필름",
  description: "라우브필름 웨딩 영상 촬영 가격 안내입니다. 본식DVD, 시네마틱, 하이라이트 패키지를 확인하세요.",
  openGraph: {
    title: "가격 안내 | 라우브필름",
    description: "라우브필름 웨딩 영상 촬영 가격 안내입니다.",
  },
};

const pricingPlans = [
  {
    name: "Basic",
    subtitle: "본식 DVD",
    price: "80만원",
    description: "결혼식 전 과정을 담은 기본 패키지",
    features: [
      "본식 전체 촬영 (2시간)",
      "Full 버전 영상 (60~90분)",
      "USB 또는 다운로드 제공",
      "기본 색보정",
      "촬영 후 3주 내 전달",
    ],
    popular: false,
  },
  {
    name: "Premium",
    subtitle: "시네마틱",
    price: "150만원",
    description: "영화처럼 연출된 감성적인 영상",
    features: [
      "본식 전체 촬영 (2시간)",
      "시네마틱 영상 (5~10분)",
      "Full 버전 영상 (60~90분)",
      "전문 색보정 및 편집",
      "드론 촬영 (선택)",
      "촬영 후 4주 내 전달",
    ],
    popular: true,
  },
  {
    name: "Deluxe",
    subtitle: "올인원",
    price: "200만원",
    description: "모든 것을 담은 프리미엄 패키지",
    features: [
      "본식 전체 촬영 (2시간)",
      "시네마틱 영상 (5~10분)",
      "하이라이트 영상 (1~2분)",
      "Full 버전 영상 (60~90분)",
      "전문 색보정 및 편집",
      "드론 촬영 포함",
      "촬영 후 4주 내 전달",
      "추가 수정 1회 무료",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold">가격 안내</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            소중한 순간을 담기 위한 패키지를 선택하세요.
            <br />
            모든 패키지는 상담을 통해 맞춤 조정이 가능합니다.
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
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">~</span>
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

        {/* Additional Info */}
        <div className="mt-16 rounded-xl border border-border bg-muted p-8">
          <h2 className="mb-6 text-xl font-bold">추가 안내사항</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">추가 옵션</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 드론 촬영 추가: +20만원</li>
                <li>• 2인 촬영 (멀티캠): +30만원</li>
                <li>• 원본 영상 제공: +10만원</li>
                <li>• 빠른 제작 (2주): +20만원</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium">예약 및 결제</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 계약금 30% 선입금</li>
                <li>• 잔금은 촬영 당일 결제</li>
                <li>• 예식일 2주 전까지 취소 시 계약금 환불</li>
                <li>• 우천 시 일정 조율 가능</li>
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
