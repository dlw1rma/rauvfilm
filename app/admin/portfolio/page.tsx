"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

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
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    youtubeUrl: "",
    category: "본식DVD",
    featured: false,
  });
  const [syncData, setSyncData] = useState({
    channelHandle: "rauvfilm_Cine",
    apiKey: "",
    category: "본식DVD",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolios();
    }
  }, [isAuthenticated]);

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
              <h1 className="text-3xl font-bold">포트폴리오 관리</h1>
              <p className="mt-1 text-muted-foreground">
                웨딩 영상 포트폴리오를 관리합니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-all hover:bg-muted"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                YouTube 동기화
              </button>
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

        {/* YouTube 동기화 Modal */}
        {isSyncModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-muted p-6">
              <h3 className="text-lg font-bold mb-4">YouTube 채널 동기화</h3>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    채널 핸들 <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={syncData.channelHandle}
                    onChange={(e) => setSyncData({ ...syncData, channelHandle: e.target.value })}
                    placeholder="rauvfilm_Cine"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    @ 기호 없이 입력하세요 (예: rauvfilm_Cine)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    YouTube Data API 키 <span className="text-accent">*</span>
                  </label>
                  <input
                    type="password"
                    value={syncData.apiKey}
                    onChange={(e) => setSyncData({ ...syncData, apiKey: e.target.value })}
                    placeholder="AIza..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Google Cloud Console
                    </a>
                    에서 API 키를 발급받으세요
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select
                    value={syncData.category}
                    onChange={(e) => setSyncData({ ...syncData, category: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  >
                    <option value="본식DVD">본식DVD</option>
                    <option value="시네마틱">시네마틱</option>
                    <option value="하이라이트">하이라이트</option>
                  </select>
                </div>
                {syncResult && (
                  <div className={`rounded-lg p-3 text-sm ${
                    syncResult.includes("실패") || syncResult.includes("오류")
                      ? "bg-accent/10 text-accent"
                      : "bg-green-500/10 text-green-500"
                  }`}>
                    {syncResult}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSyncModalOpen(false);
                    setSyncResult("");
                  }}
                  className="flex-1 rounded-lg border border-border py-2 transition-colors hover:bg-background"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!syncData.channelHandle || !syncData.apiKey) {
                      setSyncResult("채널 핸들과 API 키를 입력해주세요.");
                      return;
                    }

                    setSyncing(true);
                    setSyncResult("");

                    try {
                      const res = await fetch("/api/admin/portfolio/sync-youtube", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(syncData),
                      });

                      const data = await res.json();

                      if (res.ok) {
                        setSyncResult(data.message || "동기화가 완료되었습니다.");
                        await fetchPortfolios();
                        setTimeout(() => {
                          setIsSyncModalOpen(false);
                          setSyncResult("");
                        }, 2000);
                      } else {
                        setSyncResult(data.error || "동기화에 실패했습니다.");
                      }
                    } catch (error) {
                      setSyncResult("동기화 중 오류가 발생했습니다.");
                    } finally {
                      setSyncing(false);
                    }
                  }}
                  disabled={syncing}
                  className="flex-1 rounded-lg bg-accent py-2 text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {syncing ? "동기화 중..." : "동기화 시작"}
                </button>
              </div>
            </div>
          </div>
        )}

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
