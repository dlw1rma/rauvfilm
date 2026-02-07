import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.reservationForm.newMetaTitle,
    description: t.reservationForm.newMetaDescription,
  };
}

export default function NewReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
