import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "진행중인 이벤트 | 라우브필름",
  description: "라우브필름 진행중인 할인 이벤트 및 프로모션을 확인하세요.",
};

export default function EventsPage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-muted">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">진행중인 이벤트</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="rounded-full bg-accent px-4 py-1 text-sm font-medium text-white">
              모든 상품 진행 가능
            </span>
            <span className="rounded-full bg-muted border border-border px-4 py-1 text-sm font-medium">
              스냅 + 식전영상 모두 선택 가능
            </span>
          </div>
        </div>

        {/* 서울 야외촬영 */}
        <div className="mb-12 rounded-xl border border-border bg-background p-8">
          <h2 className="mb-4 text-2xl font-bold">서울 야외촬영</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            서울지역 1~2시간 촬영 | 스냅작가가 있을 경우만 프리웨딩 가능
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">
                  스냅촬영
                </span>
                <span className="text-lg font-bold text-accent">5만원</span>
              </div>
              <p className="text-sm text-muted-foreground">
                원본 전체 + 신부님 셀렉 10장 보정
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">
                  프리웨딩 식전영상
                </span>
                <span className="text-lg font-bold text-accent">10만원</span>
              </div>
              <p className="text-sm text-muted-foreground">
                영상촬영 기반 1~2분 하이라이트
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-3 text-sm font-medium">촬영 장소</h3>
            <div className="flex flex-wrap gap-2">
              {["노을공원", "창경궁", "동작대교", "잠수교", "올림픽공원", "서울숲"].map((location) => (
                <span
                  key={location}
                  className="rounded-full border border-border bg-muted px-4 py-2 text-sm"
                >
                  {location}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              *위 장소 중 한 곳에서 진행됩니다
            </p>
          </div>

          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition-all hover:bg-accent hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            포트폴리오 확인하기
          </Link>
        </div>

        {/* 예약후기 작성 이벤트 */}
        <div className="mb-12 rounded-xl border border-border bg-background p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
              HOT
            </span>
            <h2 className="text-2xl font-bold">예약후기 작성 이벤트</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            예약확정 후 1개월 이내, 카페 또는 자신의 블로그에 후기 작성
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">
                  1건 작성
                </span>
                <span className="text-lg font-bold text-accent">1만원 할인</span>
              </div>
              <p className="text-sm text-muted-foreground">
                가성비형은 원본전체 전달
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">
                  2건 작성
                </span>
                <span className="text-lg font-bold text-accent">2만원 할인</span>
              </div>
              <p className="text-sm text-muted-foreground">
                + SNS영상
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">
                  3건 작성
                </span>
                <span className="text-lg font-bold text-accent">2만원 할인</span>
              </div>
              <p className="text-sm text-muted-foreground">
                + SNS영상 + 원본영상 전체
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            *내용 중복 불가 | [가성비형]은 1건만 인정
          </p>
        </div>

        {/* 할인 박스들 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 짝궁할인 */}
          <div className="rounded-xl border border-border bg-background p-6">
            <h3 className="mb-2 text-xl font-bold">짝궁할인</h3>
            <p className="mb-4 text-2xl font-bold text-accent">1만원 할인</p>
            <p className="text-sm text-muted-foreground">
              소개하신 분, 소개받으신 분 각 1만원 할인. 소개해 주시는 분은 잔금 0원까지 중복 가능
            </p>
          </div>

          {/* 블로그와 카페 촬영후기 */}
          <div className="rounded-xl border border-border bg-background p-6">
            <h3 className="mb-2 text-xl font-bold">블로그와 카페 촬영후기</h3>
            <p className="mb-4 text-2xl font-bold text-accent">총 2만원 페이백</p>
            <p className="text-sm text-muted-foreground">
              상품 받으신 날부터 1개월 이내 카페와 자신의 블로그 후기 각각 종 2건 작성
            </p>
          </div>

          {/* 26년 신년할인 */}
          <div className="rounded-xl border border-border bg-background p-6">
            <h3 className="mb-2 text-xl font-bold">26년 신년할인</h3>
            <p className="mb-4 text-2xl font-bold text-accent">5만원 할인</p>
            <p className="text-sm text-muted-foreground mb-2">
              26년 모든 예약자 대상. (26년 4월까지)
            </p>
            <p className="text-xs text-muted-foreground">
              *1인 1캠 미적용, 제휴상품 미적용
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
