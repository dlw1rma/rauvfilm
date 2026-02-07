'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';

const localeLabels: Record<Locale, string> = {
  ko: 'KO',
  ja: 'JA',
  en: 'EN',
};

function getLocaleFromCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
  if (match && locales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }
  return null;
}

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const segments = pathname.split('/');
  const localeFromPath = locales.includes(segments[1] as Locale) ? (segments[1] as Locale) : null;
  const currentLocale = localeFromPath || getLocaleFromCookie() || 'ko';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    if (localeFromPath) {
      // URL에 locale이 있는 경우 (공개 페이지): locale 부분만 교체
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
      router.push(newPathname);
    } else {
      // URL에 locale이 없는 경우 (mypage 등): 쿠키만 업데이트하고 새로고침
      router.refresh();
    }
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 rounded text-xs font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Change language"
      >
        {localeLabels[currentLocale]}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 rounded-lg border border-border bg-[#1a1a1a] shadow-lg py-1 z-50">
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                className={`w-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                  isActive
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {localeLabels[locale]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
