import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의하기 | 라우브필름",
  description: "라우브필름 웨딩 영상 촬영 문의입니다. 견적, 예약, 상담 등 궁금한 점을 남겨주세요.",
  openGraph: {
    title: "문의하기 | 라우브필름",
    description: "라우브필름 웨딩 영상 촬영 문의입니다.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
