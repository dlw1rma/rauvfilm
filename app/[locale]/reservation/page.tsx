import type { Metadata } from "next";
import Link from "next/link";
import LocaleLink from "@/components/ui/LocaleLink";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { formatDateTime } from "@/lib/formatDate";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.reservation.metaTitle,
    description: t.reservation.metaDescription,
  };
}

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

// 작성자 이름 마스킹 함수 (첫 글자만 보이고 나머지는 *)
const maskAuthorName = (name: string): string => {
  if (!name || name.length === 0) return "";
  if (name.length === 1) return name + "*";
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 1);
};

async function getReservations(page: number) {
  try {
    const [reservations, totalCount] = await Promise.all([
      prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          author: true,
          isPrivate: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.reservation.count(),
    ]);

    const items = reservations.map((r) => ({
      id: r.id,
      title: r.title,
      author: maskAuthorName(decrypt(r.author) || ""),
      isPrivate: r.isPrivate,
      status: r.status,
      createdAt: formatDateTime(r.createdAt),
    }));

    return { items, totalCount };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return { items: [], totalCount: 0 };
  }
}

export default async function ReservationPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10) || 1);
  const { items: reservations, totalCount } = await getReservations(currentPage);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 표시할 페이지 번호 계산 (최대 5개)
  const pages: number[] = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.reservation.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {t.reservation.subtitle}
            </p>
          </div>
          <LocaleLink
            href="/reservation/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-white transition-all hover:bg-accent-hover"
          >
            {t.reservation.writeNew}
          </LocaleLink>
        </div>

        {/* Notice */}
        <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-accent">{t.reservation.notice}</span> | {t.reservation.noticeText}
          </p>
        </div>

        {/* Reservation List */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 bg-muted px-6 py-3 text-sm font-medium text-muted-foreground">
            <div className="col-span-8">{t.reservation.colTitle}</div>
            <div className="col-span-2 text-center">{t.reservation.colAuthor}</div>
            <div className="col-span-2 text-center">{t.reservation.colStatus}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {reservations.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                {t.reservation.noReservations}
              </div>
            ) : (
              reservations.map((post) => (
                <LocaleLink
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
                      {post.status === 'PENDING' && (
                        <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600">
                          {t.reservation.statusPending}
                        </span>
                      )}
                      {post.status === 'CONFIRMED' && (
                        <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-600">
                          {t.reservation.statusConfirmed}
                        </span>
                      )}
                      {post.status === 'DEPOSIT_COMPLETED' && (
                        <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600">
                          {t.reservation.statusDepositCompleted}
                        </span>
                      )}
                      {post.status === 'DELIVERED' && (
                        <span className="rounded bg-purple-500/10 px-2 py-0.5 text-xs text-purple-600">
                          {t.reservation.statusDelivered}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.author}</span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid sm:grid-cols-12 sm:items-center">
                    <div className="col-span-8 flex items-center gap-2">
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
                    <div className="col-span-2 text-center">
                      {post.status === 'PENDING' && (
                        <span className="rounded bg-yellow-500/10 px-2 py-1 text-xs text-yellow-600">
                          {t.reservation.statusPending}
                        </span>
                      )}
                      {post.status === 'CONFIRMED' && (
                        <span className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-600">
                          {t.reservation.statusConfirmed}
                        </span>
                      )}
                      {post.status === 'DEPOSIT_COMPLETED' && (
                        <span className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-600">
                          {t.reservation.statusDepositCompleted}
                        </span>
                      )}
                      {post.status === 'DELIVERED' && (
                        <span className="rounded bg-purple-500/10 px-2 py-1 text-xs text-purple-600">
                          {t.reservation.statusDelivered}
                        </span>
                      )}
                      {post.status === 'CANCELLED' && (
                        <span className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-600">
                          {t.reservation.statusCancelled}
                        </span>
                      )}
                    </div>
                  </div>
                </LocaleLink>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <Link
              href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"}
              className={`px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors ${currentPage <= 1 ? "opacity-30 pointer-events-none" : ""}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>

            {start > 1 && (
              <>
                <Link
                  href="?page=1"
                  className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  1
                </Link>
                {start > 2 && <span className="px-1 text-muted-foreground">...</span>}
              </>
            )}

            {pages.map((p) => (
              <Link
                key={p}
                href={`?page=${p}`}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  p === currentPage
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-muted"
                }`}
              >
                {p}
              </Link>
            ))}

            {end < totalPages && (
              <>
                {end < totalPages - 1 && <span className="px-1 text-muted-foreground">...</span>}
                <Link
                  href={`?page=${totalPages}`}
                  className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  {totalPages}
                </Link>
              </>
            )}

            <Link
              href={currentPage < totalPages ? `?page=${currentPage + 1}` : "#"}
              className={`px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors ${currentPage >= totalPages ? "opacity-30 pointer-events-none" : ""}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
