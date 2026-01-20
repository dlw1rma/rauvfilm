import type { Metadata } from "next";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "예약 문의",
  description: "라우브필름 웨딩 영상 촬영 예약 게시판입니다.",
};

export const dynamic = "force-dynamic";

async function getReservations() {
  try {
    const prisma = getPrisma();
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        author: true,
        isPrivate: true,
        createdAt: true,
        reply: {
          select: { id: true },
        },
      },
    });

    return reservations.map((r) => ({
      id: r.id,
      title: r.title,
      author: r.author,
      isPrivate: r.isPrivate,
      createdAt: r.createdAt.toISOString().split("T")[0],
      hasReply: !!r.reply,
    }));
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
}

export default async function ReservationPage() {
  const reservations = await getReservations();

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
            {reservations.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                등록된 예약 문의가 없습니다.
              </div>
            ) : (
              reservations.map((post, index) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
