'use client';

import LocaleLink from "@/components/ui/LocaleLink";
import { useLocale } from "@/lib/useLocale";

const translations = {
  ko: {
    title: "404",
    heading: "페이지를 찾을 수 없습니다",
    description: "요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.\nURL을 확인하시거나 아래 버튼을 눌러 홈으로 이동해주세요.",
    goHome: "홈으로 가기",
    contact: "문의하기",
  },
  ja: {
    title: "404",
    heading: "ページが見つかりません",
    description: "お探しのページは存在しないか、移動された可能性があります。\nURLをご確認いただくか、下のボタンからホームへお進みください。",
    goHome: "ホームへ",
    contact: "お問い合わせ",
  },
  en: {
    title: "404",
    heading: "Page Not Found",
    description: "The page you requested does not exist or may have been moved.\nPlease check the URL or click the button below to go home.",
    goHome: "Go Home",
    contact: "Contact Us",
  },
};

export default function NotFound() {
  const locale = useLocale();
  const t = translations[locale] || translations.ko;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-accent mb-4">{t.title}</h1>
        <h2 className="text-2xl font-bold mb-4">{t.heading}</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t.description.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < t.description.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <LocaleLink
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1"
          >
            {t.goHome}
          </LocaleLink>
          <LocaleLink
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-base font-medium transition-all hover:bg-muted"
          >
            {t.contact}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
