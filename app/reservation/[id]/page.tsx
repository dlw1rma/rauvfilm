"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// 임시 데이터 (나중에 DB에서 가져올 예정)
const reservationData = {
  id: 1,
  title: "25년 3월 예식 문의드립니다",
  author: "김**",
  phone: "010-****-5678",
  email: "kim***@email.com",
  weddingDate: "2025-03-15",
  location: "더채플앳청담",
  content: `안녕하세요, 3월 15일 예식 예정인 예비 신랑입니다.

시네마틱 패키지로 문의드리고 싶은데요,
드론 촬영도 함께 가능할까요?

예식 시간은 오후 2시이고, 장소는 더채플앳청담입니다.
가능하시다면 견적과 함께 답변 부탁드립니다.

감사합니다.`,
  isPrivate: true,
  createdAt: "2025-01-15",
  reply: {
    content: `안녕하세요, 라우브필름입니다.

3월 15일 예식 문의 감사드립니다.
해당 일정 촬영 가능하며, 드론 촬영도 함께 진행 가능합니다.

시네마틱 패키지 + 드론 촬영 시 총 170만원입니다.
자세한 상담은 카카오톡 또는 전화로 연락 주시면 안내 도와드리겠습니다.

감사합니다.`,
    createdAt: "2025-01-15",
  },
};

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [action, setAction] = useState<"edit" | "delete" | null>(null);

  const handleAction = (actionType: "edit" | "delete") => {
    setAction(actionType);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 비밀번호 검증 API 호출
    if (action === "delete") {
      // TODO: 삭제 API 호출
      router.push("/reservation");
    } else if (action === "edit") {
      // TODO: 수정 페이지로 이동
      router.push(`/reservation/${params.id}/edit`);
    }
  };

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
              {reservationData.isPrivate && (
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
            <h1 className="text-2xl font-bold mb-4">{reservationData.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>작성자: {reservationData.author}</span>
              <span>|</span>
              <span>작성일: {reservationData.createdAt}</span>
            </div>
          </div>

          {/* Post Info */}
          <div className="border-b border-border p-6 bg-background/50">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">연락처:</span>
                <span>{reservationData.phone || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">이메일:</span>
                <span>{reservationData.email || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">예식일:</span>
                <span>{reservationData.weddingDate || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">예식장소:</span>
                <span>{reservationData.location || "-"}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <div className="whitespace-pre-wrap text-muted-foreground">
              {reservationData.content}
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
        {reservationData.reply && (
          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 overflow-hidden">
            <div className="border-b border-accent/20 px-6 py-4 flex items-center gap-2">
              <span className="rounded bg-accent px-2 py-1 text-xs font-medium text-white">
                답변
              </span>
              <span className="text-sm text-muted-foreground">
                라우브필름 | {reservationData.reply.createdAt}
              </span>
            </div>
            <div className="p-6">
              <div className="whitespace-pre-wrap text-muted-foreground">
                {reservationData.reply.content}
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-muted p-6">
              <h3 className="mb-4 text-lg font-bold">비밀번호 확인</h3>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="mb-4 w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPassword("");
                      setAction(null);
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
