'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ReviewData {
  id: number;
  reviewUrl: string;
  platform: string;
  platformName: string;
  status: string;
  statusLabel: string;
  titleValid: boolean | null;
  contentValid: boolean | null;
  characterCount: number | null;
  rejectReason: string | null;
  createdAt: string;
}

interface ReviewResponse {
  reviews: ReviewData[];
  shootingReviews?: ReviewData[];
  canWriteReview: boolean;
  maxReviews?: number;
  productType?: string;
  reservationId?: number;
  reviewLink?: string | null;
  reviewRefundAccount?: string | null;
  reviewRefundDepositorName?: string | null;
}

type TabType = 'booking' | 'shooting';

export default function ReviewPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewUrl, setReviewUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [maxReviews, setMaxReviews] = useState(3);
  const [productType, setProductType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('booking');

  // 촬영후기 관련 상태
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [shootingReviewUrl, setShootingReviewUrl] = useState('');
  const [shootingReviews, setShootingReviews] = useState<ReviewData[]>([]);
  const [reviewRefundBank, setReviewRefundBank] = useState('');
  const [reviewRefundAccountNumber, setReviewRefundAccountNumber] = useState('');
  const [reviewRefundDepositorName, setReviewRefundDepositorName] = useState('');
  const [refundInfoSaved, setRefundInfoSaved] = useState(false);
  const [savingRefund, setSavingRefund] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/mypage/review');
      if (!res.ok) {
        router.push('/mypage/login');
        return;
      }
      const data: ReviewResponse = await res.json();
      setReviews(data.reviews);
      setShootingReviews(data.shootingReviews || []);
      setCanWriteReview(data.canWriteReview || false);
      setMaxReviews(data.maxReviews || 3);
      setProductType(data.productType || null);
      setReservationId(data.reservationId || null);

      if (data.reviewRefundAccount) {
        const parts = data.reviewRefundAccount.split(' ');
        if (parts.length >= 2) {
          setReviewRefundBank(parts[0]);
          setReviewRefundAccountNumber(parts.slice(1).join(' '));
        } else {
          setReviewRefundBank('');
          setReviewRefundAccountNumber(data.reviewRefundAccount);
        }
        setRefundInfoSaved(true);
      }
      if (data.reviewRefundDepositorName) {
        setReviewRefundDepositorName(data.reviewRefundDepositorName);
      }
    } catch {
      router.push('/mypage/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/mypage/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
        return;
      }

      setMessage({ type: 'success', text: data.message });
      setReviewUrl('');
      fetchReviews();
    } catch {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (reviewId: number) => {
    if (!confirm('후기 제출을 취소하시겠습니까? 자동 승인된 경우 할인도 되돌려집니다.')) {
      return;
    }

    try {
      const res = await fetch(`/api/mypage/review/${reviewId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
        return;
      }

      setMessage({ type: 'success', text: data.message });
      fetchReviews();
    } catch {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    }
  };

  // 환급계좌 저장 (1회만)
  const handleSaveRefundAccount = async () => {
    if (!reservationId) return;
    setSavingRefund(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/mypage/reservations/${reservationId}/refund-account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewRefundBank: reviewRefundBank.trim(),
          reviewRefundAccountNumber: reviewRefundAccountNumber.trim(),
          reviewRefundDepositorName: reviewRefundDepositorName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || '저장에 실패했습니다.' });
        return;
      }
      setMessage({ type: 'success', text: '환급 계좌가 저장되었습니다.' });
      setRefundInfoSaved(true);
    } catch {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSavingRefund(false);
    }
  };

  // 촬영후기 URL 제출 (건별)
  const handleShootingReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shootingReviewUrl.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/mypage/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewUrl: shootingReviewUrl.trim(), type: 'shooting' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
        return;
      }
      setMessage({ type: 'success', text: data.message });
      setShootingReviewUrl('');
      fetchReviews();
    } catch {
      setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-600',
    AUTO_APPROVED: 'bg-green-500/10 text-green-600',
    MANUAL_REVIEW: 'bg-blue-500/10 text-blue-600',
    APPROVED: 'bg-green-500/10 text-green-600',
    REJECTED: 'bg-red-500/10 text-red-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/mypage" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        돌아가기
      </Link>

      {/* 탭 선택 */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('booking'); setMessage(null); }}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'booking'
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          예약후기
        </button>
        <button
          onClick={() => { setActiveTab('shooting'); setMessage(null); }}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === 'shooting'
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          촬영후기
        </button>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`p-4 rounded-lg text-sm whitespace-pre-wrap ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-600 border border-green-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 예약후기 탭 */}
      {activeTab === 'booking' && (
        <>
          <div className="bg-background rounded-xl border border-border p-6">
            <h1 className="text-2xl font-bold mb-2">예약후기 제출</h1>
            {!canWriteReview ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                <p className="text-yellow-600 text-sm">
                  예약후기 또는 촬영후기 할인을 신청하신 경우에만 후기를 작성할 수 있습니다.
                  <br />
                  예약글 수정 페이지에서 할인 옵션을 체크해주세요.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mb-6">
                {productType === '가성비형'
                  ? '후기 1건 작성 시 원본영상 전달 (할인 없음)'
                  : '후기 1건당 1만원 할인! (블로그/카페 각 1건씩 가능, 최대 3건)'}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reviewUrl" className="block text-sm font-medium mb-2">
                  후기 URL
                </label>
                <input
                  type="url"
                  id="reviewUrl"
                  value={reviewUrl}
                  onChange={(e) => setReviewUrl(e.target.value)}
                  placeholder="https://blog.naver.com/..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={!canWriteReview}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !canWriteReview}
                className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '제출 중...' : '후기 제출하기'}
              </button>
            </form>

            {/* 안내사항 */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">후기 작성 가이드</h3>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>- 제목에 <strong>&apos;라우브필름&apos;</strong> 또는 <strong>&apos;본식DVD&apos;</strong> 포함</li>
                <li>- 본문 500자 이상 작성</li>
                <li>- 네이버 블로그는 자동 검증, 카페는 수동 검토</li>
              </ul>
              <Link
                href="/reviews/guide"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                후기 가이드 보기
              </Link>
            </div>
          </div>

          {/* 제출한 후기 목록 */}
          {reviews.length > 0 && (
            <div className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">제출한 후기</h2>
                {productType === '가성비형' && (
                  <span className="text-xs text-muted-foreground">
                    (최대 {maxReviews}건)
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">{review.platformName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[review.status]}`}>
                          {review.statusLabel}
                        </span>
                        {(review.status === 'PENDING' || review.status === 'MANUAL_REVIEW') && (
                          <button
                            onClick={() => handleCancel(review.id)}
                            className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            취소
                          </button>
                        )}
                      </div>
                    </div>
                    <a
                      href={review.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline break-all"
                    >
                      {review.reviewUrl}
                    </a>
                    {review.characterCount !== null && (
                      <p className="text-xs text-muted-foreground mt-2">
                        글자 수: {review.characterCount}자
                        {review.titleValid === false && ' | 제목 키워드 미포함'}
                        {review.contentValid === false && ' | 500자 미만'}
                      </p>
                    )}
                    {review.rejectReason && (
                      <p className="text-xs text-red-500 mt-2">
                        거절 사유: {review.rejectReason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')} 제출
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 촬영후기 탭 */}
      {activeTab === 'shooting' && (
        <>
          {/* 환급계좌 입력 영역 */}
          <div className="bg-background rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold mb-2">환급 계좌 정보</h2>
            <p className="text-xs text-muted-foreground mb-4">
              촬영후기 환급을 위한 계좌 정보입니다. 최초 1회만 입력 가능하며, 이후 변경은 관리자에게 문의해주세요.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">은행명</label>
                <input
                  type="text"
                  value={reviewRefundBank}
                  onChange={(e) => setReviewRefundBank(e.target.value)}
                  placeholder="예: 국민은행, 신한은행, 카카오뱅크"
                  disabled={!canWriteReview || refundInfoSaved}
                  readOnly={refundInfoSaved}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">계좌번호</label>
                <input
                  type="text"
                  value={reviewRefundAccountNumber}
                  onChange={(e) => setReviewRefundAccountNumber(e.target.value)}
                  placeholder="'-' 없이 숫자만 입력"
                  disabled={!canWriteReview || refundInfoSaved}
                  readOnly={refundInfoSaved}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">입금자명</label>
                <input
                  type="text"
                  value={reviewRefundDepositorName}
                  onChange={(e) => setReviewRefundDepositorName(e.target.value)}
                  placeholder="환급받으실 분의 성함"
                  disabled={!canWriteReview || refundInfoSaved}
                  readOnly={refundInfoSaved}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {refundInfoSaved ? (
                <p className="text-xs text-muted-foreground">
                  환급 정보가 등록되어 있습니다. 변경이 필요하시면 관리자에게 문의해주세요.
                </p>
              ) : (
                <button
                  type="button"
                  disabled={
                    savingRefund ||
                    !canWriteReview ||
                    !reviewRefundBank.trim() ||
                    !reviewRefundAccountNumber.trim() ||
                    !reviewRefundDepositorName.trim()
                  }
                  onClick={handleSaveRefundAccount}
                  className="w-full py-3 px-4 rounded-lg border border-accent text-accent font-medium hover:bg-accent/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingRefund ? '저장 중...' : '환급 계좌 저장'}
                </button>
              )}
            </div>
          </div>

          {/* 촬영후기 URL 제출 영역 */}
          <div className="bg-background rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold mb-2">촬영후기 제출</h2>
            {!canWriteReview ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                <p className="text-yellow-600 text-sm">
                  촬영후기 할인을 신청하신 경우에만 후기를 등록할 수 있습니다.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mb-4 text-sm">
                블로그 후기 1건 + 카페 후기 1건 = 총 2건 제출 가능 (건당 1만원 환급, 최대 2만원)
              </p>
            )}

            <form onSubmit={handleShootingReviewSubmit} className="space-y-4">
              <div>
                <label htmlFor="shootingReviewUrl" className="block text-sm font-medium mb-2">
                  후기 URL
                </label>
                <input
                  type="url"
                  id="shootingReviewUrl"
                  value={shootingReviewUrl}
                  onChange={(e) => setShootingReviewUrl(e.target.value)}
                  placeholder="https://blog.naver.com/... 또는 https://cafe.naver.com/..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={!canWriteReview}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  네이버 블로그(blog.naver.com) 또는 네이버 카페(cafe.naver.com) URL을 입력해주세요.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !canWriteReview || !shootingReviewUrl.trim()}
                className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '제출 중...' : '촬영후기 제출'}
              </button>
            </form>
          </div>

          {/* 제출한 촬영후기 목록 */}
          {shootingReviews.length > 0 && (
            <div className="bg-background rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">제출한 촬영후기</h2>
              <div className="space-y-3">
                {shootingReviews.map((review) => (
                  <div key={review.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">{review.platformName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[review.status]}`}>
                          {review.statusLabel}
                        </span>
                        {(review.status === 'PENDING' || review.status === 'MANUAL_REVIEW') && (
                          <button
                            onClick={() => handleCancel(review.id)}
                            className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            취소
                          </button>
                        )}
                      </div>
                    </div>
                    <a
                      href={review.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline break-all"
                    >
                      {review.reviewUrl}
                    </a>
                    {review.characterCount !== null && (
                      <p className="text-xs text-muted-foreground mt-2">
                        글자 수: {review.characterCount}자
                        {review.titleValid === false && ' | 제목 키워드 미포함'}
                        {review.contentValid === false && ' | 500자 미만'}
                      </p>
                    )}
                    {review.rejectReason && (
                      <p className="text-xs text-red-500 mt-2">
                        거절 사유: {review.rejectReason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')} 제출
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
