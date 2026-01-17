"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

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
  createdAt: string;
  reply: {
    id: number;
    content: string;
    createdAt: string;
  } | null;
}

export default function AdminReservationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated]);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedReservation = reservations.find((r) => r.id === selectedId);

  const handleReply = async () => {
    if (!selectedId || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reservations/${selectedId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        await fetchReservations();
        setReplyContent("");
        alert("답변이 등록되었습니다.");
      } else {
        const data = await res.json();
        alert(data.error || "답변 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Reply error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminDelete: true }),
      });

      if (res.ok) {
        await fetchReservations();
        setSelectedId(null);
        alert("삭제되었습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold">예약 관리</h1>
          <p className="mt-1 text-muted-foreground">
            고객 예약 문의를 확인하고 답변합니다.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* List */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-medium">예약 목록</h2>
              <span className="text-sm text-muted-foreground">
                {reservations.filter((r) => !r.reply).length}건 대기중
              </span>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {reservations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  등록된 예약 문의가 없습니다.
                </div>
              ) : (
                reservations.map((reservation) => (
                  <button
                    key={reservation.id}
                    onClick={() => setSelectedId(reservation.id)}
                    className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${
                      selectedId === reservation.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!reservation.reply && (
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      )}
                      <span className="font-medium text-sm">{reservation.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{reservation.author}</span>
                      <span>|</span>
                      <span>{reservation.createdAt.split("T")[0]}</span>
                      <span>|</span>
                      <span>{reservation.reply ? "답변완료" : "대기중"}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h2 className="font-medium">상세 정보</h2>
            </div>
            {selectedReservation ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{selectedReservation.title}</h3>
                  <button
                    onClick={() => handleDelete(selectedReservation.id)}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">작성자</p>
                    <p className="font-medium">{selectedReservation.author}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">연락처</p>
                    <p className="font-medium">{selectedReservation.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">예식일</p>
                    <p className="font-medium">
                      {selectedReservation.weddingDate?.split("T")[0] || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">예식장</p>
                    <p className="font-medium">{selectedReservation.location || "-"}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground text-sm mb-2">문의 내용</p>
                  <div className="rounded-lg bg-background p-4 text-sm whitespace-pre-wrap">
                    {selectedReservation.content}
                  </div>
                </div>

                {!selectedReservation.reply ? (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">답변 작성</p>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="답변을 입력하세요..."
                    />
                    <button
                      onClick={handleReply}
                      disabled={submitting || !replyContent.trim()}
                      className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50"
                    >
                      {submitting ? "등록 중..." : "답변 등록"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                    <p className="text-sm font-medium text-accent mb-2">답변 완료</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedReservation.reply.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedReservation.reply.createdAt.split("T")[0]}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                목록에서 예약을 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
