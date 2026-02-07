import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import CustomClient from "./CustomClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.custom.metaTitle,
    description: t.custom.metaDescription,
  };
}

export default async function CustomPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <CustomClient />;
}
