'use client';

import { usePathname } from 'next/navigation';
import { type Locale, defaultLocale, isValidLocale } from './i18n';

export function useLocale(): Locale {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  if (maybeLocale && isValidLocale(maybeLocale)) {
    return maybeLocale;
  }
  return defaultLocale;
}
