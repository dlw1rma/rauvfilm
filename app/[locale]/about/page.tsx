import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import AboutClient from "./AboutClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.about.metaTitle,
    description: t.about.metaDescription,
    openGraph: {
      title: t.about.metaTitle,
      description: t.about.metaDescription,
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return <AboutClient translations={t.about} />;
}
