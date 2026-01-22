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

export default function ReviewPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewUrl, setReviewUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/mypage/review');
      if (!res.ok) {
        router.push('/mypage/login');
        return;
      }
      const data = await res.json();
      setReviews(data.reviews);
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

      {/* 후기 제출 폼 */}
      <div className="bg-background rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold mb-2">후기 제출</h1>
        <p className="text-muted-foreground mb-6">
          후기 1건당 1만원 할인! (블로그/카페 각 1건씩 가능)
        </p>

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
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '후기 제출하기'}
          </button>
        </form>

        {/* 안내사항 */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">후기 작성 가이드</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- 제목에 <strong>&apos;라우브필름&apos;</strong> 또는 <strong>&apos;본식DVD&apos;</strong> 포함</li>
            <li>- 본문 500자 이상 작성</li>
            <li>- 네이버 블로그는 자동 검증, 카페는 수동 검토</li>
          </ul>
        </div>
      </div>

      {/* 제출한 후기 목록 */}
      {reviews.length > 0 && (
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">제출한 후기</h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium">{review.platformName}</span>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[review.status]}`}>
                    {review.statusLabel}
                  </span>
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
    </div>
  );
}
