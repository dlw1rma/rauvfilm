'use client';

import Link from 'next/link';

export default function AccessRestrictedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3">마이페이지 접근 제한</h1>
        <p className="text-muted-foreground mb-6">
          예약이 확정된 후에 마이페이지를 이용하실 수 있습니다.
          <br />
          예약 확정 안내를 기다려 주세요.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/reservation"
            className="block w-full py-3 rounded-lg border border-border font-medium hover:bg-muted/50 transition-colors"
          >
            예약 문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
