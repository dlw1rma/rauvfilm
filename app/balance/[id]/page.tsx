"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface BalanceData {
  reservation: {
    id: number;
    title: string;
    author: string;
    referralCode: string | null;
    referredCount: number;
    reviewLink: string | null;
    totalAmount: number | null;
    discountAmount: number;
  };
  balance: {
    totalAmount: number;
    totalDiscount: number;
    reviewDiscount: number;
    remainingBalance: number;
  };
}

export default function BalancePage() {
  const params = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleCheckBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/reservations/${params.id}/balance?password=${encodeURIComponent(password)}`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "잔금 정보를 불러올 수 없습니다.");
      }

      const data = await res.json();
      setBalanceData(data);
      setReviewLink(data.reservation.reviewLink || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setError("");

    try {
      const res = await fetch(`/api/reservations/${params.id}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewLink,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "후기 링크 업데이트에 실패했습니다.");
      }

      const data = await res.json();
      setBalanceData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          reservation: {
            ...prev.reservation,
            reviewLink: data.reservation.reviewLink,
          },
          balance: data.balance,
        };
      });
      alert("후기 링크가 등록되었습니다. 할인이 적용되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const copyReferralCode = () => {
    if (balanceData?.reservation.referralCode) {
      navigator.clipboard.writeText(balanceData.reservation.referralCode);
      alert("짝꿍 코드가 복사되었습니다!");
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

        <h1 className="text-3xl font-bold mb-8">잔금 확인</h1>

        {!balanceData ? (
          /* 비밀번호 입력 폼 */
          <div className="rounded-xl border border-border bg-muted p-8">
            <form onSubmit={handleCheckBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  비밀번호 <span className="text-accent">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  비밀번호는 예약자 전화번호입니다.
                </p>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="예약자 전화번호를 입력하세요"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              {error && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <p className="text-sm text-accent">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? "확인 중..." : "잔금 확인하기"}
              </button>
            </form>
          </div>
        ) : (
          /* 잔금 정보 표시 */
          <div className="space-y-6">
            {/* 나의 짝꿍 코드 */}
            {balanceData.reservation.referralCode && (
              <div className="rounded-xl border border-border bg-muted p-6">
                <h2 className="text-lg font-bold mb-4">나의 짝꿍 코드</h2>
                <div className="flex items-center gap-3">
                  <code className="flex-1 rounded-lg bg-background px-4 py-3 text-lg font-mono font-bold">
                    {balanceData.reservation.referralCode}
                  </code>
                  <button
                    onClick={copyReferralCode}
                    className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-all hover:bg-accent-hover"
                  >
                    복사하기
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  이 코드를 지인에게 공유하시면 추천인과 신규 예약자 모두 할인을 받으실 수 있습니다.
                </p>
              </div>
            )}

            {/* 할인 현황 */}
            <div className="rounded-xl border border-border bg-muted p-6">
              <h2 className="text-lg font-bold mb-4">할인 현황</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-background p-4">
                  <p className="text-sm text-muted-foreground mb-1">짝꿍 추천</p>
                  <p className="text-2xl font-bold">
                    {balanceData.reservation.referredCount}명
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    내 코드를 사용한 인원
                  </p>
                </div>
                <div className="rounded-lg bg-background p-4">
                  <p className="text-sm text-muted-foreground mb-1">후기 작성</p>
                  <p className="text-2xl font-bold">
                    {balanceData.reservation.reviewLink ? "완료" : "미완료"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {balanceData.reservation.reviewLink
                      ? "후기 할인 적용됨"
                      : "후기 작성 시 추가 할인"}
                  </p>
                </div>
              </div>
            </div>

            {/* 금액 요약 */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
              <h2 className="text-lg font-bold mb-6">금액 요약</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">전체 계약 금액</span>
                  <span className="text-xl font-bold">
                    {balanceData.balance.totalAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">총 할인 금액</span>
                  <span className="text-xl font-bold text-accent">
                    -{balanceData.balance.totalDiscount.toLocaleString()}원
                  </span>
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">남은 입금 잔액</span>
                    <span className="text-3xl font-bold text-accent">
                      {balanceData.balance.remainingBalance.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 후기 입력창 */}
            {!balanceData.reservation.reviewLink && (
              <div className="rounded-xl border border-border bg-muted p-6">
                <h2 className="text-lg font-bold mb-4">후기 작성</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  후기 링크를 등록하시면 추가로 2만원 할인을 받으실 수 있습니다.
                </p>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      후기 링크 URL
                    </label>
                    <input
                      type="url"
                      value={reviewLink}
                      onChange={(e) => setReviewLink(e.target.value)}
                      placeholder="https://blog.naver.com/..."
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  {error && (
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                      <p className="text-sm text-accent">{error}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50"
                  >
                    {submittingReview ? "등록 중..." : "후기 링크 등록하기"}
                  </button>
                </form>
              </div>
            )}

            {/* 후기 링크가 이미 있는 경우 */}
            {balanceData.reservation.reviewLink && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6">
                <h2 className="text-lg font-bold mb-2 text-green-500">후기 작성 완료</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  후기 할인이 적용되었습니다.
                </p>
                <a
                  href={balanceData.reservation.reviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline break-all"
                >
                  {balanceData.reservation.reviewLink}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
