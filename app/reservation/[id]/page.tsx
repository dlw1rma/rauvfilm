"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Reservation {
  id: number;
  title: string;
  content: string;
  author: string;
  phone: string | null;
  email: string | null;
  weddingDate: string | null;
  location: string | null;
  isPrivate: boolean;
  isLocked?: boolean;
  createdAt: string;
  reply: {
    content: string;
    createdAt: string;
  } | null;
}

// 작성자 이름 마스킹 함수 (첫 글자와 두 번째 글자만 보이고 나머지는 *)
const maskAuthorName = (name: string): string => {
  if (!name || name.length === 0) return "";
  if (name.length === 1) return name + "*";
  if (name.length === 2) return name[0] + name[1] + "*";
  return name[0] + name[1] + "*".repeat(name.length - 2);
};

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [action, setAction] = useState<"edit" | "delete" | "view" | null>(null);
  const [actionError, setActionError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await fetch(`/api/reservations/${params.id}`);
        if (!res.ok) {
          throw new Error("예약 정보를 불러올 수 없습니다.");
        }
        const data = await res.json();
        setReservation(data);

        // 비밀글이면 잠금 상태로 시작
        if (data.isPrivate && data.isLocked) {
          setIsUnlocked(false);
        } else {
          setIsUnlocked(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchReservation();
  }, [params.id]);

  const handleAction = (actionType: "edit" | "delete" | "view") => {
    setAction(actionType);
    setShowPasswordModal(true);
    setActionError("");
    setPassword("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");

    try {
      // 비밀번호 확인
      const verifyRes = await fetch(`/api/reservations/${params.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || "비밀번호가 일치하지 않습니다.");
      }

      if (action === "view") {
        // 비밀글 열람 - 전체 내용 다시 가져오기
        const res = await fetch(`/api/reservations/${params.id}?password=${encodeURIComponent(password)}`);
        if (res.ok) {
          const data = await res.json();
          setReservation(data);
          setIsUnlocked(true);
        }
        setShowPasswordModal(false);
        setPassword("");
      } else if (action === "delete") {
        const deleteRes = await fetch(`/api/reservations/${params.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (!deleteRes.ok) {
          throw new Error("삭제에 실패했습니다.");
        }

        router.push("/reservation");
        router.refresh();
      } else if (action === "edit") {
        // 수정 페이지로 이동 (비밀번호를 token으로 전달)
        router.push(`/reservation/${params.id}/edit?token=${encodeURIComponent(password)}`);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">오류</h1>
          <p className="text-muted-foreground mb-6">{error || "예약 정보를 찾을 수 없습니다."}</p>
          <Link
            href="/reservation"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-white"
          >
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  // 비밀글이고 잠금 상태인 경우
  if (reservation.isPrivate && !isUnlocked) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/reservation"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
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
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              목록으로
            </Link>
          </div>

          {/* Locked Post */}
          <div className="rounded-xl border border-border bg-muted p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-muted-foreground mb-6"
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
            <h1 className="text-2xl font-bold mb-2">비밀글입니다</h1>
            <p className="text-muted-foreground mb-6">
              이 글은 작성자와 관리자만 열람할 수 있습니다.
              <br />
              비밀번호를 입력하여 내용을 확인하세요.
              <br />
              <span className="text-sm font-medium text-accent">비밀번호는 예약자 전화번호입니다.</span>
            </p>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                작성자: {maskAuthorName(reservation.author)}
              </p>
            </div>
            <button
              onClick={() => handleAction("view")}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              비밀번호 입력
            </button>
          </div>

          {/* Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-xl bg-muted p-6">
              <h3 className="mb-4 text-lg font-bold">비밀번호 확인</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                비밀번호는 예약자 전화번호입니다.
              </p>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    // 숫자만 입력 가능하고 최대 11자리로 제한
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                    setPassword(value);
                  }}
                  placeholder="예약자 전화번호를 입력하세요 (숫자만, 최대 11자리)"
                  className="mb-2 w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                  maxLength={11}
                />
                  {actionError && (
                    <p className="mb-4 text-sm text-accent">{actionError}</p>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPassword("");
                        setAction(null);
                        setActionError("");
                      }}
                      className="flex-1 rounded-lg border border-border py-2 transition-colors hover:bg-background"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-accent py-2 text-white transition-colors hover:bg-accent-hover"
                    >
                      확인
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
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
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            목록으로
          </Link>
        </div>

        {/* Post */}
        <article className="rounded-xl border border-border bg-muted overflow-hidden">
          {/* Post Header */}
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              {reservation.isPrivate && (
                <span className="inline-flex items-center gap-1 rounded bg-muted-foreground/10 px-2 py-1 text-xs text-muted-foreground">
                  <svg
                    className="h-3 w-3"
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
                  비밀글
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-4">{reservation.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>작성자: {maskAuthorName(reservation.author)}</span>
              <span>|</span>
              <span>작성일: {reservation.createdAt.split("T")[0]}</span>
            </div>
          </div>

          {/* Post Info */}
          <div className="border-b border-border p-6 bg-background/50">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">연락처:</span>
                <span>{reservation.phone || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">이메일:</span>
                <span>{reservation.email || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">예식일:</span>
                <span>{reservation.weddingDate?.split("T")[0] || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">예식장소:</span>
                <span>{reservation.location || "-"}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <div className="whitespace-pre-wrap text-muted-foreground">
              {reservation.content}
            </div>
          </div>

              {/* Actions */}
              <div className="border-t border-border p-4 flex justify-end gap-2">
                <button
                  onClick={() => handleAction("edit")}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-background transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleAction("delete")}
                  className="px-4 py-2 text-sm text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  삭제
                </button>
              </div>
        </article>

        {/* Reply */}
        {reservation.reply && (
          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 overflow-hidden">
            <div className="border-b border-accent/20 px-6 py-4 flex items-center gap-2">
              <span className="rounded bg-accent px-2 py-1 text-xs font-medium text-white">
                답변
              </span>
              <span className="text-sm text-muted-foreground">
                라우브필름 | {reservation.reply.createdAt.split("T")[0]}
              </span>
            </div>
            <div className="p-6">
              <div className="whitespace-pre-wrap text-muted-foreground">
                {reservation.reply.content}
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-muted p-6">
              <h3 className="mb-4 text-lg font-bold">비밀번호 확인</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                비밀번호는 예약자 전화번호입니다.
              </p>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    // 숫자만 입력 가능하고 최대 11자리로 제한
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                    setPassword(value);
                  }}
                  placeholder="예약자 전화번호를 입력하세요 (숫자만, 최대 11자리)"
                  className="mb-2 w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                  maxLength={11}
                />
                {actionError && (
                  <p className="mb-4 text-sm text-accent">{actionError}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPassword("");
                      setAction(null);
                      setActionError("");
                    }}
                    className="flex-1 rounded-lg border border-border py-2 transition-colors hover:bg-background"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-accent py-2 text-white transition-colors hover:bg-accent-hover"
                  >
                    확인
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
