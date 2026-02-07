import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.about.metaTitle,
    description: t.about.metaDescription,
    openGraph: {
      title: t.about.metaTitle,
      description: t.about.metaDescription,
      images: [
        {
          url: "https://res.cloudinary.com/dx8emwxho/image/upload/v1769157046/%EC%82%AC%EC%9D%B4%ED%8A%B8_%EB%8C%80%ED%91%9C_%EC%9D%B4%EB%AF%B8%EC%A7%80_rktosg.png",
          width: 1200,
          height: 630,
          alt: t.about.metaTitle,
        },
      ],
    },
  };
}

export default function AboutLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
