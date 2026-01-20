"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Review {
  id: number;
  title: string;
  excerpt: string | null;
  sourceUrl: string;
  sourceType: string;
  author: string | null;
  imageUrl: string | null;
  isVisible: boolean;
  order: number;
}

export default function AdminReviewsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    sourceUrl: "",
    sourceType: "naver_blog",
    author: "",
    imageUrl: "",
  });
  const [fetchingThumbnail, setFetchingThumbnail] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReviews();
    }
  }, [isAuthenticated]);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews?admin=true");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        const res = await fetch(`/api/reviews/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchReviews();
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ title: "", excerpt: "", sourceUrl: "", sourceType: "naver_blog", author: "", imageUrl: "" });
        }
      } else {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchReviews();
          setIsModalOpen(false);
          setFormData({ title: "", excerpt: "", sourceUrl: "", sourceType: "naver_blog", author: "", imageUrl: "" });
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setFormData({
      title: review.title,
      excerpt: review.excerpt || "",
      sourceUrl: review.sourceUrl,
      sourceType: review.sourceType,
      author: review.author || "",
    });
    setEditingId(review.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const toggleVisibility = async (id: number, currentVisible: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisible }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, isVisible: !currentVisible } : r
          )
        );
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
    }
  };

  const getSourceLabel = (type: string) => {
    switch (type) {
      case "naver_blog": return "네이버 블로그";
      case "naver_cafe": return "네이버 카페";
      case "instagram": return "인스타그램";
      default: return type;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">후기 관리</h1>
              <p className="mt-1 text-muted-foreground">
                고객 후기를 관리합니다.
              </p>
            </div>
            <button
              onClick={() => {
                setFormData({ title: "", excerpt: "", sourceUrl: "", sourceType: "naver_blog", author: "", imageUrl: "" });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              후기 추가
            </button>
          </div>
        </div>

        {/* List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              등록된 후기가 없습니다.
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className={`rounded-xl border p-4 transition-all ${
                  review.isVisible ? "border-border bg-muted" : "border-border/50 bg-muted/50 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">
                    {getSourceLabel(review.sourceType)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleVisibility(review.id, review.isVisible)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {review.isVisible ? "숨기기" : "공개"}
                    </button>
                  </div>
                </div>
                <h3 className="font-medium mb-2">{review.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {review.excerpt || "-"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">- {review.author || "익명"}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="flex-1 rounded-lg border border-border py-2 text-sm transition-colors hover:bg-background"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="rounded-lg border border-accent/30 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-muted p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">
                {editingId ? "후기 수정" : "후기 추가"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">요약</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 resize-none focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">원본 URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      required
                      placeholder="https://blog.naver.com/..."
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleFetchThumbnail}
                      disabled={fetchingThumbnail || !formData.sourceUrl}
                      className="rounded-lg border border-accent px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {fetchingThumbnail ? "가져오는 중..." : "썸네일 가져오기"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">썸네일 이미지 URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="썸네일 미리보기"
                        className="w-full h-32 object-cover rounded-lg border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">출처 유형</label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  >
                    <option value="naver_blog">네이버 블로그</option>
                    <option value="naver_cafe">네이버 카페</option>
                    <option value="instagram">인스타그램</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">작성자</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="신부 김**"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-lg border border-border py-2 transition-colors hover:bg-background"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-accent py-2 text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                  >
                    {submitting ? "저장 중..." : (editingId ? "수정" : "추가")}
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
