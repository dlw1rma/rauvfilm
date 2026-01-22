'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingData {
  id: number;
  customerName: string;
  weddingDate: string;
  weddingVenue: string;
  weddingTime: string | null;
  status: string;
  statusLabel: string;
  partnerCode: string | null;
  videoUrl: string | null;
  contractUrl: string | null;
  product: {
    name: string;
  };
}

interface BalanceData {
  listPrice: number;
  listPriceFormatted: string;
  depositAmount: number;
  depositAmountFormatted: string;
  depositPaidAt: string | null;
  totalDiscount: number;
  totalDiscountFormatted: string;
  finalBalance: number;
  finalBalanceFormatted: string;
  balancePaidAt: string | null;
  discounts: Array<{
    type: string;
    label: string;
    amount: number;
    amountFormatted: string;
  }>;
}

export default function MypageDashboard() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, balanceRes] = await Promise.all([
          fetch('/api/mypage/booking'),
          fetch('/api/mypage/balance'),
        ]);

        if (!bookingRes.ok) {
          router.push('/mypage/login');
          return;
        }

        const bookingData = await bookingRes.json();
        const balanceData = await balanceRes.json();

        setBooking(bookingData.booking);
        setBalance(balanceData.balance);
      } catch {
        router.push('/mypage/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/customer-logout', { method: 'POST' });
    router.push('/mypage/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!booking || !balance) {
    return null;
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    CONFIRMED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    DEPOSIT_PAID: 'bg-green-500/10 text-green-600 border-green-500/20',
    COMPLETED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    DELIVERED: 'bg-accent/10 text-accent border-accent/20',
    CANCELLED: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{booking.customerName}님, 안녕하세요!</h1>
          <p className="text-muted-foreground mt-1">
            라우브필름과 함께해 주셔서 감사합니다
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          로그아웃
        </button>
      </div>

      {/* 예약 상태 카드 */}
      <div className="bg-background rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">예약 정보</h2>
          <span className={`px-3 py-1 rounded-full text-sm border ${statusColors[booking.status]}`}>
            {booking.statusLabel}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">예식 일시</p>
            <p className="font-medium">
              {new Date(booking.weddingDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {booking.weddingTime && ` ${booking.weddingTime}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">예식장</p>
            <p className="font-medium">{booking.weddingVenue}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">상품</p>
            <p className="font-medium">{booking.product.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">짝꿍 코드</p>
            <p className="font-medium">
              {booking.partnerCode || '예약 확정 후 발급됩니다'}
            </p>
          </div>
        </div>
      </div>

      {/* 잔금 카드 */}
      <div className="bg-background rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">잔금 안내</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">정가</span>
            <span>{balance.listPriceFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">예약금</span>
            <span className="text-green-600">-{balance.depositAmountFormatted}</span>
          </div>

          {balance.discounts.map((discount, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-muted-foreground">{discount.label}</span>
              <span className="text-green-600">-{discount.amountFormatted}</span>
            </div>
          ))}

          <div className="border-t border-border pt-3 mt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>최종 잔금</span>
              <span className="text-accent">{balance.finalBalanceFormatted}</span>
            </div>
            {balance.balancePaidAt && (
              <p className="text-sm text-green-600 mt-1">
                입금 완료 ({new Date(balance.balancePaidAt).toLocaleDateString('ko-KR')})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/mypage/partner-code"
          className="bg-background rounded-xl border border-border p-6 hover:border-accent transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">짝꿍 코드</h3>
          <p className="text-sm text-muted-foreground">친구에게 공유하고 할인받기</p>
        </Link>

        <Link
          href="/mypage/review"
          className="bg-background rounded-xl border border-border p-6 hover:border-accent transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">후기 제출</h3>
          <p className="text-sm text-muted-foreground">후기 작성하고 할인받기</p>
        </Link>

        <Link
          href="/mypage/downloads"
          className="bg-background rounded-xl border border-border p-6 hover:border-accent transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">다운로드</h3>
          <p className="text-sm text-muted-foreground">영상 및 계약서 다운로드</p>
        </Link>
      </div>
    </div>
  );
}
