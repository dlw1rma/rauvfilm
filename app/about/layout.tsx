import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ABOUT | 라우브필름",
  description: "라우브필름을 소개합니다. VFX, 유튜브 프로덕션 출신 감독이 만드는 특별한 웨딩 영상.",
  openGraph: {
    title: "ABOUT | 라우브필름",
    description: "라우브필름을 소개합니다.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
