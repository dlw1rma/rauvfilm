import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://rauvfilm.co.kr"),
  title: {
    default: "라우브필름 | 웨딩 영상 촬영 전문",
    template: "%s | 라우브필름",
  },
  description: "특별한 순간을 영원히 간직하세요. 라우브필름은 감동적인 웨딩 영상을 제작합니다. 본식DVD, 시네마틱 영상 촬영 전문.",
  keywords: ["웨딩DVD", "본식영상", "결혼식DVD", "웨딩영상", "본식DVD", "라우브필름", "웨딩촬영", "결혼식영상"],
  authors: [{ name: "라우브필름" }],
  creator: "라우브필름",
  publisher: "라우브필름",
  formatDetection: {
    telephone: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://rauvfilm.co.kr",
    siteName: "라우브필름",
    title: "라우브필름 | 웨딩 영상 촬영 전문",
    description: "특별한 순간을 영원히 간직하세요. 라우브필름은 감동적인 웨딩 영상을 제작합니다.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "라우브필름 - 웨딩 영상 촬영 전문",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "라우브필름 | 웨딩 영상 촬영 전문",
    description: "특별한 순간을 영원히 간직하세요. 라우브필름은 감동적인 웨딩 영상을 제작합니다.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // 네이버 서치어드바이저 등록 후 추가
    // other: {
    //   "naver-site-verification": "인증코드",
    // },
  },
};

// Schema.org 구조화 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://rauvfilm.co.kr",
  name: "라우브필름",
  description: "웨딩 영상 촬영 전문 업체. 본식DVD, 시네마틱 영상, 하이라이트 영상 제작.",
  url: "https://rauvfilm.co.kr",
  logo: "https://rauvfilm.co.kr/logo.png",
  image: "https://rauvfilm.co.kr/og-image.jpg",
  priceRange: "₩₩",
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.5665,
    longitude: 126.9780,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "10:00",
    closes: "18:00",
  },
  sameAs: [],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "웨딩 영상 서비스",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "본식 DVD",
          description: "결혼식 전 과정을 담은 기본 영상 패키지",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "시네마틱 영상",
          description: "영화처럼 연출된 감성적인 웨딩 영상",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "하이라이트 영상",
          description: "가장 아름다운 순간을 모은 짧은 영상",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
