'use client';

import { useState } from 'react';
import LocaleLink from '@/components/ui/LocaleLink';
import { useReservationTranslation } from '@/components/reservation/ReservationTranslationProvider';

export default function ReservationCompletePage() {
  const [copied, setCopied] = useState(false);
  const { t } = useReservationTranslation();

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
          <h1 className="text-2xl font-bold mb-2">{t.completionTitle}</h1>
          <p className="text-muted-foreground">
            {t.completionDesc}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 mb-6">
          <h2 className="font-semibold mb-4">{t.depositGuide}</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.bank}</span>
              <span className="font-medium">{t.bankName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.accountNumber}</span>
              <span className="font-medium font-mono">037437-04-012104</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.accountHolder}</span>
              <span className="font-medium">{t.accountHolderName}</span>
            </div>
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{t.depositAmount}</span>
                <span className="text-lg font-bold text-accent">{t.depositPrice}</span>
              </div>
            </div>
          </div>

          <button
            onClick={copyAccount}
            className="w-full mt-4 py-3 px-4 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            {copied ? t.copied : t.copyAccount}
          </button>
        </div>

        <div className="space-y-3">
          <LocaleLink
            href="/mypage"
            className="block w-full py-3 px-4 rounded-lg bg-accent text-white text-center font-medium hover:bg-accent/90 transition-colors"
          >
            {t.goMypage}
          </LocaleLink>
          <LocaleLink
            href="/"
            className="block w-full py-3 px-4 rounded-lg border border-border text-center text-sm font-medium hover:bg-muted transition-colors"
          >
            {t.goHome}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
