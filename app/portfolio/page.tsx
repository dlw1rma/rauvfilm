import type { Metadata } from "next";
import type { Portfolio } from "@prisma/client";
import YouTubeFacade from "@/components/video/YouTubeFacade";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "포트폴리오 | 라우브필름",
  description: "라우브필름의 웨딩 영상 포트폴리오입니다. 가성비형, 기본형, 시네마틱형 등 다양한 작품을 확인하세요.",
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
  try {
    const prisma = getPrisma();
    const portfolios = await prisma.portfolio.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return portfolios.map((p: Portfolio) => ({
      id: p.id,
      title: p.title,
      videoId: extractVideoId(p.youtubeUrl),
      category: p.category,
    }));
  } catch (error) {
    // Cloudtype에서 DATABASE_URL 미주입 시에도 렌더가 프로세스 크래시로 이어지지 않게 방어
    console.error("Error fetching portfolios:", error);
    return [];
  }
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

      </div>
    </div>
  );
}
