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
  travelFee: number;
  travelFeeFormatted: string;
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
  reservationInfo: {
    id: number;
    productType: string | null;
    usbOption: boolean | null;
    deliveryAddress: string | null;
    makeupShoot: boolean | null;
    paebaekShoot: boolean | null;
    receptionShoot: boolean | null;
    seonwonpan: boolean | null;
    gimbalShoot: boolean | null;
    discountCouple: boolean | null;
    discountReview: boolean | null;
    discountNewYear: boolean | null;
    discountReviewBlog: boolean | null;
    customShootingRequest: boolean | null;
    customStyle: string | null;
    customEditStyle: string | null;
    customMusic: string | null;
    customLength: string | null;
    customEffect: string | null;
    customContent: string | null;
    customSpecialRequest: string | null;
    mainSnapCompany: string | null;
    playbackDevice: string | null;
    referralCode: string | null;
    specialNotes: string | null;
    reviewLink: string | null;
    reviewRefundAccount: string | null;
    reviewRefundDepositorName: string | null;
    reviewDiscount: boolean | null;
    createdAt: string | null;
  } | null;
}

const statusLabels: Record<string, string> = {
  PENDING: '검토중',
  CONFIRMED: '예약확정',
  DEPOSIT_COMPLETED: '입금완료',
  DELIVERED: '전달완료',
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
  const [specialDiscount, setSpecialDiscount] = useState('');
  const [travelFeeInput, setTravelFeeInput] = useState('');
  const [updatingTravelFee, setUpdatingTravelFee] = useState(false);
  const [updatingDiscount, setUpdatingDiscount] = useState(false);
  const [referredByEdit, setReferredByEdit] = useState('');
  const [updatingReferral, setUpdatingReferral] = useState(false);

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
      setSpecialDiscount(data.booking.eventDiscount > 0 ? data.booking.eventDiscount.toString() : '');
      setTravelFeeInput(data.booking.travelFee > 0 ? data.booking.travelFee.toString() : '');
      setReferredByEdit(data.booking.referredBy || '');
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

  const handleSaveStatusDirect = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
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

  const handleUpdateSpecialDiscount = async () => {
    setUpdatingDiscount(true);
    try {
      const discountValue = parseInt(specialDiscount) || 0;
      const res = await fetch(`/api/admin/bookings/${params.id}/special-discount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialDiscount: discountValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '특별 할인이 업데이트되었습니다.' });
      fetchBooking();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setUpdatingDiscount(false);
    }
  };

  const handleUpdateTravelFee = async () => {
    setUpdatingTravelFee(true);
    try {
      const feeValue = parseInt(travelFeeInput) || 0;
      const res = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelFee: feeValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '출장비가 업데이트되었습니다.' });
      fetchBooking();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setUpdatingTravelFee(false);
    }
  };

  const handleUpdateReferral = async () => {
    setUpdatingReferral(true);
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}/referral`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referredBy: referredByEdit.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '짝꿍코드 적용 대상이 변경되었습니다.' });
      fetchBooking();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '오류가 발생했습니다.' });
    } finally {
      setUpdatingReferral(false);
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
              href={`/admin/reservations/${booking.reservationId}/edit`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent/90"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              예약글 수정
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
          </dl>
        </div>

        {/* 예식 정보 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">예식 정보</h2>
          <dl className="space-y-3">
            {booking.reservationInfo?.createdAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">예약글 작성일</dt>
                <dd className="font-medium text-accent">{new Date(booking.reservationInfo.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
              </div>
            )}
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
            {booking.travelFee > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">출장비</dt>
                <dd className="text-accent">+{booking.travelFeeFormatted}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">예약금</dt>
              <dd className="text-green-600">-{booking.depositAmountFormatted}</dd>
            </div>
            {booking.eventDiscount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">특별 할인</dt>
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

        {/* 상태 진행 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">상태 진행</h2>

          {/* 스텝 인디케이터 */}
          {booking.status !== 'CANCELLED' && (
            <div className="flex items-center justify-between mb-6">
              {[
                { key: 'CONFIRMED', label: '예약확정' },
                { key: 'DEPOSIT_COMPLETED', label: '입금완료' },
                { key: 'DELIVERED', label: '전달완료' },
              ].map((step, idx, arr) => {
                const stepOrder = ['PENDING', 'CONFIRMED', 'DEPOSIT_COMPLETED', 'DELIVERED'];
                const currentIdx = stepOrder.indexOf(booking.status);
                const stepIdx = stepOrder.indexOf(step.key);
                const isDone = currentIdx >= stepIdx;
                const isCurrent = booking.status === step.key;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDone
                            ? 'bg-accent text-white'
                            : isCurrent
                              ? 'bg-accent/20 text-accent border-2 border-accent'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isDone ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${isDone || isCurrent ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 ${currentIdx > stepIdx ? 'bg-accent' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 상태별 액션 버튼 */}
          {booking.status === 'PENDING' && (
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              예약 확정하기 (짝꿍 코드 생성)
            </button>
          )}

          {booking.status === 'CONFIRMED' && (
            <button
              onClick={() => {
                setStatus('DEPOSIT_COMPLETED');
                setTimeout(() => {
                  handleSaveStatusDirect('DEPOSIT_COMPLETED');
                }, 0);
              }}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              입금 완료 처리
            </button>
          )}

          {booking.status === 'DEPOSIT_COMPLETED' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-600">
              영상 링크를 저장하면 자동으로 전달 완료 처리됩니다.
            </div>
          )}

          {booking.status === 'DELIVERED' && (
            <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-600">전달 완료</span>
            </div>
          )}

          {booking.status === 'CANCELLED' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-red-500">취소됨</span>
              </div>
              <button
                onClick={() => {
                  if (!confirm('예약을 되살리시겠습니까? 예약 대기 상태로 복원됩니다.')) return;
                  handleSaveStatusDirect('PENDING');
                }}
                disabled={saving}
                className="w-full py-3 rounded-lg border border-accent text-accent font-medium hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
              >
                예약 되살리기
              </button>
            </div>
          )}

          {/* 취소 버튼 (PENDING/CONFIRMED/DEPOSIT_COMPLETED 상태에서만) */}
          {['PENDING', 'CONFIRMED', 'DEPOSIT_COMPLETED'].includes(booking.status) && (
            <button
              onClick={() => {
                if (!confirm('예약을 취소하시겠습니까?')) return;
                handleSaveStatusDirect('CANCELLED');
              }}
              disabled={saving}
              className="w-full mt-3 py-2 rounded-lg border border-red-500 text-red-500 text-sm hover:bg-red-500/10 disabled:opacity-50"
            >
              예약 취소
            </button>
          )}
        </div>

        {/* 특별 할인 관리 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">특별 할인 관리</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                특별 할인 금액 (예: 체험단 50만원)
              </label>
              <input
                type="number"
                value={specialDiscount}
                onChange={(e) => setSpecialDiscount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground mt-1">
                체험단 등 특별 할인 금액을 입력하세요. (원 단위)
              </p>
            </div>
            <button
              onClick={handleUpdateSpecialDiscount}
              disabled={updatingDiscount}
              className="w-full py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              {updatingDiscount ? '저장 중...' : '할인 저장'}
            </button>
          </div>
        </div>

        {/* 출장비 관리 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">출장비 관리</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                출장비 금액
              </label>
              <input
                type="number"
                value={travelFeeInput}
                onChange={(e) => setTravelFeeInput(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground mt-1">
                출장비는 잔금에 자동 합산됩니다. (원 단위)
              </p>
            </div>
            <button
              onClick={handleUpdateTravelFee}
              disabled={updatingTravelFee}
              className="w-full py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              {updatingTravelFee ? '저장 중...' : '출장비 저장'}
            </button>
          </div>
        </div>

        {/* 짝꿍코드 적용 대상 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">짝꿍코드 적용 대상</h2>
          <p className="text-xs text-muted-foreground mb-3">
            이 예약에 적용된 짝꿍 코드(추천인 코드)를 변경할 수 있습니다. 다른 고객의 확정된 짝꿍 코드를 입력하세요.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={referredByEdit}
              onChange={(e) => setReferredByEdit(e.target.value)}
              placeholder="예: 260126 홍길동 (비우면 적용 해제)"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              onClick={handleUpdateReferral}
              disabled={updatingReferral}
              className="w-full py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              {updatingReferral ? '저장 중...' : '적용'}
            </button>
            {booking.referredBy && (
              <p className="text-xs text-muted-foreground">
                현재 적용: {booking.referredBy}
                {booking.referralDiscount > 0 && (
                  <span className="ml-2 text-green-600">(1만원 할인)</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* 짝꿍 코드 (이 고객의 코드) */}
        {booking.partnerCode && (
          <div className="bg-background rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">짝꿍 코드 (이 고객)</h2>
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

        {/* 영상 & 계약서 링크 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">영상 & 계약서 링크</h2>
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
              링크 저장
            </button>
          </div>
        </div>

        {/* 제공사항 (예약글 정보) */}
        {booking.reservationInfo && (
          <div className="bg-background rounded-xl border border-border p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">제공사항 (예약글 정보)</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">상품 종류</p>
                <p className="font-medium">{booking.reservationInfo.productType || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">메인스냅 업체</p>
                <p className="font-medium">{booking.reservationInfo.mainSnapCompany || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">재생매체</p>
                <p className="font-medium">{booking.reservationInfo.playbackDevice || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">짝궁 코드 (Reservation)</p>
                <p className="font-medium">{booking.reservationInfo.referralCode || '-'}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground mb-2">추가 촬영 / 옵션</p>
                <div className="flex flex-wrap gap-2">
                  {booking.reservationInfo.makeupShoot && <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">메이크업샵 촬영</span>}
                  {booking.reservationInfo.paebaekShoot && <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">폐백 촬영</span>}
                  {booking.reservationInfo.receptionShoot && <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">피로연(2부)</span>}
                  {booking.reservationInfo.seonwonpan && <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">선원판</span>}
                  {booking.reservationInfo.gimbalShoot && <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">짐벌(커스텀)</span>}
                  {booking.reservationInfo.usbOption && <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">USB</span>}
                  {!booking.reservationInfo.makeupShoot && !booking.reservationInfo.paebaekShoot && !booking.reservationInfo.receptionShoot && !booking.reservationInfo.seonwonpan && !booking.reservationInfo.gimbalShoot && !booking.reservationInfo.usbOption && (
                    <span className="text-muted-foreground">없음</span>
                  )}
                </div>
              </div>
              {booking.reservationInfo.usbOption && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-muted-foreground">USB 배송지</p>
                  <p className="font-medium">{booking.reservationInfo.deliveryAddress || '미입력'}</p>
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground mb-2">할인사항 체크</p>
                <div className="flex flex-wrap gap-2">
                  {booking.reservationInfo.discountNewYear && <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs">신년할인</span>}
                  {booking.reservationInfo.discountCouple && <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs">짝궁할인</span>}
                  {booking.reservationInfo.discountReview && <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs">촬영후기 할인</span>}
                  {booking.reservationInfo.discountReviewBlog && <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs">예약후기</span>}
                  {!booking.reservationInfo.discountNewYear && !booking.reservationInfo.discountCouple && !booking.reservationInfo.discountReview && !booking.reservationInfo.discountReviewBlog && (
                    <span className="text-muted-foreground">없음</span>
                  )}
                </div>
              </div>
              {booking.reservationInfo.specialNotes && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-muted-foreground">특이사항</p>
                  <p className="font-medium whitespace-pre-wrap mt-1">{booking.reservationInfo.specialNotes}</p>
                </div>
              )}
              {booking.reservationInfo.customShootingRequest && (
                <div className="sm:col-span-2 lg:col-span-3 border-t pt-3">
                  <p className="text-muted-foreground mb-2 font-medium">커스텀 촬영 요청</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {booking.reservationInfo.customStyle && (
                      <div>
                        <p className="text-muted-foreground text-xs">영상 스타일</p>
                        <p>{booking.reservationInfo.customStyle}</p>
                      </div>
                    )}
                    {booking.reservationInfo.customEditStyle && (
                      <div>
                        <p className="text-muted-foreground text-xs">편집 스타일</p>
                        <p>{booking.reservationInfo.customEditStyle}</p>
                      </div>
                    )}
                    {booking.reservationInfo.customMusic && (
                      <div>
                        <p className="text-muted-foreground text-xs">음악 장르</p>
                        <p>{booking.reservationInfo.customMusic}</p>
                      </div>
                    )}
                    {booking.reservationInfo.customLength && (
                      <div>
                        <p className="text-muted-foreground text-xs">영상 진행형식</p>
                        <p>{booking.reservationInfo.customLength}</p>
                      </div>
                    )}
                    {booking.reservationInfo.customEffect && (
                      <div>
                        <p className="text-muted-foreground text-xs">추가효과</p>
                        <p>{booking.reservationInfo.customEffect}</p>
                      </div>
                    )}
                    {booking.reservationInfo.customContent && (
                      <div>
                        <p className="text-muted-foreground text-xs">추가 옵션</p>
                        <p>{booking.reservationInfo.customContent}</p>
                      </div>
                    )}
                    {booking.reservationInfo.customSpecialRequest && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-xs">특별 요청사항</p>
                        <p className="whitespace-pre-wrap">{booking.reservationInfo.customSpecialRequest}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 후기 & 환급 정보 */}
        {booking.reservationInfo && (
          <div className="bg-background rounded-xl border border-border p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">후기 & 환급 정보</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">후기 링크</dt>
                <dd>
                  {booking.reservationInfo.reviewLink ? (
                    <a
                      href={booking.reservationInfo.reviewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline break-all"
                    >
                      {booking.reservationInfo.reviewLink}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">미등록</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">환급 계좌</dt>
                <dd>{booking.reservationInfo.reviewRefundAccount || '미등록'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">입금자명</dt>
                <dd>{booking.reservationInfo.reviewRefundDepositorName || '미등록'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">후기 할인 체크</dt>
                <dd>
                  {booking.reservationInfo.reviewDiscount ? (
                    <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs">체크됨</span>
                  ) : (
                    <span className="text-muted-foreground">미체크</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}

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
