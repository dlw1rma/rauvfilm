import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import ContactClient from "./ContactClient";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return <ContactClient translations={t.contact} locale={locale} />;
}
