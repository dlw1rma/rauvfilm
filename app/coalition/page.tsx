import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "제휴 안내 | 라우브필름",
  description: "라우브필름과 함께하는 제휴 파트너를 소개합니다. 웨딩홀, 스튜디오, 드레스샵 등 다양한 제휴 혜택을 확인하세요.",
  openGraph: {
    title: "제휴 안내 | 라우브필름",
    description: "라우브필름과 함께하는 제휴 파트너를 소개합니다.",
  },
};

export default function CoalitionPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-widest">제휴 안내</h1>
          <p className="text-lg text-muted-foreground">
            라우브필름과 함께하는 파트너사를 소개합니다
          </p>
        </div>

        {/* Partnership Info */}
        <div className="bg-muted rounded-xl p-8 border border-border mb-12">
          <h2 className="text-xl font-bold mb-4">제휴 파트너 혜택</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-accent">•</span>
              <span>제휴 웨딩홀 예식 시 특별 할인 적용</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent">•</span>
              <span>파트너 스튜디오 촬영 시 추가 혜택 제공</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent">•</span>
              <span>제휴 드레스샵 이용 시 특별 서비스</span>
            </li>
          </ul>
        </div>

        {/* Partnership Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-muted rounded-xl p-6 border border-border">
            <h3 className="font-bold mb-3">웨딩홀 파트너</h3>
            <p className="text-sm text-muted-foreground mb-4">
              제휴 웨딩홀에서 예식 시 할인 혜택이 적용됩니다.
            </p>
            <p className="text-xs text-muted-foreground">
              * 자세한 제휴 웨딩홀 목록은 상담 시 안내드립니다.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 border border-border">
            <h3 className="font-bold mb-3">스튜디오 파트너</h3>
            <p className="text-sm text-muted-foreground mb-4">
              스튜디오 촬영과 함께 예약 시 패키지 혜택을 드립니다.
            </p>
            <p className="text-xs text-muted-foreground">
              * 자세한 제휴 스튜디오 목록은 상담 시 안내드립니다.
            </p>
          </div>
        </div>

        {/* Partnership Inquiry */}
        <div className="bg-accent/10 rounded-xl p-8 border border-accent/20 text-center">
          <h2 className="text-xl font-bold mb-4">제휴 문의</h2>
          <p className="text-muted-foreground mb-6">
            라우브필름과 함께 협력하고 싶으신 업체가 있으시다면
            <br />
            아래 연락처로 문의해 주세요.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground mb-6">
            <p>
              <span className="font-medium text-foreground">이메일:</span>{" "}
              rauvfilm@naver.com
            </p>
            <p>
              <span className="font-medium text-foreground">전화:</span>{" "}
              010-4512-3587
            </p>
          </div>
          <a
            href="https://pf.kakao.com/_xlXAin/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1"
          >
            카카오톡으로 문의하기
          </a>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            예약 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
