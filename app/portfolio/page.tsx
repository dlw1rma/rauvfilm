import type { Metadata } from "next";
import PortfolioPageClient from "./page-client";

export const metadata: Metadata = {
  title: "포트폴리오 | 라우브필름",
  description: "라우브필름의 웨딩 영상 포트폴리오입니다. 가성비형, 기본형, 시네마틱형 등 다양한 작품을 확인하세요.",
  openGraph: {
    title: "포트폴리오 | 라우브필름",
    description: "라우브필름의 웨딩 영상 포트폴리오입니다.",
  },
};

export const dynamic = "force-dynamic";

export default function PortfolioPage() {
  return <PortfolioPageClient />;
}
