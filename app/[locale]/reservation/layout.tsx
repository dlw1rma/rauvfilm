import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import { ReservationTranslationProvider } from "@/components/reservation/ReservationTranslationProvider";

export default async function ReservationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : "ko");

  return (
    <ReservationTranslationProvider translations={t.reservationForm}>
      {children}
    </ReservationTranslationProvider>
  );
}
