'use client';

import { useEffect, useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/formatDate';

interface ReviewSubmission {
  id: number;
  reviewUrl: string;
  platform: string;
  platformName: string;
  status: string;
  statusLabel: string;
  autoVerified: boolean;
  titleValid: boolean | null;
  contentValid: boolean | null;
  characterCount: number | null;
  rejectReason: string | null;
  createdAt: string;
  reservation: {
    id: number;
    customerName: string;
    customerPhone: string | null;
    weddingDate: string | null;
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  AUTO_APPROVED: 'bg-green-500/10 text-green-600',
  MANUAL_REVIEW: 'bg-blue-500/10 text-blue-600',
  APPROVED: 'bg-green-500/10 text-green-600',
  REJECTED: 'bg-red-500/10 text-red-600',
};

export default function AdminReviewSubmissionsPage() {
  const [reviews, setReviews] = useState<ReviewSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [processing, setProcessing] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/review-submissions?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStatusCounts(data.statusCounts || {});
    } catch (error) {
      console.error('후기 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchReviews();
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    if (!confirm('이 후기를 승인하시겠습니까?')) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/review-submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/review-submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectReason }),
      });
      if (res.ok) {
        setRejectingId(null);
        setRejectReason('');
        fetchReviews();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const statusLabels: Record<string, string> = {
    PENDING: '대기',
    AUTO_APPROVED: '자동승인',
    MANUAL_REVIEW: '수동검토',
    APPROVED: '승인',
    REJECTED: '거절',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">후기 승인 관리</h1>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            statusFilter === 'all' ? 'bg-accent text-white' : 'bg-muted'
          }`}
        >
          전체
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              statusFilter === key ? 'bg-accent text-white' : 'bg-muted'
            }`}
          >
            {label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          후기가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((review) => (
            <div key={review.id} className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.reservation.customerName}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[review.status]}`}>
                      {review.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {review.platformName} | {formatDate(review.createdAt)}
                  </p>
                  {review.reservation.weddingDate && (
                    <p className="text-xs text-muted-foreground">
                      예식일: {formatDate(review.reservation.weddingDate)}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={review.reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm break-all block mb-4"
              >
                {review.reviewUrl}
              </a>

              {/* 검증 결과 */}
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <span className={`px-2 py-1 rounded ${review.titleValid ? 'bg-green-500/10 text-green-600' : review.titleValid === false ? 'bg-red-500/10 text-red-500' : 'bg-muted'}`}>
                  제목 키워드: {review.titleValid === null ? '미검증' : review.titleValid ? 'O' : 'X'}
                </span>
                <span className={`px-2 py-1 rounded ${review.contentValid ? 'bg-green-500/10 text-green-600' : review.contentValid === false ? 'bg-red-500/10 text-red-500' : 'bg-muted'}`}>
                  글자수: {review.characterCount !== null ? `${review.characterCount}자` : '미검증'}
                </span>
                {review.autoVerified && (
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent">자동 검증됨</span>
                )}
              </div>

              {review.rejectReason && (
                <p className="text-sm text-red-500 mb-4">거절 사유: {review.rejectReason}</p>
              )}

              {/* 액션 버튼 */}
              {(review.status === 'PENDING' || review.status === 'MANUAL_REVIEW') && (
                <div className="flex gap-2">
                  {rejectingId === review.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="거절 사유 입력"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                      />
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={processing === review.id}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 rounded-lg bg-muted text-sm"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={processing === review.id}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => setRejectingId(review.id)}
                        disabled={processing === review.id}
                        className="px-4 py-2 rounded-lg border border-red-500 text-red-500 text-sm hover:bg-red-500/10 disabled:opacity-50"
                      >
                        거절
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          <Pagination currentPage={currentPage} totalPages={Math.ceil(reviews.length / PAGE_SIZE)} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
