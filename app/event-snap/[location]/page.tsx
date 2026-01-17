import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const locations: Record<string, { name: string; nameEn: string; description: string }> = {
  djbg: {
    name: "동작대교",
    nameEn: "Dongjak Bridge",
    description: "한강과 서울의 야경이 어우러지는 로맨틱한 장소입니다. 저녁 시간대에 촬영하면 아름다운 야경과 함께 특별한 영상을 담을 수 있습니다.",
  },
  chg: {
    name: "창경궁",
    nameEn: "Changgyeonggung",
    description: "조선 시대의 아름다운 고궁에서 클래식하고 우아한 분위기의 영상을 촬영할 수 있습니다. 한복 촬영에도 추천드립니다.",
  },
  nepark: {
    name: "노을공원",
    nameEn: "Noeul Park",
    description: "하늘공원과 함께 서울에서 가장 아름다운 석양을 볼 수 있는 장소입니다. 골든아워 촬영에 최적의 장소입니다.",
  },
  olpark: {
    name: "올림픽공원",
    nameEn: "Olympic Park",
    description: "넓은 잔디밭과 현대적인 조형물, 아름다운 자연이 어우러진 공간입니다. 계절마다 다른 분위기를 연출할 수 있습니다.",
  },
};

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location } = await params;
  const locationData = locations[location];

  if (!locationData) {
    return {
      title: "페이지를 찾을 수 없습니다 | 라우브필름",
    };
  }

  return {
    title: `${locationData.name} | EVENT SNAP | 라우브필름`,
    description: locationData.description,
    openGraph: {
      title: `${locationData.name} | EVENT SNAP | 라우브필름`,
      description: locationData.description,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(locations).map((location) => ({
    location,
  }));
}

export default async function EventSnapLocationPage({ params }: PageProps) {
  const { location } = await params;
  const locationData = locations[location];

  if (!locationData) {
    notFound();
  }

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
          <h1 className="mb-2 text-4xl font-bold">{locationData.name}</h1>
          <p className="text-lg text-muted-foreground tracking-wider">
            {locationData.nameEn}
          </p>
        </div>

        {/* Main Image Placeholder */}
        <div className="relative aspect-video bg-muted rounded-xl mb-8 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
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
            <p>{locationData.name} 촬영 이미지</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-muted rounded-xl p-8 border border-border mb-8">
          <h2 className="font-bold mb-4">장소 소개</h2>
          <p className="text-muted-foreground leading-relaxed">
            {locationData.description}
          </p>
        </div>

        {/* Gallery Placeholder */}
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

        {/* CTA */}
        <div className="text-center">
          <p className="mb-6 text-muted-foreground">
            {locationData.name}에서 특별한 순간을 담아보세요
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
