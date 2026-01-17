import type { Metadata } from "next";
import YouTubeFacade from "@/components/video/YouTubeFacade";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "포트폴리오 | 라우브필름",
  description: "라우브필름의 웨딩 영상 포트폴리오입니다. 본식DVD, 시네마틱 영상 등 다양한 작품을 확인하세요.",
  openGraph: {
    title: "포트폴리오 | 라우브필름",
    description: "라우브필름의 웨딩 영상 포트폴리오입니다.",
  },
};

export const dynamic = "force-dynamic";

function extractVideoId(url: string): string {
  // YouTube URL에서 video ID 추출
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return url; // 추출 실패시 원본 반환
}

async function getPortfolios() {
  const portfolios = await prisma.portfolio.findMany({
    where: { isVisible: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return portfolios.map((p) => ({
    id: p.id,
    title: p.title,
    videoId: extractVideoId(p.youtubeUrl),
    category: p.category,
  }));
}

export default async function PortfolioPage() {
  const portfolioItems = await getPortfolios();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">포트폴리오</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            라우브필름이 제작한 웨딩 영상들을 감상해보세요.
            <br />
            각 영상을 클릭하면 재생됩니다.
          </p>
        </div>

        {/* Video Grid */}
        {portfolioItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">등록된 포트폴리오가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-border bg-muted p-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
              >
                <YouTubeFacade videoId={item.videoId} title={item.title} />
                <div className="mt-3 px-1">
                  <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {item.category}
                  </span>
                  <h3 className="mt-2 font-medium">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-muted-foreground">
            마음에 드는 스타일이 있으신가요?
          </p>
          <a
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1"
          >
            촬영 문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
