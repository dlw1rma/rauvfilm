'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/useLocale';
import type { ComponentProps } from 'react';

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export default function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();

  // Don't add locale prefix if already has one, or for external/anchor/mypage/admin/api links
  const shouldPrefix =
    href.startsWith('/') &&
    !href.startsWith(`/${locale}/`) &&
    !href.startsWith('/mypage') &&
    !href.startsWith('/admin') &&
    !href.startsWith('/api') &&
    href !== `/${locale}`;

  const localizedHref = shouldPrefix ? `/${locale}${href}` : href;

  return <Link href={localizedHref} {...props} />;
}
