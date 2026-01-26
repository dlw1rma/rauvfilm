'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: number;
  author: string;
  brideName: string;
  groomName: string;
  weddingDate: string | null;
  reviewCount: number;
  reviewDiscount: number;
  customSpecialRequest: string | null;
  specialNotes: string | null;
  customShootingRequest: boolean;
  customStyle: string | null;
  customEditStyle: string | null;
  customMusic: string | null;
  customLength: string | null;
  customEffect: string | null;
  customContent: string | null;
  benefits: string[];
}

interface ReviewSubmission {
  id: number;
  reviewUrl: string;
  platform: string;
  platformName: string;
  status: string;
  statusLabel: string;
  createdAt: string;
}

export default function ReviewBenefitsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [reviewSubmissions, setReviewSubmissions] = useState<ReviewSubmission[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // 검색은 서버에서 처리하므로 검색어가 변경되면 다시 fetch
    if (isAuthenticated) {
      fetchReservations();
    }
  }, [searchQuery, isAuthenticated]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchReservations();
      } else {
        router.push('/admin');
      }
    } catch {
      router.push('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const url = searchQuery.trim()
        ? `/api/admin/review-benefits?q=${encodeURIComponent(searchQuery.trim())}`
        : '/api/admin/review-benefits';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
        setFilteredReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('예약 목록 조회 오류:', error);
    }
  };

  const getBenefits = (reviewCount: number): string[] => {
    const benefits: string[] = [];
    if (reviewCount >= 2) {
      benefits.push('SNS 영상 제공');
    }
    if (reviewCount >= 3) {
      benefits.push('원본 전체 제공');
    }
    return benefits;
  };

  const handleReviewCountClick = async (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setIsReviewModalOpen(true);
    try {
      const res = await fetch(`/api/admin/review-submissions?reservationId=${reservationId}`);
      if (res.ok) {
        const data = await res.json();
        setReviewSubmissions(data.reviews || []);
      }
    } catch (error) {
      console.error('후기 목록 조회 오류:', error);
      setReviewSubmissions([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">제공사항 관리</h1>
              <p className="mt-1 text-muted-foreground">
                고객별 제공사항 및 요청사항을 확인하세요
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              대시보드로
            </button>
          </div>

          {/* 검색 */}
          <div className="max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="YYMMDD 신부/신랑 이름 (예: 250115 홍길동)"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-muted-foreground mt-2">
              예식날짜(YYMMDD)와 신부/신랑 이름을 함께 검색하세요
            </p>
          </div>
        </div>

        {/* 혜택 안내 */}
        <div className="bg-muted rounded-xl p-6 mb-8 border border-border">
          <h2 className="font-semibold mb-4">후기 작성 혜택 안내</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-semibold">1건 작성</h3>
              </div>
              <p className="text-sm text-muted-foreground">1만원 할인</p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-semibold">2건 작성</h3>
              </div>
              <p className="text-sm text-muted-foreground">2만원 할인 + SNS 영상 제공</p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-semibold">3건 작성</h3>
              </div>
              <p className="text-sm text-muted-foreground">3만원 할인 + SNS 영상 제공 + 원본 전체 제공</p>
            </div>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    고객명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    예식일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    후기 작성 횟수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    할인 금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    제공 혜택
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    요청사항
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      {searchQuery ? '검색 결과가 없습니다.' : '예약이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => {
                    const benefits = getBenefits(reservation.reviewCount);
                    const hasRequests = reservation.customSpecialRequest || reservation.specialNotes || reservation.customShootingRequest;
                    return (
                      <tr key={reservation.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {reservation.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {reservation.weddingDate
                            ? new Date(reservation.weddingDate).toLocaleDateString('ko-KR')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleReviewCountClick(reservation.id)}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer transition-colors"
                          >
                            {reservation.reviewCount}건
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {reservation.reviewDiscount.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-2">
                            {benefits.length > 0 ? (
                              benefits.map((benefit, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-foreground"
                                >
                                  {benefit}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs">
                          {hasRequests ? (
                            <div className="space-y-2">
                              {reservation.customShootingRequest && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 mb-1">
                                    커스텀 촬영 요청
                                  </span>
                                  {reservation.customStyle && (
                                    <div className="text-xs text-muted-foreground pl-2">
                                      <span className="font-medium">영상 스타일:</span> {reservation.customStyle}
                                    </div>
                                  )}
                                  {reservation.customEditStyle && (
                                    <div className="text-xs text-muted-foreground pl-2">
                                      <span className="font-medium">편집 스타일:</span> {reservation.customEditStyle}
                                    </div>
                                  )}
                                  {reservation.customMusic && (
                                    <div className="text-xs text-muted-foreground pl-2">
                                      <span className="font-medium">음악 장르:</span> {reservation.customMusic}
                                    </div>
                                  )}
                                  {reservation.customLength && (
                                    <div className="text-xs text-muted-foreground pl-2">
                                      <span className="font-medium">영상 진행형식:</span> {reservation.customLength}
                                    </div>
                                  )}
                                  {reservation.customEffect && (
                                    <div className="text-xs text-muted-foreground pl-2">
                                      <span className="font-medium">추가효과:</span> {reservation.customEffect.length > 50 
                                        ? `${reservation.customEffect.substring(0, 50)}...` 
                                        : reservation.customEffect}
                                    </div>
                                  )}
                                  {reservation.customContent && (
                                    <div className="text-xs text-muted-foreground pl-2">
                                      <span className="font-medium">추가 옵션:</span> {reservation.customContent.length > 50 
                                        ? `${reservation.customContent.substring(0, 50)}...` 
                                        : reservation.customContent}
                                    </div>
                                  )}
                                </div>
                              )}
                              {reservation.customSpecialRequest && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">특별 요청:</span> {reservation.customSpecialRequest.length > 50 
                                    ? `${reservation.customSpecialRequest.substring(0, 50)}...` 
                                    : reservation.customSpecialRequest}
                                </div>
                              )}
                              {reservation.specialNotes && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">특이사항:</span> {reservation.specialNotes.length > 50 
                                    ? `${reservation.specialNotes.substring(0, 50)}...` 
                                    : reservation.specialNotes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 후기 목록 모달 */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold">후기 작성 내역</h2>
                <button
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setSelectedReservationId(null);
                    setReviewSubmissions([]);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {reviewSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    작성된 후기가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewSubmissions.map((review) => {
                      const statusColors: Record<string, string> = {
                        PENDING: 'bg-yellow-500/10 text-yellow-600',
                        AUTO_APPROVED: 'bg-green-500/10 text-green-600',
                        MANUAL_REVIEW: 'bg-blue-500/10 text-blue-600',
                        APPROVED: 'bg-green-500/10 text-green-600',
                        REJECTED: 'bg-red-500/10 text-red-600',
                      };
                      return (
                        <div key={review.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[review.status] || 'bg-muted text-muted-foreground'}`}>
                                {review.statusLabel || review.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {review.platformName || review.platform}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('ko-KR')}
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
