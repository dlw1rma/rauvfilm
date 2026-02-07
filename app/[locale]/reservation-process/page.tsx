import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import ReservationProcessClient from "./ReservationProcessClient";

export default async function ReservationProcessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return <ReservationProcessClient translations={t.reservationProcess} />;
}
