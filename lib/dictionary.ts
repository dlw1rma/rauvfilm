import type { Locale } from './i18n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dictionaries: Record<Locale, () => Promise<any>> = {
  ko: () => import('@/locales/ko.json').then((m) => m.default),
  ja: () => import('@/locales/ja.json').then((m) => m.default),
  en: () => import('@/locales/en.json').then((m) => m.default),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let koFallback: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDictionary(locale: Locale): Promise<any> {
  const dict = await dictionaries[locale]();

  if (locale === 'ko') {
    koFallback = dict;
    return dict;
  }

  // Load Korean as fallback
  if (!koFallback) {
    koFallback = await dictionaries.ko();
  }

  // Deep merge: use locale dict with ko fallback
  return deepMerge(koFallback, dict);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(fallback: any, override: any): any {
  const result = { ...fallback };
  for (const key of Object.keys(override)) {
    if (
      override[key] &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      fallback[key] &&
      typeof fallback[key] === 'object' &&
      !Array.isArray(fallback[key])
    ) {
      result[key] = deepMerge(fallback[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}
