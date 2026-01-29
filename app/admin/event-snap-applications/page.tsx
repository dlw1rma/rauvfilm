"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Application {
  id: number;
  reservationId: number | null;
  type: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shootLocation: string | null;
  shootDate: string | null;
  shootTime: string | null;
  shootConcept: string | null;
  specialNotes: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "검토 대기" },
  { value: "CONFIRMED", label: "확정" },
  { value: "CANCELLED", label: "취소" },
  { value: "COMPLETED", label: "완료" },
];

const TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "야외스냅", label: "야외스냅" },
  { value: "프리웨딩", label: "프리웨딩" },
];

export default function AdminEventSnapApplicationsPage() {
  const [list, setList] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editAdminNote, setEditAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/admin/event-snap-applications?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError((data?.error as string) || "목록을 불러오는데 실패했습니다.");
        setList([]);
        return;
      }
      setList(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError("목록을 불러오는데 실패했습니다.");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [statusFilter, typeFilter]);

  const startEdit = (app: Application) => {
    setEditingId(app.id);
    setEditStatus(app.status);
    setEditAdminNote(app.adminNote ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus("");
    setEditAdminNote("");
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/event-snap-applications/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, adminNote: editAdminNote || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data?.error as string) || "수정에 실패했습니다.");
        return;
      }
      setEditingId(null);
      setEditStatus("");
      setEditAdminNote("");
      await fetchList();
    } catch (e) {
      setError("수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const confirmOne = async (app: Application) => {
    if (app.status === "CONFIRMED") return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/event-snap-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError((data?.error as string) || "확정 처리에 실패했습니다.");
        return;
      }
      await fetchList();
    } catch (e) {
      setError("확정 처리 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const statusLabel: Record<string, string> = {
    PENDING: "검토 대기",
    CONFIRMED: "확정",
    CANCELLED: "취소",
    COMPLETED: "완료",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← 관리자
          </Link>
          <h1 className="text-2xl font-bold mt-2">야외스냅/프리웨딩 신청 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            마이페이지에서 접수된 야외스냅·프리웨딩 신청을 검토하고 상태를 관리합니다.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground">불러오는 중...</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">신청 내역이 없습니다.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">종류</th>
                <th className="text-left p-3">성함</th>
                <th className="text-left p-3">연락처</th>
                <th className="text-left p-3">장소</th>
                <th className="text-left p-3">날짜/시간</th>
                <th className="text-left p-3">상태</th>
                <th className="text-left p-3">신청일</th>
                <th className="text-left p-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {list.map((app) => (
                <tr key={app.id} className="border-t border-border">
                  <td className="p-3">{app.id}</td>
                  <td className="p-3">{app.type}</td>
                  <td className="p-3">{app.customerName}</td>
                  <td className="p-3">{app.customerPhone}</td>
                  <td className="p-3 max-w-[120px] truncate" title={app.shootLocation ?? undefined}>
                    {app.shootLocation ?? "-"}
                  </td>
                  <td className="p-3">
                    {app.shootDate ?? "-"}
                    {app.shootTime ? ` ${app.shootTime}` : ""}
                  </td>
                  <td className="p-3">{statusLabel[app.status] ?? app.status}</td>
                  <td className="p-3">{new Date(app.createdAt).toLocaleDateString("ko-KR")}</td>
                  <td className="p-3">
                    {app.status !== "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() => confirmOne(app)}
                        disabled={saving}
                        className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50 mr-2"
                      >
                        확정
                      </button>
                    )}
                    {editingId === app.id ? (
                      <div className="space-y-2">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="rounded border border-border bg-background px-2 py-1 text-xs"
                        >
                          {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editAdminNote}
                          onChange={(e) => setEditAdminNote(e.target.value)}
                          placeholder="관리자 메모"
                          className="block w-full rounded border border-border bg-background px-2 py-1 text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={saving}
                            className="rounded bg-accent px-2 py-1 text-xs text-white disabled:opacity-50"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded border border-border px-2 py-1 text-xs"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(app)}
                        className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
                      >
                        수정
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.length > 0 && (
        <div className="space-y-3 mt-6">
          <h2 className="text-lg font-semibold">상세 내용 (요약)</h2>
          {list.map((app) => (
            <details key={app.id} className="rounded-lg border border-border bg-background overflow-hidden">
              <summary className="p-4 cursor-pointer hover:bg-muted/50">
                #{app.id} {app.type} · {app.customerName} · {statusLabel[app.status] ?? app.status}
              </summary>
              <div className="p-4 pt-0 space-y-2 text-sm border-t border-border">
                {app.shootConcept && (
                  <div>
                    <span className="font-medium text-muted-foreground">원하시는 컨셉:</span>
                    <p className="mt-1 whitespace-pre-wrap">{app.shootConcept}</p>
                  </div>
                )}
                {app.specialNotes && (
                  <div>
                    <span className="font-medium text-muted-foreground">특이사항:</span>
                    <p className="mt-1 whitespace-pre-wrap">{app.specialNotes}</p>
                  </div>
                )}
                {app.adminNote && (
                  <div>
                    <span className="font-medium text-muted-foreground">관리자 메모:</span>
                    <p className="mt-1 whitespace-pre-wrap">{app.adminNote}</p>
                  </div>
                )}
                {app.reservationId && (
                  <p className="text-muted-foreground">연결 예약 ID: {app.reservationId}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
