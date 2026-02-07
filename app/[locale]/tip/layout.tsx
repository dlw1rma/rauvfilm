import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.tip.metaTitle,
    description: t.tip.metaDescription,
    openGraph: {
      title: t.tip.metaTitle,
      description: t.tip.metaDescription,
    },
  };
}

export default function TipLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
