"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ApplicationType = "야외스냅" | "프리웨딩";

interface Application {
  id: number;
  type: string;
  customerName: string;
  customerPhone: string;
  shootLocation: string | null;
  shootDate: string | null;
  shootTime: string | null;
  shootConcept: string | null;
  specialNotes: string | null;
  status: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "검토 대기",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  COMPLETED: "완료",
};

const DEPOSIT_AMOUNT: Record<string, number> = {
  "야외스냅": 50000,
  "프리웨딩": 100000,
};

export default function MypageEventSnapPage() {
  const router = useRouter();
  const [list, setList] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositCopied, setDepositCopied] = useState(false);
  const [submittedType, setSubmittedType] = useState<string>("");
  const [form, setForm] = useState({
    type: "" as ApplicationType | "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    shootLocation: "",
    shootDate: "",
    shootTime: "",
    shootConcept: "",
    specialNotes: "",
  });

  const fetchList = async () => {
    try {
      const res = await fetch("/api/mypage/event-snap-applications", {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) router.push("/mypage/login");
        return;
      }
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      router.push("/mypage/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [router]);

  // 이미 신청한 종류 확인
  const appliedTypes = useMemo(() => {
    const types = new Set<string>();
    for (const app of list) {
      types.add(app.type);
    }
    return types;
  }, [list]);

  const hasSnap = appliedTypes.has("야외스냅");
  const hasPrewedding = appliedTypes.has("프리웨딩");
  const allApplied = hasSnap && hasPrewedding;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.type) {
      setError("신청 종류(야외스냅 또는 프리웨딩)를 선택해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/mypage/event-snap-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "신청에 실패했습니다.");
        return;
      }
      setSubmittedType(form.type);
      setForm({
        type: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        shootLocation: "",
        shootDate: "",
        shootTime: "",
        shootConcept: "",
        specialNotes: "",
      });
      await fetchList();
      setShowDepositModal(true);
    } catch {
      setError("신청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/mypage"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          ← 마이페이지
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">야외스냅 / 프리웨딩 신청</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          야외스냅·프리웨딩 촬영은 예약글과 별도로 여기에서 신청해 주세요. 각 종류당 1회 신청 가능합니다.
        </p>
      </div>

      {/* 신청 목록 (위) */}
      {list.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">내 신청 목록</h2>
          <ul className="space-y-3">
            {list.map((app) => (
              <li
                key={app.id}
                className="rounded-lg border border-border bg-background p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{app.type}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({(DEPOSIT_AMOUNT[app.type] || 0).toLocaleString()}원)
                    </span>
                    {app.shootLocation && <span className="text-muted-foreground text-sm ml-2">· {app.shootLocation}</span>}
                    {app.shootDate && <span className="text-muted-foreground text-sm ml-2">· {app.shootDate}</span>}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {STATUS_LABEL[app.status] ?? app.status} · {new Date(app.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {app.status === "CONFIRMED" && (
                  <p className="text-xs text-green-600">금액 상세에 반영됨</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 신청서 (아래) - 둘 다 신청했으면 숨김 */}
      {allApplied ? (
        <div className="rounded-2xl border border-border bg-muted p-6 text-center">
          <p className="text-muted-foreground">야외스냅과 프리웨딩 모두 신청 완료되었습니다.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">신청 종류 <span className="text-red-500">*</span></label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ApplicationType | "" }))}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
            >
              <option value="">선택</option>
              <option value="야외스냅" disabled={hasSnap}>
                야외스냅{hasSnap ? " (신청 완료)" : ""}
              </option>
              <option value="프리웨딩" disabled={hasPrewedding}>
                프리웨딩{hasPrewedding ? " (신청 완료)" : ""}
              </option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">성함 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="예약자 성함"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">연락처 <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="010-0000-0000"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">이메일 (선택)</label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">희망 촬영 장소</label>
            <input
              type="text"
              value={form.shootLocation}
              onChange={(e) => setForm((p) => ({ ...p, shootLocation: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="예: 노을공원, 창경궁, 동작대교, 올림픽공원 등"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">촬영 희망 날짜</label>
              <input
                type="date"
                value={form.shootDate}
                onChange={(e) => setForm((p) => ({ ...p, shootDate: e.target.value }))}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onKeyDown={(e) => e.preventDefault()}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                style={{ colorScheme: 'light' }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">촬영 희망 시간</label>
              <input
                type="time"
                value={form.shootTime}
                onChange={(e) => setForm((p) => ({ ...p, shootTime: e.target.value }))}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onKeyDown={(e) => e.preventDefault()}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                style={{ colorScheme: 'light' }}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">원하시는 컨셉</label>
            <textarea
              value={form.shootConcept}
              onChange={(e) => setForm((p) => ({ ...p, shootConcept: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              placeholder="원하시는 촬영 컨셉을 작성해주세요"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">특이사항</label>
            <textarea
              value={form.specialNotes}
              onChange={(e) => setForm((p) => ({ ...p, specialNotes: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              placeholder="추가 요청사항이 있으면 작성해주세요"
            />
          </div>
          {form.type && (
            <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 text-sm">
              <p className="font-medium text-accent mb-1">신청 비용 안내</p>
              <p className="text-muted-foreground">
                {form.type === "야외스냅" ? "야외스냅: 50,000원" : form.type === "프리웨딩" ? "프리웨딩: 100,000원" : "종류를 선택해주세요"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">신청 후 입금 안내가 표시됩니다.</p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent py-3 font-medium text-white transition hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? "신청 중..." : "신청하기"}
          </button>
        </form>
      )}

      {/* 입금 안내 모달 */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-center">신청이 완료되었습니다</h3>
            <p className="text-sm text-muted-foreground text-center">
              아래 계좌로 {submittedType} 비용을 입금해주세요.
            </p>
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">금액</span>
                <span className="font-bold text-accent">
                  {(DEPOSIT_AMOUNT[submittedType] || 0).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">은행</span>
                <span>국민은행</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">계좌</span>
                <span className="font-mono">037437-04-012104</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">예금주</span>
                <span>손세한</span>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText("03743704012104");
                  setDepositCopied(true);
                  setTimeout(() => setDepositCopied(false), 2000);
                } catch { /* fallback */ }
              }}
              className="w-full py-2.5 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              {depositCopied ? "복사됨!" : "계좌번호 복사"}
            </button>
            <button
              onClick={() => setShowDepositModal(false)}
              className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
