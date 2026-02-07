import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import LocaleLink from "@/components/ui/LocaleLink";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

function getLocalizedName(location: { name: string; nameEn?: string | null; nameJa?: string | null }, locale: string): string {
  if (locale === 'en' && location.nameEn) return location.nameEn;
  if (locale === 'ja' && location.nameJa) return location.nameJa;
  return location.name;
}

function getLocalizedDescription(location: { description?: string | null; descriptionEn?: string | null; descriptionJa?: string | null }, locale: string): string | null {
  if (locale === 'en' && location.descriptionEn) return location.descriptionEn;
  if (locale === 'ja' && location.descriptionJa) return location.descriptionJa;
  return location.description || null;
}

/**
 * Cloudinary URL에 최적화 transformation 추가
 */
function getOptimizedThumbnailUrl(secureUrl: string, maxWidth: number = 800): string {
  if (secureUrl.includes('res.cloudinary.com')) {
    if (secureUrl.includes('/image/upload/')) {
      const parts = secureUrl.split('/image/upload/');
      if (parts.length === 2) {
        const existingTransform = parts[1].split('/')[0];
        const publicId = parts[1].substring(existingTransform.length + 1);
        return `${parts[0]}/image/upload/w_${maxWidth},q_auto,f_auto/${publicId}`;
      }
    }
    const parts = secureUrl.split('/image/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/image/upload/w_${maxWidth},q_auto,f_auto/${parts[1]}`;
    }
  }
  return secureUrl;
}

export const revalidate = 3600; // 1시간마다 재생성

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.eventSnap.metaTitle,
    description: t.eventSnap.metaDescription,
  };
}

async function getLocations() {
  try {
    const locations = await prisma.eventSnapLocation.findMany({
      where: { isVisible: true },
      include: {
        images: {
          where: { isVisible: true },
          orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
          take: 1, // 대표 이미지 1장 (isFeatured 우선)
        },
      },
      orderBy: { order: 'asc' },
    });
    return locations;
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return [];
  }
}

export default async function EventSnapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  const locations = await getLocations();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-widest">EVENT SNAP</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mobile-br-hidden">
            {t.eventSnap.subtitle}
            <br />
            {t.eventSnap.subtitleSub}
          </p>
        </div>

        {/* Location Grid */}
        {locations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {locations.map((location) => (
              <LocaleLink
                key={location.id}
                href={`/event-snap/${location.slug}`}
                className="group block rounded-xl border border-border bg-muted overflow-hidden transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-accent/10"
              >
                {/* Image - 원본 비율로 박스 꽉 차게 (width/height 있으면 해당 비율, 없으면 16/9) */}
                <div
                  className="relative w-full bg-background overflow-hidden"
                  style={{
                    aspectRatio:
                      location.images[0]?.width && location.images[0]?.height
                        ? `${location.images[0].width} / ${location.images[0].height}`
                        : "16 / 9",
                  }}
                >
                  {location.images[0] ? (
                    <Image
                      src={getOptimizedThumbnailUrl(location.images[0].secureUrl, 800)}
                      alt={location.images[0].alt || location.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <svg
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">
                    {getLocalizedName(location, locale)}
                  </h2>
                  {locale !== 'en' && location.nameEn && (
                    <p className="text-sm text-muted-foreground mb-3 tracking-wider">
                      {location.nameEn}
                    </p>
                  )}
                  {getLocalizedDescription(location, locale) && (
                    <p className="text-sm text-muted-foreground">
                      {getLocalizedDescription(location, locale)}
                    </p>
                  )}
                </div>
              </LocaleLink>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg
              className="h-20 w-20 mx-auto mb-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <p className="text-lg text-muted-foreground">
              {t.eventSnap.noLocations}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
