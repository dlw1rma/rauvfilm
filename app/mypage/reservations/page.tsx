'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Reservation {
  id: number;
  title: string;
  weddingDate: string | null;
  venueName: string | null;
  productType: string | null;
  status: string;
  statusLabel: string;
  createdAt: string;
  hasReply: boolean;
}

export default function MyReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

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
    CONFIRMED: 'bg-green-500/10 text-green-600',
    COMPLETED: 'bg-blue-500/10 text-blue-600',
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
        돌아가기
      </Link>

      <div className="bg-background rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold mb-6">내 예약글</h1>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">작성한 예약글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
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
                          예식일: {new Date(reservation.weddingDate).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                      {reservation.venueName && (
                        <span>장소: {reservation.venueName}</span>
                      )}
                      {reservation.productType && (
                        <span>상품: {reservation.productType}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[reservation.status] || 'bg-muted text-muted-foreground'}`}>
                      {reservation.statusLabel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    작성일: {new Date(reservation.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/reservation/${reservation.id}`}
                      className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      상세보기
                    </Link>
                    <Link
                      href={`/mypage/reservations/${reservation.id}/edit`}
                      className="px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                    >
                      수정하기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
