'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  weddingDate: string;
  weddingVenue: string;
  status: string;
  partnerCode: string | null;
  product: { name: string };
  finalBalanceFormatted: string;
  depositPaidAt: string | null;
  reviewCount: number;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  PENDING: '대기',
  CONFIRMED: '확정',
  DEPOSIT_PAID: '입금완료',
  COMPLETED: '촬영완료',
  DELIVERED: '전달완료',
  CANCELLED: '취소',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  CONFIRMED: 'bg-blue-500/10 text-blue-600',
  DEPOSIT_PAID: 'bg-green-500/10 text-green-600',
  COMPLETED: 'bg-purple-500/10 text-purple-600',
  DELIVERED: 'bg-accent/10 text-accent',
  CANCELLED: 'bg-red-500/10 text-red-600',
};

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [excelOpen, setExcelOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelImporting, setExcelImporting] = useState(false);
  const [excelResult, setExcelResult] = useState<{ created: number; skipped: number; skippedRows?: { row: number; reason: string }[] } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const ud = searchParams.get('upcoming_days');
      const tw = searchParams.get('this_week');
      if (ud) params.set('upcoming_days', ud);
      if (tw === '1') params.set('this_week', '1');

      const res = await fetch(`/api/admin/bookings?${params}`);
      const data = await res.json();
      setBookings(data.bookings || []);
      setStatusCounts(data.statusCounts || {});
    } catch (error) {
      console.error('예약 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingDaysParam = searchParams.get('upcoming_days');
  const thisWeekParam = searchParams.get('this_week');
  useEffect(() => {
    fetchBookings();
  }, [statusFilter, upcomingDaysParam, thisWeekParam]);

  const handleExcelImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return;
    setExcelImporting(true);
    setExcelResult(null);
    try {
      const form = new FormData();
      form.append('file', excelFile);
      const res = await fetch('/api/admin/bookings/import-excel', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) {
        setExcelResult({ created: data.created ?? 0, skipped: data.skipped ?? 0, skippedRows: data.skippedRows });
        setExcelFile(null);
        fetchBookings();
      } else {
        setExcelResult({ created: 0, skipped: 0, skippedRows: [{ row: 0, reason: data.error || '오류' }] });
      }
    } catch {
      setExcelResult({ created: 0, skipped: 0, skippedRows: [{ row: 0, reason: '요청 실패' }] });
    } finally {
      setExcelImporting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">예약 관리</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setExcelOpen(!excelOpen); setExcelResult(null); setExcelFile(null); }}
            className="px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 font-medium"
          >
            이전 사이트 엑셀 이관
          </button>
          <Link
            href="/admin/bookings/new"
            className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90"
          >
            새 예약
          </Link>
        </div>
      </div>

      {excelOpen && (
        <div className="rounded-xl border border-border bg-muted p-4">
          <h3 className="font-semibold mb-3">이전 사이트 계약자 엑셀 이관</h3>
          <p className="text-sm text-muted-foreground mb-3">엑셀 1행에 계약자/이름, 전화/연락처, 예식일/날짜, 예식장/장소 컬럼이 있어야 합니다.</p>
          <form onSubmit={handleExcelImport} className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[200px]">
              <span className="block text-sm text-muted-foreground mb-1">파일 (.xlsx, .xls)</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={!excelFile || excelImporting}
              className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              {excelImporting ? '이관 중...' : '이관 실행'}
            </button>
          </form>
          {excelResult && (
            <p className="mt-3 text-sm">
              생성 {excelResult.created}건, 스킵 {excelResult.skipped}건
              {excelResult.skippedRows && excelResult.skippedRows.length > 0 && (
                <span className="block text-muted-foreground mt-1">
                  스킵: {excelResult.skippedRows.slice(0, 5).map((s) => `행 ${s.row} ${s.reason}`).join(', ')}
                  {excelResult.skippedRows.length > 5 && ` 외 ${excelResult.skippedRows.length - 5}건`}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 상태 필터 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-accent text-white'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            전체
          </button>
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-accent text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {label} ({statusCounts[key] || 0})
            </button>
          ))}
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 전화번호, 예식장 검색..."
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80"
          >
            검색
          </button>
        </form>
      </div>

      {/* 예약 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          예약이 없습니다.
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">고객명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">연락처</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">예식일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">예식장</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">상품</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">잔금</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        {booking.partnerCode && (
                          <p className="text-xs text-muted-foreground">{booking.partnerCode}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatPhone(booking.customerPhone)}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(booking.weddingDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-sm">{booking.weddingVenue}</td>
                    <td className="px-4 py-3 text-sm">{booking.product.name}</td>
                    <td className="px-4 py-3 text-sm font-medium">{booking.finalBalanceFormatted}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status]}`}>
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="text-accent hover:underline text-sm"
                      >
                        상세
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
