import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "고객 후기 | 라우브필름",
  description: "라우브필름 고객님들의 생생한 후기입니다. 실제 촬영 후기와 리뷰를 확인하세요.",
  openGraph: {
    title: "고객 후기 | 라우브필름",
    description: "라우브필름 고객님들의 생생한 후기입니다.",
  },
};

export const dynamic = "force-dynamic";

async function getReviews() {
  try {
    const prisma = getPrisma();
    const reviews = await prisma.review.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return reviews.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.excerpt,
      sourceUrl: r.sourceUrl,
      sourceType: r.sourceType,
      author: r.author,
      imageUrl: r.imageUrl,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

function getSourceLabel(sourceType: string) {
  switch (sourceType) {
    case "naver_blog":
      return "네이버 블로그";
    case "naver_cafe":
      return "네이버 카페";
    case "instagram":
      return "인스타그램";
    default:
      return "리뷰";
  }
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">고객 후기</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            라우브필름과 함께한 신랑신부님들의
            <br />
            소중한 후기를 확인해보세요.
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">등록된 후기가 없습니다.</p>
          </div>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <a
              key={review.id}
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border bg-muted overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-background overflow-hidden">
                {review.imageUrl ? (
                  <img
                    src={review.imageUrl}
                    alt={review.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 플레이스홀더 표시
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement("div");
                        placeholder.className = "absolute inset-0 flex items-center justify-center text-muted-foreground";
                        placeholder.innerHTML = `
                          <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        `;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <svg
                      className="h-12 w-12"
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
                {/* External Link Icon */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-background/80 p-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {getSourceLabel(review.sourceType)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
                  </span>
                </div>
                <h3 className="mb-2 font-medium group-hover:text-accent transition-colors">
                  {review.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {review.excerpt || ""}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  - {review.author || "익명"}
                </p>
              </div>
            </a>
          ))}
        </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-muted-foreground">
            더 많은 후기가 궁금하시다면?
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://blog.naver.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-base font-medium transition-all hover:bg-muted"
            >
              네이버 블로그 보기
            </a>
            <a
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1"
            >
              촬영 문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
