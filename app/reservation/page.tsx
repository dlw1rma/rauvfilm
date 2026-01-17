import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "예약 문의 | 라우브필름",
  description: "라우브필름 웨딩 영상 촬영 예약 게시판입니다.",
  openGraph: {
    title: "예약 문의 | 라우브필름",
    description: "라우브필름 웨딩 영상 촬영 예약 게시판입니다.",
  },
};

// 임시 예약 데이터 (나중에 DB에서 가져올 예정)
const reservations = [
  {
    id: 1,
    title: "25년 3월 예식 문의드립니다",
    author: "김**",
    createdAt: "2025-01-15",
    isPrivate: true,
    hasReply: true,
  },
  {
    id: 2,
    title: "시네마틱 촬영 가능 여부 문의",
    author: "이**",
    createdAt: "2025-01-14",
    isPrivate: false,
    hasReply: true,
  },
  {
    id: 3,
    title: "드론 촬영 추가 문의",
    author: "박**",
    createdAt: "2025-01-13",
    isPrivate: true,
    hasReply: false,
  },
  {
    id: 4,
    title: "야외 촬영 관련 질문이요",
    author: "최**",
    createdAt: "2025-01-12",
    isPrivate: false,
    hasReply: true,
  },
  {
    id: 5,
    title: "4월 예식 예약 가능한가요?",
    author: "정**",
    createdAt: "2025-01-10",
    isPrivate: true,
    hasReply: true,
  },
];

export default function ReservationPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">예약 문의</h1>
            <p className="mt-2 text-muted-foreground">
              촬영 예약 및 문의사항을 남겨주세요.
            </p>
          </div>
          <Link
            href="/reservation/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-white transition-all hover:bg-accent-hover"
          >
            글쓰기
          </Link>
        </div>

        {/* Notice */}
        <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-accent">안내</span> | 비밀글은
            작성자와 관리자만 확인할 수 있습니다. 개인정보가 포함된 내용은
            비밀글로 작성해주세요.
          </p>
        </div>

        {/* Reservation List */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 bg-muted px-6 py-3 text-sm font-medium text-muted-foreground">
            <div className="col-span-1 text-center">번호</div>
            <div className="col-span-6">제목</div>
            <div className="col-span-2 text-center">작성자</div>
            <div className="col-span-2 text-center">작성일</div>
            <div className="col-span-1 text-center">상태</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {reservations.map((post, index) => (
              <Link
                key={post.id}
                href={`/reservation/${post.id}`}
                className="block px-6 py-4 transition-colors hover:bg-muted/50"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden">
                  <div className="flex items-center gap-2 mb-2">
                    {post.isPrivate && (
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    )}
                    <span className="font-medium">{post.title}</span>
                    {post.hasReply && (
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        답변완료
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>|</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid sm:grid-cols-12 sm:items-center">
                  <div className="col-span-1 text-center text-sm text-muted-foreground">
                    {reservations.length - index}
                  </div>
                  <div className="col-span-6 flex items-center gap-2">
                    {post.isPrivate && (
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    )}
                    <span className="font-medium hover:text-accent transition-colors">
                      {post.title}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-muted-foreground">
                    {post.author}
                  </div>
                  <div className="col-span-2 text-center text-sm text-muted-foreground">
                    {post.createdAt}
                  </div>
                  <div className="col-span-1 text-center">
                    {post.hasReply ? (
                      <span className="rounded bg-accent/10 px-2 py-1 text-xs text-accent">
                        답변완료
                      </span>
                    ) : (
                      <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                        대기중
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              &lt;
            </button>
            <button className="h-10 w-10 rounded-lg bg-accent text-white">
              1
            </button>
            <button className="h-10 w-10 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              2
            </button>
            <button className="h-10 w-10 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              3
            </button>
            <button className="h-10 w-10 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
