import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ABOUT | 라우브필름",
  description: "라우브필름을 소개합니다. VFX, 유튜브 프로덕션 출신 감독이 만드는 특별한 웨딩 영상.",
  openGraph: {
    title: "ABOUT | 라우브필름",
    description: "라우브필름을 소개합니다.",
    images: [
      {
        url: "https://res.cloudinary.com/dx8emwxho/image/upload/v1769157046/%EC%82%AC%EC%9D%B4%ED%8A%B8_%EB%8C%80%ED%91%9C_%EC%9D%B4%EB%AF%B8%EC%A7%80_rktosg.png",
        width: 1200,
        height: 630,
        alt: "라우브필름 소개",
      },
    ],
  },
};

export default function AboutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
