"use client";

import { createContext, useContext } from "react";

type ReservationTranslations = Record<string, string>;

const ReservationTranslationContext = createContext<ReservationTranslations>({});

export function ReservationTranslationProvider({
  translations,
  children,
}: {
  translations: ReservationTranslations;
  children: React.ReactNode;
}) {
  return (
    <ReservationTranslationContext.Provider value={translations}>
      {children}
    </ReservationTranslationContext.Provider>
  );
}

export function useReservationTranslation() {
  const t = useContext(ReservationTranslationContext);
  return { t };
}
