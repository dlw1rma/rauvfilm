'use client';

import { useLocale } from "@/lib/useLocale";

const loadingText = {
  ko: "로딩 중...",
  ja: "読み込み中...",
  en: "Loading...",
};

export default function Loading() {
  const locale = useLocale();
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
        <p className="text-sm text-muted-foreground">{loadingText[locale] || loadingText.ko}</p>
      </div>
    </div>
  );
}
