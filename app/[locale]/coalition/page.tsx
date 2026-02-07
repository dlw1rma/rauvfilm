import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import Image from "next/image";
import LocaleLink from "@/components/ui/LocaleLink";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.coalition.metaTitle,
    description: t.coalition.metaDescription,
  };
}

async function getCoalitionImage() {
  try {
    const image = await prisma.siteImage.findFirst({
      where: {
        category: "coalition",
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        secureUrl: true,
        alt: true,
        width: true,
        height: true,
      },
    });
    return image;
  } catch (error) {
    console.error("Failed to fetch coalition image:", error);
    return null;
  }
}

export default async function CoalitionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  const coalitionImage = await getCoalitionImage();
  const lemeGraphyUrl = "http://leumewedding.com/"; // 르메그라피 링크

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-widest">{t.coalition.pageTitle}</h1>
          <p className="text-lg text-muted-foreground">
            {t.coalition.pageDesc}
          </p>
        </div>

        {/* 제휴사 이미지 - 이미지 비율에 맞춰 박스 조절, 잘리지 않게 표시 */}
        {coalitionImage && (
          <div className="mb-12">
            <a
              href={lemeGraphyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-full rounded-xl overflow-hidden bg-muted border border-border hover:shadow-lg transition-shadow cursor-pointer"
            >
              {coalitionImage.width && coalitionImage.height ? (
                <Image
                  src={coalitionImage.secureUrl}
                  alt={coalitionImage.alt || t.coalition.partnerImageAlt}
                  width={coalitionImage.width}
                  height={coalitionImage.height}
                  className="w-full h-auto object-contain"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              ) : (
                <span className="block relative w-full" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={coalitionImage.secureUrl}
                    alt={coalitionImage.alt || t.coalition.partnerImageAlt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 896px) 100vw, 896px"
                    priority
                  />
                </span>
              )}
            </a>
          </div>
        )}

        {/* 제휴 파트너 혜택 */}
        <div className="bg-muted rounded-xl p-8 border border-border">
          <h2 className="text-xl font-bold mb-4">{t.coalition.benefitsTitle}</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-accent">•</span>
              <span>{t.coalition.benefit1}</span>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}
