import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "예약절차 | 라우브필름",
  description: "간단한 3단계로 예약이 완료됩니다. 카카오톡 채널로 촬영 가능여부 확인부터 확정문자와 계약서 받기까지.",
  openGraph: {
    title: "예약절차 | 라우브필름",
    description: "간단한 3단계로 예약이 완료됩니다.",
  },
};

export default function ReservationProcessLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
