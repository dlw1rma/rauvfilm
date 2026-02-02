"use client";

import Link from "next/link";

export default function PostWeddingMessagePage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            &larr; 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold mt-4 mb-2">예식 후 안내 설정</h1>
          <p className="text-sm text-muted-foreground">
            예식 다음 날 오전 10시에 고객님께 카카오 알림톡이 자동 발송됩니다.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 mb-6">
          <h2 className="font-semibold mb-3">발송 방식</h2>
          <p className="text-sm text-muted-foreground mb-4">
            솔라피 카카오 알림톡 템플릿을 사용하여 발송됩니다.
            알림톡 템플릿 관리 페이지에서 &quot;예식후안내&quot; 용도로 템플릿을 지정해주세요.
          </p>
          <Link
            href="/admin/sms-templates"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            알림톡 템플릿 관리로 이동
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-muted p-6 mb-6">
          <h2 className="font-semibold mb-3">자동 발송 조건</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#x2022;</span>
              <span>매일 오전 10시 (KST) 자동 실행</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#x2022;</span>
              <span>예식일이 <strong className="text-foreground">어제</strong>인 예약 중 아직 발송되지 않은 건 대상</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#x2022;</span>
              <span>취소된 예약, 해외 거주 고객은 제외</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#x2022;</span>
              <span>발송 후 중복 발송 방지를 위해 기록됨</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-muted p-6">
          <h2 className="font-semibold mb-3">템플릿 변수</h2>
          <p className="text-sm text-muted-foreground mb-3">
            솔라피에서 알림톡 템플릿 작성 시 아래 변수를 사용할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { var: "#{고객명}", desc: "계약자 성함" },
              { var: "#{예식일}", desc: "예식 날짜" },
            ].map((v) => (
              <span
                key={v.var}
                className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border px-3 py-1.5 text-sm"
              >
                <code className="font-mono text-accent">{v.var}</code>
                <span className="text-muted-foreground">&rarr; {v.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
