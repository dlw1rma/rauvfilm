import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import KakaoChannelButton from "@/components/KakaoChannelButton";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { locales, isValidLocale, localeConfig, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";

const keywordsMap: Record<string, string> = {
  ko: "본식DVD 가격, 가성비 본식DVD, 본식 DVD 추천, 라우브필름 가격, 라우브필름 후기, 결혼식DVD, 웨딩DVD, 본식DVD사기, 본식영상, 웨딩영상, 식전영상, 르랑필름, 스냅스타, 결혼식영상",
  ja: "ウェディングDVD, ウェディング映像, 結婚式DVD, ラウブフィルム, 挙式映像, ブライダル映像",
  en: "wedding DVD price, budget wedding DVD, wedding DVD review, RAUV Film, wedding video, ceremony video, bridal video",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const t = await getDictionary(locale);
  const ogLocale = localeConfig[locale].ogLocale;

  const alternates: Record<string, string> = {};
  for (const l of locales) {
    alternates[l] = `https://rauvfilm.co.kr/${l}`;
  }

  return {
    metadataBase: new URL("https://rauvfilm.co.kr"),
    title: t.common.siteName,
    description: t.common.siteDescription,
    keywords: keywordsMap[locale] || keywordsMap.ko,
    authors: [{ name: t.common.siteName }],
    creator: t.common.siteName,
    publisher: t.common.siteName,
    formatDetection: {
      telephone: true,
      email: true,
    },
    alternates: {
      languages: alternates,
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: `https://rauvfilm.co.kr/${locale}`,
      siteName: t.common.siteName,
      title: t.common.siteName,
      description: t.common.siteDescription,
      images: [
        {
          url: "https://res.cloudinary.com/dx8emwxho/image/upload/v1769157046/%EC%82%AC%EC%9D%B4%ED%8A%B8_%EB%8C%84%ED%91%9C_%EC%9D%B4%EB%AF%B8%EC%A7%80_rktosg.png",
          width: 1200,
          height: 630,
          alt: t.common.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.common.siteName,
      description: t.common.siteDescription,
      images: [
        "https://res.cloudinary.com/dx8emwxho/image/upload/v1769157046/%EC%82%AC%EC%9D%B4%ED%8A%B8_%EB%8C%84%ED%91%9C_%EC%9D%B4%EB%AF%B8%EC%A7%80_rktosg.png",
      ],
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
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getJsonLd(t: any) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://rauvfilm.co.kr",
    name: t.common.siteName,
    description: t.common.siteDescription,
    url: "https://rauvfilm.co.kr",
    logo: "https://rauvfilm.co.kr/logo.png",
    image: "https://rauvfilm.co.kr/og-image.jpg",
    priceRange: "₩₩",
    availableLanguage: ["Korean", "Japanese", "English"],
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.5665,
      longitude: 126.978,
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
      name: t.product.title,
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: t.product.budget,
            description: t.product.description,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: t.product.cinematic,
            description: t.product.description,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: t.product.standard,
            description: t.product.description,
          },
        },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const htmlLang = localeConfig[locale].htmlLang;
  const t = await getDictionary(locale);
  const jsonLd = getJsonLd(t);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScrollProvider>
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
        <KakaoChannelButton label={t.common.kakaoConsult} />
      </SmoothScrollProvider>
    </>
  );
}
