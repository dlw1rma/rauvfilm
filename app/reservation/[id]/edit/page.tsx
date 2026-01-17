"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
}

export default function EditReservationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordFromQuery = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    phone: "",
    email: "",
    weddingDate: "",
    location: "",
    isPrivate: false,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await fetch(`/api/reservations/${params.id}`);
        if (!res.ok) {
          throw new Error("예약 정보를 불러올 수 없습니다.");
        }
        const data: Reservation = await res.json();
        setFormData({
          title: data.title,
          content: data.content,
          phone: data.phone || "",
          email: data.email || "",
          weddingDate: data.weddingDate?.split("T")[0] || "",
          location: data.location || "",
          isPrivate: data.isPrivate,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchReservation();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reservations/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password: passwordFromQuery,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "수정에 실패했습니다.");
      }

      router.push(`/reservation/${params.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/reservation/${params.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
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
            돌아가기
          </Link>
          <h1 className="text-3xl font-bold">예약 문의 수정</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="text-sm text-accent">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium">
              제목 <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="문의 제목을 입력해주세요"
            />
          </div>

          {/* Contact Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                연락처
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="010-1234-5678"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* Wedding Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="weddingDate" className="mb-2 block text-sm font-medium">
                예식일
              </label>
              <input
                type="date"
                id="weddingDate"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium">
                예식 장소
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="예식장 이름"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium">
              문의 내용 <span className="text-accent">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={8}
              value={formData.content}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              placeholder="문의하실 내용을 자유롭게 작성해주세요."
            />
          </div>

          {/* Private Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
            />
            <label htmlFor="isPrivate" className="text-sm">
              비밀글로 작성 (작성자와 관리자만 열람 가능)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Link
              href={`/reservation/${params.id}`}
              className="flex-1 rounded-lg border border-border py-3 text-center font-medium transition-colors hover:bg-muted"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
