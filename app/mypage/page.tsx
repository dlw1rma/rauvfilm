'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDateKorean } from '@/lib/formatDate';
import { useMypageTranslation } from '@/components/mypage/MypageTranslationProvider';

interface BookingData {
  id: number;
  customerName: string;
  weddingDate: string;
  weddingVenue: string;
  weddingTime: string | null;
  status: string;
  statusLabel: string;
  partnerCode: string | null;
  discountCouple: boolean;
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
  additionalOptions: Array<{
    type: string;
    label: string;
    amount: number;
    amountFormatted: string;
    isDepositOnly?: boolean;
  }>;
  additionalTotal: number;
  additionalTotalFormatted: string;
  product: {
    name: string;
    basePrice: number;
    basePriceFormatted: string;
    originalPrice: number;
    originalPriceFormatted: string;
  };
}

interface EventSnapItem {
  id: number;
  type: string;
  shootLocation: string | null;
  shootDate: string | null;
  shootTime: string | null;
  status: string;
  createdAt: string;
}

export default function MypageDashboard() {
  const router = useRouter();
  const t = useMypageTranslation();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [eventSnapList, setEventSnapList] = useState<EventSnapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, balanceRes, eventSnapRes] = await Promise.all([
          fetch('/api/mypage/booking'),
          fetch('/api/mypage/balance'),
          fetch('/api/mypage/event-snap-applications'),
        ]);

        if (!bookingRes.ok) {
          const errorData = await bookingRes.json().catch(() => ({}));
          if (errorData.accessRestricted) {
            router.push('/mypage/access-restricted');
          } else {
            router.push('/mypage/login');
          }
          return;
        }

        const bookingData = await bookingRes.json();
        const balanceData = await balanceRes.json();
        setBooking(bookingData.booking);
        setBalance(balanceData.balance);

        if (eventSnapRes.ok) {
          const list = await eventSnapRes.json();
          setEventSnapList(Array.isArray(list) ? list : []);
        }

        // 공지 배너
        try {
          const annRes = await fetch('/api/mypage/announcement');
          if (annRes.ok) {
            const annData = await annRes.json();
            if (annData.message) setAnnouncement(annData.message);
          }
        } catch {
          // ignore
        }
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

  const copyPartnerCode = async () => {
    if (!booking?.partnerCode) return;
    try {
      await navigator.clipboard.writeText(booking.partnerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-muted border-t-accent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!booking || !balance) {
    return null;
  }

  // D-day 계산
  const weddingDate = new Date(booking.weddingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDate.setHours(0, 0, 0, 0);
  const diffTime = weddingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dDayText = diffDays === 0 ? 'D-Day' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;

  // 결혼 완료 여부 (예식일 다음날부터)
  const isWeddingDone = diffDays < 0;

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 sm:mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">{booking.customerName}님</h1>
            <p className="text-muted-foreground">
              {isWeddingDone ? t.thankYou : t.specialDay}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.logout}
          </button>
        </div>

        {/* Announcement Banner */}
        {announcement && (
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-5 sm:mb-8 flex items-center gap-2.5 justify-center">
            <span className="shrink-0 text-white/50 text-xs tracking-widest font-semibold uppercase">Notice</span>
            <span className="w-px h-3.5 bg-white/15 shrink-0" />
            <p className="text-sm text-white/70">{announcement}</p>
          </div>
        )}

        {isWeddingDone ? (
          <>
            {/* 축하 히어로 카드 */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-accent/90 to-accent p-5 sm:p-8 mb-5 sm:mb-8 text-white">
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t.congratsTitle}</h2>
                <p className="text-white/80 mb-1">
                  {formatDateKorean(weddingDate)} · {booking.weddingVenue}
                </p>
                <div className="mt-5 space-y-3 text-sm text-white/90 bg-white/10 backdrop-blur rounded-xl p-4">
                  <h3 className="font-semibold text-white text-base">{t.dvdGuideTitle}</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li dangerouslySetInnerHTML={{ __html: t.dvdGuide1 }} />
                    <li dangerouslySetInnerHTML={{ __html: t.dvdGuide2 }} />
                    <li dangerouslySetInnerHTML={{ __html: t.dvdGuide3 }} />
                    <li dangerouslySetInnerHTML={{ __html: t.dvdGuide4 }} />
                  </ul>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* 최종 DVD 진행비용 (캡처/공유 가능) */}
            <div id="final-cost-card" className="rounded-2xl border border-border bg-background p-4 sm:p-6 mb-5 sm:mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t.finalDvdCost}</h3>
                <button
                  onClick={async () => {
                    const costText = `[라우브필름 최종 비용]\n${booking.customerName}님\n예식일: ${formatDateKorean(weddingDate)}\n장소: ${booking.weddingVenue}\n\n상품: ${balance.product.name} ${balance.product.basePriceFormatted}${balance.additionalOptions.map(o => `\n+ ${o.label}: ${o.amountFormatted}`).join('')}\n\n총 금액: ${balance.listPriceFormatted}\n예약금: -${balance.depositAmountFormatted}${balance.discounts.map(d => `\n${d.label}: -${d.amountFormatted}`).join('')}\n\n최종 잔금: ${balance.finalBalanceFormatted}`;
                    try {
                      await navigator.clipboard.writeText(costText);
                      alert(t.costCopied);
                    } catch {
                      alert(t.costCopyFailed);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  {t.copy}
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{balance.product.name}</span>
                  <span>{balance.product.basePriceFormatted}</span>
                </div>
                {balance.additionalOptions.length > 0 && (
                  <>
                    {balance.additionalOptions.map((option, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-muted-foreground">+ {option.label}{option.isDepositOnly ? ` (${t.separateDeposit})` : ''}</span>
                        {option.isDepositOnly ? (
                          <span className="text-muted-foreground">{option.amountFormatted}</span>
                        ) : (
                          <span className="text-foreground">+{option.amountFormatted}</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
                <div className="flex justify-between font-medium pt-2 border-t border-border">
                  <span>{t.totalAmount}</span>
                  <span>{balance.listPriceFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.deposit}</span>
                  <span className="text-rose-400">-{balance.depositAmountFormatted}</span>
                </div>
                {balance.discounts.map((discount, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground">{discount.label}</span>
                    <span className="text-rose-400">-{discount.amountFormatted}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-base">
                    <span>{t.finalBalance}</span>
                    <span className="text-green-400">{balance.finalBalanceFormatted}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t.balanceNote}
                  </p>
                </div>
              </div>
            </div>

            {/* 퀵메뉴 (결혼 완료 후: 3개) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <Link
                href="/mypage/reservations"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-sm font-medium">{t.viewReservations}</span>
              </Link>
              <Link
                href="/mypage/review"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span className="text-sm font-medium">{t.writeReview}</span>
              </Link>
              <Link
                href="/mypage/downloads"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium">{t.download}</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* D-Day Hero Card: 예식일 + 야외스냅/프리웨딩 + 날씨 */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-accent/90 to-accent p-5 sm:p-8 mb-5 sm:mb-8 text-white">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-sm mb-1">{t.weddingDate}</p>
                    <p className="text-2xl font-bold">
                      {formatDateKorean(weddingDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-bold">{dDayText}</span>
                  </div>
                </div>
                {/* 예식일 밑: 야외스냅/프리웨딩 신청 건 표기 */}
                {eventSnapList.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {eventSnapList.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2 text-white/90 text-sm">
                        <span className="font-medium">{ev.type}</span>
                        {ev.shootDate && (
                          <span>
                            {formatDateKorean(ev.shootDate)}
                            {ev.shootTime ? ` ${ev.shootTime}` : ''}
                          </span>
                        )}
                        {ev.shootLocation && <span className="text-white/70">· {ev.shootLocation}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                  <div className="bg-white/20 backdrop-blur rounded-lg px-3 sm:px-4 py-2">
                    <span className="text-white/70">{t.venue}</span>
                    <p className="font-medium">{booking.weddingVenue || t.venueUndecided}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg px-3 sm:px-4 py-2">
                    <span className="text-white/70">{t.productLabel}</span>
                    <p className="font-medium">{booking.product.name}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg px-3 sm:px-4 py-2">
                    <span className="text-white/70">{t.statusLabel}</span>
                    <p className="font-medium">{booking.statusLabel}</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-8">
              {/* Partner Code Card */}
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">{t.partnerCode}</h3>
                    <p className="text-xs text-muted-foreground">{t.partnerCodeSub}</p>
                  </div>
                </div>
                {booking.partnerCode ? (
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-muted rounded-lg px-4 py-3 text-lg font-mono font-bold tracking-wider">
                      {booking.partnerCode}
                    </code>
                    <button
                      onClick={copyPartnerCode}
                      className="shrink-0 px-4 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      {copied ? t.copied : t.copy}
                    </button>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
                    {booking.discountCouple
                      ? t.partnerCodePending
                      : t.partnerCodeNotJoined}
                  </div>
                )}
              </div>

              {/* Balance Summary Card */}
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">{t.balance}</h3>
                    <p className="text-xs text-muted-foreground">{t.balanceSub}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {balance.finalBalanceFormatted}
                </div>
                {balance.discounts.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {t.totalDiscountApplied.replace('{amount}', balance.totalDiscountFormatted)}
                  </p>
                )}
                <button
                  onClick={() => setShowAccountInfo(!showAccountInfo)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                >
                  {showAccountInfo ? t.hideAccount : t.showAccount}
                </button>
                {showAccountInfo && (
                  <div className="mt-2 p-3 rounded-lg bg-muted text-sm space-y-1">
                    <p><span className="text-muted-foreground">{t.bank}:</span> {t.bankName}</p>
                    <p><span className="text-muted-foreground">{t.accountNumber}:</span> <span className="font-mono">037437-04-012104</span></p>
                    <p><span className="text-muted-foreground">{t.accountHolder}:</span> 손세한</p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText('03743704012104');
                          setAccountCopied(true);
                          setTimeout(() => setAccountCopied(false), 2000);
                        } catch { /* fallback */ }
                      }}
                      className="mt-2 w-full py-2 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted/80 transition-colors"
                    >
                      {accountCopied ? t.copied : t.copyAccountNumber}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Balance Detail */}
            <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 mb-4">
              <h3 className="font-semibold mb-4">{t.amountDetail}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{balance.product.name}</span>
                  <span>{balance.product.basePriceFormatted}</span>
                </div>
                {balance.additionalOptions.length > 0 && (
                  <>
                    {balance.additionalOptions.map((option, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-muted-foreground">+ {option.label}{option.isDepositOnly ? ` (${t.separateDeposit})` : ''}</span>
                        {option.isDepositOnly ? (
                          <span className="text-muted-foreground">{option.amountFormatted}</span>
                        ) : (
                          <span className="text-foreground">+{option.amountFormatted}</span>
                        )}
                      </div>
                    ))}
                  </>
                )}
                <div className="flex justify-between font-medium pt-2 border-t border-border">
                  <span>{t.totalAmount}</span>
                  <span>{balance.listPriceFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.deposit}</span>
                  <span className="text-rose-400">-{balance.depositAmountFormatted}</span>
                </div>
                {balance.discounts.map((discount, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground">{discount.label}</span>
                    <span className="text-rose-400">-{discount.amountFormatted}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>{t.finalBalance}</span>
                    <span className="text-green-400">{balance.finalBalanceFormatted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 야외스냅/프리웨딩 신청 */}
            <Link
              href="/mypage/event-snap"
              className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border-2 border-accent/30 bg-accent/5 hover:border-accent/50 hover:bg-accent/10 hover:shadow-lg transition-all mb-5 sm:mb-8"
            >
              <svg className="w-8 h-8 text-accent shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              </svg>
              <span className="text-base font-semibold">{t.eventSnapApply}</span>
            </Link>

            {/* Quick Menu (예식 전: 4개) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Link
                href="/mypage/reservations"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-sm font-medium">{t.viewReservations}</span>
              </Link>
              <Link
                href="/mypage/partner-code"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                <span className="text-sm font-medium">{t.partnerShare}</span>
              </Link>
              <Link
                href="/mypage/review"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span className="text-sm font-medium">{t.writeReview}</span>
              </Link>
              <Link
                href="/mypage/downloads"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium">{t.download}</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
