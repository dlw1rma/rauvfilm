import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import FaqClient from "./FaqClient";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return <FaqClient translations={t.faq} />;
}
