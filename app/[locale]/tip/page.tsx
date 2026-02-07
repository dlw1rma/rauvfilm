import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import TipClient from "./TipClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.tip.metaTitle,
    description: t.tip.metaDescription,
  };
}

export default async function TipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return <TipClient translations={t.tip} />;
}
