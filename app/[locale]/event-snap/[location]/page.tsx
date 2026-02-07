import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import LocaleLink from "@/components/ui/LocaleLink";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GalleryWithLightbox from "@/components/event-snap/GalleryWithLightbox";

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
function getOptimizedImageUrl(secureUrl: string, maxWidth: number = 1200): string {
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

interface PageProps {
  params: Promise<{ locale: string; location: string }>;
}

async function getLocation(slug: string) {
  try {
    const location = await prisma.eventSnapLocation.findUnique({
      where: { slug, isVisible: true },
      include: {
        images: {
          where: { isVisible: true },
          orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
        },
      },
    });
    return location;
  } catch (error) {
    console.error('Failed to fetch location:', error);
    return null;
  }
}

async function getAllSlugs() {
  try {
    const locations = await prisma.eventSnapLocation.findMany({
      where: { isVisible: true },
      select: { slug: true },
    });
    return locations.map(l => l.slug);
  } catch (error) {
    console.error('Failed to fetch slugs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, location: slug } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  const location = await getLocation(slug);

  if (!location) {
    return {
      title: t.eventSnap.notFoundMeta,
    };
  }

  return {
    title: `${getLocalizedName(location, locale)} | ${t.eventSnap.locationMetaSuffix}`,
    description: getLocalizedDescription(location, locale) || `${getLocalizedName(location, locale)}${t.eventSnap.locationMetaDesc}`,
    openGraph: {
      title: `${getLocalizedName(location, locale)} | ${t.eventSnap.locationMetaSuffix}`,
      description: getLocalizedDescription(location, locale) || `${getLocalizedName(location, locale)}${t.eventSnap.locationMetaDesc}`,
      images: location.images[0] ? [{ url: location.images[0].secureUrl }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ location: slug }));
}

export default async function EventSnapLocationPage({ params }: PageProps) {
  const { locale, location: slug } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  const location = await getLocation(slug);

  if (!location) {
    notFound();
  }

  const featuredImage = location.images.find(img => img.isFeatured) || location.images[0];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <LocaleLink
          href="/event-snap"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t.eventSnap.backToList}
        </LocaleLink>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold">{getLocalizedName(location, locale)}</h1>
          {locale !== 'en' && location.nameEn && (
            <p className="text-lg text-muted-foreground tracking-wider">
              {location.nameEn}
            </p>
          )}
        </div>

        {/* Main Image - 원본 비율로 박스 꽉 차게 */}
        <div
          className="relative w-full bg-muted rounded-xl mb-8 overflow-hidden"
          style={{
            aspectRatio:
              featuredImage?.width && featuredImage?.height
                ? `${featuredImage.width} / ${featuredImage.height}`
                : "16 / 9",
          }}
        >
          {featuredImage ? (
            <Image
              src={getOptimizedImageUrl(featuredImage.secureUrl, 1200)}
              alt={featuredImage.alt || getLocalizedName(location, locale)}
              fill
              className="object-contain"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <svg
                  className="h-20 w-20 mx-auto mb-4"
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
                <p>{`${getLocalizedName(location, locale)} ${t.eventSnap.shootingImage}`}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {getLocalizedDescription(location, locale) && (
          <div className="bg-muted rounded-xl p-8 border border-border mb-8">
            <h2 className="font-bold mb-4">{t.eventSnap.locationIntro}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {getLocalizedDescription(location, locale)}
            </p>
          </div>
        )}

        {/* Gallery */}
        {location.images.length > 0 && (
          <GalleryWithLightbox
            images={location.images.map((img) => ({
              id: img.id,
              secureUrl: img.secureUrl,
              alt: img.alt,
              width: img.width,
              height: img.height,
            }))}
            locationName={getLocalizedName(location, locale)}
            translations={{
              gallery: t.eventSnap.gallery,
              galleryAria: t.eventSnap.galleryAria,
              close: t.eventSnap.close,
              prev: t.eventSnap.prev,
              next: t.eventSnap.next,
            }}
          />
        )}

        {/* Empty Gallery State */}
        {location.images.length === 0 && (
          <div className="mb-12">
            <h2 className="font-bold mb-6">{t.eventSnap.gallery}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center"
                >
                  <svg
                    className="h-10 w-10 text-muted-foreground"
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
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
