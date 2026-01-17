import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "라우브필름 | 웨딩 영상 촬영 전문",
  description: "웨딩 본식 DVD, 시네마틱 영상 제작 전문 업체 라우브필름입니다. 여러분의 특별한 순간을 아름답게 담아드립니다.",
  keywords: ["웨딩DVD", "본식영상", "결혼식DVD", "웨딩영상", "본식DVD", "라우브필름"],
  openGraph: {
    title: "라우브필름 | 웨딩 영상 촬영 전문",
    description: "웨딩 본식 DVD, 시네마틱 영상 제작 전문 업체",
    url: "https://rauvfilm.co.kr",
    siteName: "라우브필름",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Header />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
