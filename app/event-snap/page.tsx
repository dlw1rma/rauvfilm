import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "EVENT SNAP | 라우브필름",
  description: "라우브필름의 야외 스냅 촬영 장소를 소개합니다. 동작대교, 창경궁, 노을공원, 올림픽공원에서 특별한 순간을 담아보세요.",
  openGraph: {
    title: "EVENT SNAP | 라우브필름",
    description: "라우브필름의 야외 스냅 촬영 장소를 소개합니다.",
  },
};

async function getLocations() {
  try {
    const locations = await prisma.eventSnapLocation.findMany({
      where: { isVisible: true },
      include: {
        images: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          take: 1, // 대표 이미지 1장만
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

export default async function EventSnapPage() {
  const locations = await getLocations();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-widest">EVENT SNAP</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            특별한 장소에서 특별한 순간을 담아드립니다.
            <br />
            원하시는 장소를 선택해 주세요.
          </p>
        </div>

        {/* Location Grid */}
        {locations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/event-snap/${location.slug}`}
                className="group block rounded-xl border border-border bg-muted overflow-hidden transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-accent/10"
              >
                {/* Image */}
                <div className="relative aspect-video bg-background">
                  {location.images[0] ? (
                    <Image
                      src={location.images[0].secureUrl}
                      alt={location.images[0].alt || location.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
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
                    {location.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3 tracking-wider">
                    {location.nameEn}
                  </p>
                  {location.description && (
                    <p className="text-sm text-muted-foreground">
                      {location.description}
                    </p>
                  )}
                </div>
              </Link>
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
              등록된 촬영 장소가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
