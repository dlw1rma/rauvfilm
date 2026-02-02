'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReservationCompletePage() {
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText('03743704012104');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">예약 등록이 완료되었습니다</h1>
          <p className="text-muted-foreground">
            아래 계좌로 예약금을 입금해주시면 예약이 확정됩니다.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 mb-6">
          <h2 className="font-semibold mb-4">예약금 입금 안내</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">은행</span>
              <span className="font-medium">국민은행</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">계좌번호</span>
              <span className="font-medium font-mono">037437-04-012104</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">예금주</span>
              <span className="font-medium">손세한</span>
            </div>
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">예약금</span>
                <span className="text-lg font-bold text-accent">100,000원</span>
              </div>
            </div>
          </div>

          <button
            onClick={copyAccount}
            className="w-full mt-4 py-3 px-4 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            {copied ? '복사됨!' : '계좌번호 복사'}
          </button>
        </div>

        <div className="space-y-3">
          <Link
            href="/mypage"
            className="block w-full py-3 px-4 rounded-lg bg-accent text-white text-center font-medium hover:bg-accent/90 transition-colors"
          >
            마이페이지로 이동
          </Link>
          <Link
            href="/"
            className="block w-full py-3 px-4 rounded-lg border border-border text-center text-sm font-medium hover:bg-muted transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
