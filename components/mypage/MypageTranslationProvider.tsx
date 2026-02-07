"use client";

import { createContext, useContext } from "react";

type MypageTranslations = Record<string, string>;

const MypageTranslationContext = createContext<MypageTranslations>({});

export function MypageTranslationProvider({
  translations,
  children,
}: {
  translations: MypageTranslations;
  children: React.ReactNode;
}) {
  return (
    <MypageTranslationContext.Provider value={translations}>
      {children}
    </MypageTranslationContext.Provider>
  );
}

export function useMypageTranslation() {
  return useContext(MypageTranslationContext);
}
