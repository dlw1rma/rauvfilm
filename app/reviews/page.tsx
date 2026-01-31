import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ReviewImage from "@/components/reviews/ReviewImage";

export const metadata: Metadata = {
  title: "고객 후기 | 라우브필름",
  description: "라우브필름 고객님들의 생생한 후기입니다. 실제 촬영 후기와 리뷰를 확인하세요.",
  openGraph: {
    title: "고객 후기 | 라우브필름",
    description: "라우브필름 고객님들의 생생한 후기입니다.",
  },
};

export const revalidate = 600; // 10분마다 재생성

function platformToSourceType(platform: string): string {
  switch (platform) {
    case "NAVER_BLOG": return "naver_blog";
    case "NAVER_CAFE": return "naver_cafe";
    case "INSTAGRAM": return "instagram";
    default: return "other";
  }
}

async function getReviews() {
  try {
    // 1. 관리자 등록 후기 + 2. 고객 제출 승인 후기 (병렬 조회)
    const [adminReviews, approvedSubmissions] = await Promise.all([
      prisma.review.findMany({
        where: { isVisible: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.reviewSubmission.findMany({
        where: { status: { in: ["APPROVED", "AUTO_APPROVED"] } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const customerReviews = approvedSubmissions.map((submission) => ({
      id: submission.id + 100000,
      title: submission.title || "라우브필름 촬영 후기",
      excerpt: submission.excerpt || null,
      sourceUrl: submission.reviewUrl,
      sourceType: platformToSourceType(submission.platform),
      author: submission.author || null,
      imageUrl: submission.imageUrl || null,
      createdAt: submission.createdAt,
    }));

    const adminMapped = adminReviews.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.excerpt,
      sourceUrl: r.sourceUrl,
      sourceType: r.sourceType,
      author: r.author,
      imageUrl: r.imageUrl,
      createdAt: r.createdAt,
    }));

    return [...adminMapped, ...customerReviews];
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
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mobile-br-hidden">
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
                  <ReviewImage src={review.imageUrl} alt={review.title} />
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
      </div>
    </div>
  );
}
