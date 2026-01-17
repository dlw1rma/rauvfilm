"use client";

import { useState } from "react";
import Link from "next/link";

// 임시 데이터
const mockReservations = [
  {
    id: 1,
    title: "25년 3월 예식 문의드립니다",
    author: "김민수",
    phone: "010-1234-5678",
    weddingDate: "2025-03-15",
    location: "더채플앳청담",
    isPrivate: true,
    hasReply: true,
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    title: "시네마틱 촬영 가능 여부 문의",
    author: "이지은",
    phone: "010-2345-6789",
    weddingDate: "2025-04-20",
    location: "그랜드하얏트",
    isPrivate: false,
    hasReply: true,
    createdAt: "2025-01-14",
  },
  {
    id: 3,
    title: "드론 촬영 추가 문의",
    author: "박준혁",
    phone: "010-3456-7890",
    weddingDate: "2025-05-10",
    location: "아펠가모",
    isPrivate: true,
    hasReply: false,
    createdAt: "2025-01-13",
  },
];

export default function AdminReservationsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const selectedReservation = mockReservations.find((r) => r.id === selectedId);

  const handleReply = () => {
    alert("답변이 등록되었습니다. (DB 연동 후 실제 저장)");
    setReplyContent("");
    setSelectedId(null);
  };

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
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h2 className="font-medium">예약 목록</h2>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {mockReservations.map((reservation) => (
                <button
                  key={reservation.id}
                  onClick={() => setSelectedId(reservation.id)}
                  className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${
                    selectedId === reservation.id ? "bg-accent/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!reservation.hasReply && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                    <span className="font-medium text-sm">{reservation.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{reservation.author}</span>
                    <span>|</span>
                    <span>{reservation.createdAt}</span>
                    <span>|</span>
                    <span>{reservation.hasReply ? "답변완료" : "대기중"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h2 className="font-medium">상세 정보</h2>
            </div>
            {selectedReservation ? (
              <div className="p-4">
                <h3 className="font-bold text-lg mb-4">{selectedReservation.title}</h3>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">작성자</p>
                    <p className="font-medium">{selectedReservation.author}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">연락처</p>
                    <p className="font-medium">{selectedReservation.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">예식일</p>
                    <p className="font-medium">{selectedReservation.weddingDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">예식장</p>
                    <p className="font-medium">{selectedReservation.location}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground text-sm mb-2">문의 내용</p>
                  <div className="rounded-lg bg-background p-4 text-sm">
                    문의 내용이 여기에 표시됩니다. (DB 연동 후 실제 데이터)
                  </div>
                </div>

                {!selectedReservation.hasReply && (
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
                      className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover"
                    >
                      답변 등록
                    </button>
                  </div>
                )}

                {selectedReservation.hasReply && (
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                    <p className="text-sm font-medium text-accent mb-2">답변 완료</p>
                    <p className="text-sm text-muted-foreground">
                      이미 답변이 등록된 문의입니다.
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
