"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Portfolio {
  id: number;
  title: string;
  youtubeUrl: string;
  category: string;
  featured: boolean;
  isVisible: boolean;
  order: number;
}

export default function AdminPortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    category: "본식DVD",
    featured: false,
  });

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch("/api/portfolio?admin=true");
      const data = await res.json();
      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        // 수정
        const res = await fetch(`/api/portfolio/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchPortfolios();
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ title: "", youtubeUrl: "", category: "본식DVD", featured: false });
        }
      } else {
        // 추가
        const res = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchPortfolios();
          setIsModalOpen(false);
          setFormData({ title: "", youtubeUrl: "", category: "본식DVD", featured: false });
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (portfolio: Portfolio) => {
    setFormData({
      title: portfolio.title,
      youtubeUrl: portfolio.youtubeUrl,
      category: portfolio.category,
      featured: portfolio.featured,
    });
    setEditingId(portfolio.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchPortfolios();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const toggleVisibility = async (id: number, currentVisible: boolean) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisible }),
      });

      if (res.ok) {
        setPortfolios((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isVisible: !currentVisible } : p
          )
        );
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
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
              <h1 className="text-3xl font-bold">포트폴리오 관리</h1>
              <p className="mt-1 text-muted-foreground">
                웨딩 영상 포트폴리오를 관리합니다.
              </p>
            </div>
            <button
              onClick={() => {
                setFormData({ title: "", youtubeUrl: "", category: "본식DVD", featured: false });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              영상 추가
            </button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-medium">제목</th>
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-center font-medium">대표</th>
                <th className="px-4 py-3 text-center font-medium">공개</th>
                <th className="px-4 py-3 text-right font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {portfolios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    등록된 포트폴리오가 없습니다.
                  </td>
                </tr>
              ) : (
                portfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{portfolio.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {portfolio.youtubeUrl}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">
                        {portfolio.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {portfolio.featured ? (
                        <span className="text-accent">★</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleVisibility(portfolio.id, portfolio.isVisible)}
                        className={`rounded-full px-2 py-1 text-xs ${
                          portfolio.isVisible
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {portfolio.isVisible ? "공개" : "비공개"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(portfolio)}
                        className="text-sm text-muted-foreground hover:text-foreground mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(portfolio.id)}
                        className="text-sm text-accent hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-muted p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingId ? "영상 수정" : "영상 추가"}
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
                  <label className="block text-sm font-medium mb-2">YouTube URL</label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  >
                    <option value="본식DVD">본식DVD</option>
                    <option value="시네마틱">시네마틱</option>
                    <option value="하이라이트">하이라이트</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="featured" className="text-sm">대표 영상으로 설정</label>
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
