import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예약 문의 작성 | 라우브필름",
  description: "라우브필름 웨딩 영상 촬영 예약 문의를 작성합니다.",
};

export default function NewReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
