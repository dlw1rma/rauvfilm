export const locales = ['ko', 'ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ko';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export const localeConfig: Record<Locale, { name: string; flag: string; htmlLang: string; ogLocale: string }> = {
  ko: { name: '한국어', flag: '🇰🇷', htmlLang: 'ko', ogLocale: 'ko_KR' },
  ja: { name: '日本語', flag: '🇯🇵', htmlLang: 'ja', ogLocale: 'ja_JP' },
  en: { name: 'English', flag: '🇺🇸', htmlLang: 'en', ogLocale: 'en_US' },
};
