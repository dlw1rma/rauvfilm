import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "고객 후기 | 라우브필름",
  description: "라우브필름 고객님들의 생생한 후기입니다. 실제 촬영 후기와 리뷰를 확인하세요.",
  openGraph: {
    title: "고객 후기 | 라우브필름",
    description: "라우브필름 고객님들의 생생한 후기입니다.",
  },
};

// 임시 리뷰 데이터 (나중에 DB에서 가져올 예정)
const reviews = [
  {
    id: 1,
    title: "정말 감동적인 영상이었어요!",
    excerpt: "우리 결혼식을 이렇게 아름답게 담아주셔서 정말 감사해요. 볼 때마다 눈물이 나요...",
    imageUrl: "/reviews/review-1.jpg",
    sourceUrl: "https://blog.naver.com/example1",
    sourceType: "naver_blog",
    author: "신부 김**",
    date: "2024.12",
  },
  {
    id: 2,
    title: "친구들이 다 물어봐요",
    excerpt: "영상 받고 나서 친구들한테 보여줬더니 다들 어디서 찍었냐고 물어봐요. 너무 만족합니다!",
    imageUrl: "/reviews/review-2.jpg",
    sourceUrl: "https://blog.naver.com/example2",
    sourceType: "naver_blog",
    author: "신랑 이**",
    date: "2024.11",
  },
  {
    id: 3,
    title: "평생 간직할 보물이에요",
    excerpt: "시네마틱 영상으로 받았는데, 정말 영화 같아요. 부모님도 너무 좋아하세요.",
    imageUrl: "/reviews/review-3.jpg",
    sourceUrl: "https://cafe.naver.com/example3",
    sourceType: "naver_cafe",
    author: "신부 박**",
    date: "2024.10",
  },
  {
    id: 4,
    title: "촬영 당일 케어가 최고였어요",
    excerpt: "바쁜 예식 중에도 전혀 부담 없이 촬영해주셨어요. 자연스러운 순간들이 잘 담겼어요.",
    imageUrl: "/reviews/review-4.jpg",
    sourceUrl: "https://blog.naver.com/example4",
    sourceType: "naver_blog",
    author: "신부 최**",
    date: "2024.09",
  },
  {
    id: 5,
    title: "가성비 최고",
    excerpt: "이 가격에 이 퀄리티는 정말 대만족입니다. 주변에 결혼 예정인 친구들에게 추천하고 있어요.",
    imageUrl: "/reviews/review-5.jpg",
    sourceUrl: "https://blog.naver.com/example5",
    sourceType: "naver_blog",
    author: "신랑 정**",
    date: "2024.08",
  },
  {
    id: 6,
    title: "소통이 정말 잘 되었어요",
    excerpt: "촬영 전 상담부터 영상 수정까지 모든 과정에서 친절하게 응대해주셨어요.",
    imageUrl: "/reviews/review-6.jpg",
    sourceUrl: "https://cafe.naver.com/example6",
    sourceType: "naver_cafe",
    author: "신부 강**",
    date: "2024.07",
  },
];

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

export default function ReviewsPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">고객 후기</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            라우브필름과 함께한 신랑신부님들의.
            <br />
            소중한 후기를 확인해보세요.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <a
              key={review.id}
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border bg-muted overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
            >
              {/* Image Placeholder */}
              <div className="relative aspect-[4/3] bg-background">
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
                    {review.date}
                  </span>
                </div>
                <h3 className="mb-2 font-medium group-hover:text-accent transition-colors">
                  {review.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {review.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  - {review.author}
                </p>
              </div>
            </a>
          ))}
        </div>

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
