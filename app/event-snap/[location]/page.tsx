import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ location: string }>;
}

async function getLocation(slug: string) {
  try {
    const location = await prisma.eventSnapLocation.findUnique({
      where: { slug, isVisible: true },
      include: {
        images: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
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
  const { location: slug } = await params;
  const location = await getLocation(slug);

  if (!location) {
    return {
      title: "페이지를 찾을 수 없습니다 | 라우브필름",
    };
  }

  return {
    title: `${location.name} | EVENT SNAP | 라우브필름`,
    description: location.description || `${location.name}에서의 특별한 순간을 담아드립니다.`,
    openGraph: {
      title: `${location.name} | EVENT SNAP | 라우브필름`,
      description: location.description || `${location.name}에서의 특별한 순간을 담아드립니다.`,
      images: location.images[0] ? [{ url: location.images[0].secureUrl }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ location: slug }));
}

export default async function EventSnapLocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const location = await getLocation(slug);

  if (!location) {
    notFound();
  }

  const featuredImage = location.images.find(img => img.isFeatured) || location.images[0];
  const galleryImages = location.images.filter(img => img !== featuredImage);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/event-snap"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          EVENT SNAP 목록으로
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold">{location.name}</h1>
          <p className="text-lg text-muted-foreground tracking-wider">
            {location.nameEn}
          </p>
        </div>

        {/* Main Image */}
        <div className="relative aspect-video bg-muted rounded-xl mb-8 overflow-hidden">
          {featuredImage ? (
            <Image
              src={featuredImage.secureUrl}
              alt={featuredImage.alt || location.name}
              fill
              className="object-cover"
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
                <p>{location.name} 촬영 이미지</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {location.description && (
          <div className="bg-muted rounded-xl p-8 border border-border mb-8">
            <h2 className="font-bold mb-4">장소 소개</h2>
            <p className="text-muted-foreground leading-relaxed">
              {location.description}
            </p>
          </div>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="mb-12">
            <h2 className="font-bold mb-6">갤러리</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
                >
                  <Image
                    src={image.secureUrl}
                    alt={image.alt || `${location.name} 갤러리`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty Gallery State */}
        {location.images.length === 0 && (
          <div className="mb-12">
            <h2 className="font-bold mb-6">갤러리</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center"
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

        {/* CTA */}
        <div className="text-center">
          <p className="mb-6 text-muted-foreground">
            {location.name}에서 특별한 순간을 담아보세요
          </p>
          <a
            href="/reservation"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1"
          >
            예약 문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
