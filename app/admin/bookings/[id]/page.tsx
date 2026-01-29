'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingDetail {
  id: number;
  reservationId: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  weddingDate: string;
  weddingVenue: string;
  weddingTime: string | null;
  status: string;
  partnerCode: string | null;
  referredBy: string | null;
  listPrice: number;
  listPriceFormatted: string;
  depositAmount: number;
  depositAmountFormatted: string;
  depositPaidAt: string | null;
  eventDiscount: number;
  eventDiscountFormatted: string;
  referralDiscount: number;
  referralDiscountFormatted: string;
  reviewDiscount: number;
  reviewDiscountFormatted: string;
  finalBalanceFormatted: string;
  balancePaidAt: string | null;
  videoUrl: string | null;
  contractUrl: string | null;
  adminNote: string | null;
  product: { id: number; name: string; price: number };
  discountEvent: { id: number; name: string } | null;
  reviewSubmissions: Array<{
    id: number;
    reviewUrl: string;
    platform: string;
    status: string;
  }>;
  referrals: Array<{
    id: number;
    customerName: string;
    weddingDate: string;
  }>;
}

const statusLabels: Record<string, string> = {
  PENDING: '예약 대기',
  CONFIRMED: '예약 확정',
  DEPOSIT_PAID: '예약금 입금 완료',
  COMPLETED: '촬영 완료',
  DELIVERED: '영상 전달 완료',
  CANCELLED: '취소',
};

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 수정 폼 상태
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [contractUrl, setContractUrl] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [partnerCode, setPartnerCode] = useState('');

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}`);
      if (!res.ok) throw new Error('예약 조회 실패');
      const data = await res.json();
      setBooking(data.booking);
      setStatus(data.booking.status);
      setVideoUrl(data.booking.videoUrl || '');
      setContractUrl(data.booking.contractUrl || '');
      setAdminNote(data.booking.adminNote || '');
      setPartnerCode(data.booking.partnerCode || '');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: '예약 정보를 불러올 수 없습니다.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const handleConfirm = async () => {
    if (!confirm('예약을 확정하시겠습니까? 짝꿍 코드가 생성됩니다.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}/confirm`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: data.message });
      fetchBooking();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '상태가 변경되었습니다.' });
      fetchBooking();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFiles = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, contractUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '파일이 등록되었습니다.' });
      fetchBooking();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePartnerCode = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}/partner-code`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '짝꿍 코드가 변경되었습니다.' });
      fetchBooking();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '메모가 저장되었습니다.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('삭제 실패');
      router.push('/admin/bookings');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!booking) {
    return <div className="text-center py-12 text-muted-foreground">예약을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="text-muted-foreground hover:text-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">예약 상세</h1>
          {booking.reservationId != null && (
            <Link
              href={`/admin/reservations?reservationId=${booking.reservationId}`}
              className="text-sm text-accent hover:underline"
            >
              연결된 예약글 보기
            </Link>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10"
        >
          삭제
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 고객 정보 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">고객 정보</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">성함</dt>
              <dd className="font-medium">{booking.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">전화번호</dt>
              <dd>{booking.customerPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">이메일</dt>
              <dd>{booking.customerEmail || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">추천인 코드</dt>
              <dd>{booking.referredBy || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* 예식 정보 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">예식 정보</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">예식일</dt>
              <dd className="font-medium">{new Date(booking.weddingDate).toLocaleDateString('ko-KR')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">예식 시간</dt>
              <dd>{booking.weddingTime || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">예식장</dt>
              <dd>{booking.weddingVenue}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">상품</dt>
              <dd>{booking.product.name}</dd>
            </div>
          </dl>
        </div>

        {/* 정산 정보 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">정산 정보</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">정가</dt>
              <dd>{booking.listPriceFormatted}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">예약금</dt>
              <dd className="text-green-600">-{booking.depositAmountFormatted}</dd>
            </div>
            {booking.eventDiscount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">이벤트 할인</dt>
                <dd className="text-green-600">-{booking.eventDiscountFormatted}</dd>
              </div>
            )}
            {booking.referralDiscount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">짝꿍 할인</dt>
                <dd className="text-green-600">-{booking.referralDiscountFormatted}</dd>
              </div>
            )}
            {booking.reviewDiscount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">후기 할인</dt>
                <dd className="text-green-600">-{booking.reviewDiscountFormatted}</dd>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <dt className="font-semibold">최종 잔금</dt>
              <dd className="font-bold text-accent">{booking.finalBalanceFormatted}</dd>
            </div>
          </dl>
        </div>

        {/* 상태 변경 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">상태 변경</h2>
          {booking.status === 'PENDING' ? (
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              예약 확정하기 (짝꿍 코드 생성)
            </button>
          ) : (
            <div className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button
                onClick={handleSaveStatus}
                disabled={saving || status === booking.status}
                className="w-full py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
              >
                상태 저장
              </button>
            </div>
          )}
        </div>

        {/* 짝꿍 코드 */}
        {booking.partnerCode && (
          <div className="bg-background rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">짝꿍 코드</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
              <button
                onClick={handleSavePartnerCode}
                disabled={saving || partnerCode === booking.partnerCode}
                className="w-full py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
              >
                코드 변경
              </button>
              {booking.referrals.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">추천한 고객 ({booking.referrals.length}명)</p>
                  {booking.referrals.map((r) => (
                    <div key={r.id} className="text-sm">{r.customerName}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 파일 업로드 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">파일 등록</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">영상 URL</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">계약서 URL</label>
              <input
                type="url"
                value={contractUrl}
                onChange={(e) => setContractUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <button
              onClick={handleSaveFiles}
              disabled={saving}
              className="w-full py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
            >
              파일 저장
            </button>
          </div>
        </div>

        {/* 관리자 메모 */}
        <div className="bg-background rounded-xl border border-border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">관리자 메모</h2>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none"
            placeholder="메모를 입력하세요..."
          />
          <button
            onClick={handleSaveNote}
            disabled={saving}
            className="mt-3 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
          >
            메모 저장
          </button>
        </div>
      </div>
    </div>
  );
}
