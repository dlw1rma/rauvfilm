'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Pagination from '@/components/ui/Pagination';
import { formatDateTime, formatDateKorean } from '@/lib/formatDate';
import { useMypageTranslation } from '@/components/mypage/MypageTranslationProvider';

interface EventSnapApp {
  id: number;
  type: string;
  status: string;
  shootDate: string | null;
  shootTime: string | null;
  shootLocation: string | null;
}

interface Reservation {
  id: number;
  title: string;
  weddingDate: string | null;
  venueName: string | null;
  productType: string | null;
  status: string;
  statusLabel: string;
  createdAt: string;
  eventSnapApplications?: EventSnapApp[];
}

export default function MyReservationsPage() {
  const router = useRouter();
  const t = useMypageTranslation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/mypage/reservations');
      if (!res.ok) {
        router.push('/mypage/login');
        return;
      }
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch {
      router.push('/mypage/login');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-600',
    CONFIRMED: 'bg-blue-500/10 text-blue-600',
    DEPOSIT_COMPLETED: 'bg-green-500/10 text-green-600',
    DELIVERED: 'bg-purple-500/10 text-purple-600',
    CANCELLED: 'bg-red-500/10 text-red-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/mypage" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {t.goBack || '돌아가기'}
      </Link>

      <div className="bg-background rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold mb-6">{t.myReservations || '내 예약글'}</h1>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.noReservations}</p>
          </div>
        ) : (
          <>
          <div className="space-y-4">
            {reservations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((reservation) => (
              <div
                key={reservation.id}
                className="p-4 bg-muted rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{reservation.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {reservation.weddingDate && (
                        <span>
                          {t.weddingDate}: {formatDateKorean(reservation.weddingDate)}
                        </span>
                      )}
                      {reservation.venueName && (
                        <span>{t.venue}: {reservation.venueName}</span>
                      )}
                      {reservation.productType && (
                        <span>{t.productLabel}: {reservation.productType}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[reservation.status] || 'bg-muted text-muted-foreground'}`}>
                      {reservation.statusLabel}
                    </span>
                    {(reservation.eventSnapApplications ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reservation.eventSnapApplications!.map((ev) => (
                          <span
                            key={ev.id}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${ev.status === "CONFIRMED" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}
                          >
                            {ev.type} {ev.status === "CONFIRMED" ? (t.confirmed || "확정") : (t.registered || "등록됨")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {t.createdDate || '작성일'}: {formatDateTime(reservation.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/mypage/reservations/${reservation.id}`}
                      className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      {t.viewDetail || '상세보기'}
                    </Link>
                    <Link
                      href={`/mypage/reservations/${reservation.id}/edit`}
                      className="px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                    >
                      {t.edit || '수정하기'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={Math.ceil(reservations.length / PAGE_SIZE)} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </div>
  );
}
