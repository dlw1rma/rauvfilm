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

interface WeatherData {
  temperature: number | null;
  humidity?: number | null;
  weatherLabel: string;
  dateLabel?: string;
}

interface WeatherTooFar {
  tooFar: true;
  date?: string;
  message?: string;
}

export default function MypageDashboard() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [eventSnapList, setEventSnapList] = useState<EventSnapItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | WeatherTooFar | null>(null);
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
          router.push('/mypage/login');
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

  // 날씨: 확정된 야외스냅/프리웨딩 일정에 맞춰 표시 (확정된 것만, 없으면 예식일)
  useEffect(() => {
    if (!booking) return;
    const weddingDateStr = booking.weddingDate?.slice(0, 10);
    const confirmedWithDate = eventSnapList
      .filter((ev) => ev.status === "CONFIRMED" && !!ev.shootDate)
      .map((ev) => ({ ...ev, shootDateNorm: ev.shootDate!.slice(0, 10) }))
      .sort((a, b) => a.shootDateNorm.localeCompare(b.shootDateNorm));
    const weatherDate = confirmedWithDate[0]?.shootDateNorm ?? weddingDateStr;
    if (!weatherDate) return;

    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/weather?date=${encodeURIComponent(weatherDate)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.tooFar) {
          setWeather({ tooFar: true, date: data.date, message: data.message ?? '일정이 너무 멀어 아직 날씨 정보가 없습니다.' });
          return;
        }
        const dateLabel = (() => {
          try {
            const d = new Date(weatherDate);
            return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + ' 예상 날씨';
          } catch {
            return undefined;
          }
        })();
        setWeather({
          temperature: data.temperature ?? null,
          humidity: data.humidity ?? null,
          weatherLabel: data.weatherLabel ?? '—',
          dateLabel,
        });
      } catch {
        // ignore
      }
    };
    fetchWeather();
  }, [booking, eventSnapList]);

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
          <p className="text-sm text-muted-foreground">로딩 중...</p>
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
              {isWeddingDone ? '라우브필름을 선택해주셔서 감사합니다' : '라우브필름과 함께하는 특별한 날'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            로그아웃
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
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">결혼을 진심으로 축하드립니다!</h2>
                <p className="text-white/80 mb-1">
                  {weddingDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} · {booking.weddingVenue}
                </p>
                <div className="mt-5 space-y-3 text-sm text-white/90 bg-white/10 backdrop-blur rounded-xl p-4">
                  <h3 className="font-semibold text-white text-base">DVD 안내사항</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>본식 영상은 촬영일 기준 약 <strong>60~80일</strong>이 소요됩니다.</li>
                    <li>영상 업로드 시 알림톡으로 안내드립니다.</li>
                    <li>영상 원본과 편집본은 최종 발송일 기준 <strong>2개월간 보관</strong> 후 삭제됩니다.</li>
                    <li>다운로드 페이지에서 영상을 확인하실 수 있습니다.</li>
                  </ul>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* 최종 DVD 진행비용 (읽기 전용) */}
            <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 mb-5 sm:mb-8">
              <h3 className="font-semibold mb-4">최종 DVD 진행비용</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{balance.product.name}</span>
                  <span>{balance.product.basePriceFormatted}</span>
                </div>
                {balance.additionalOptions.length > 0 && (
                  <>
                    {balance.additionalOptions.map((option, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-muted-foreground">+ {option.label}{option.isDepositOnly ? ' (별도 예약금)' : ''}</span>
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
                  <span>총 금액</span>
                  <span>{balance.listPriceFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예약금</span>
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
                    <span>최종 잔금</span>
                    <span className="text-green-400">{balance.finalBalanceFormatted}</span>
                  </div>
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
                <span className="text-sm font-medium">예약글 조회</span>
              </Link>
              <Link
                href="/mypage/review"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span className="text-sm font-medium">후기 작성</span>
              </Link>
              <Link
                href="/mypage/downloads"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium">다운로드</span>
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
                    <p className="text-white/70 text-sm mb-1">예식일</p>
                    <p className="text-2xl font-bold">
                      {weddingDate.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
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
                            {new Date(ev.shootDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
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
                    <span className="text-white/70">장소</span>
                    <p className="font-medium">{booking.weddingVenue || '미정'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg px-3 sm:px-4 py-2">
                    <span className="text-white/70">상품</span>
                    <p className="font-medium">{booking.product.name}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg px-3 sm:px-4 py-2">
                    <span className="text-white/70">상태</span>
                    <p className="font-medium">{booking.statusLabel}</p>
                  </div>
                  {weather && (
                    <div className="bg-white/20 backdrop-blur rounded-lg px-3 sm:px-4 py-2">
                      {'tooFar' in weather ? (
                        <>
                          <span className="text-white/70">날씨</span>
                          <p className="font-medium">{weather.message ?? '일정이 너무 멀어 아직 날씨 정보가 없습니다.'}</p>
                        </>
                      ) : (
                        <>
                          <span className="text-white/70">{weather.dateLabel ?? '날씨'}</span>
                          <p className="font-medium">
                            {weather.weatherLabel}
                            {weather.temperature != null ? ` ${Math.round(weather.temperature)}°C` : ''}
                            {weather.humidity != null ? ` · 습도 ${weather.humidity}%` : ''}
                          </p>
                        </>
                      )}
                    </div>
                  )}
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
                    <h3 className="font-semibold">짝꿍 코드</h3>
                    <p className="text-xs text-muted-foreground">친구와 함께 할인받기</p>
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
                      {copied ? '복사됨!' : '복사'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
                    {booking.discountCouple
                      ? '예약 확정 후 발급됩니다'
                      : '짝궁코드 참여 시 발급됩니다'}
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
                    <h3 className="font-semibold">잔금</h3>
                    <p className="text-xs text-muted-foreground">결제 예정 금액</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {balance.finalBalanceFormatted}
                </div>
                {balance.discounts.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    총 {balance.totalDiscountFormatted} 할인 적용
                  </p>
                )}
                <button
                  onClick={() => setShowAccountInfo(!showAccountInfo)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                >
                  {showAccountInfo ? '계좌 닫기' : '계좌 확인'}
                </button>
                {showAccountInfo && (
                  <div className="mt-2 p-3 rounded-lg bg-muted text-sm space-y-1">
                    <p><span className="text-muted-foreground">은행:</span> 국민은행</p>
                    <p><span className="text-muted-foreground">계좌:</span> <span className="font-mono">037437-04-012104</span></p>
                    <p><span className="text-muted-foreground">예금주:</span> 손세한</p>
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
                      {accountCopied ? '복사됨!' : '계좌번호 복사'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Balance Detail */}
            <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 mb-4">
              <h3 className="font-semibold mb-4">금액 상세</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{balance.product.name}</span>
                  <span>{balance.product.basePriceFormatted}</span>
                </div>
                {balance.additionalOptions.length > 0 && (
                  <>
                    {balance.additionalOptions.map((option, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-muted-foreground">+ {option.label}{option.isDepositOnly ? ' (별도 예약금)' : ''}</span>
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
                  <span>총 금액</span>
                  <span>{balance.listPriceFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예약금</span>
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
                    <span>최종 잔금</span>
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
              <span className="text-base font-semibold">야외스냅 / 프리웨딩 신청</span>
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
                <span className="text-sm font-medium">예약글 조회</span>
              </Link>
              <Link
                href="/mypage/partner-code"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                <span className="text-sm font-medium">짝꿍 공유</span>
              </Link>
              <Link
                href="/mypage/review"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span className="text-sm font-medium">후기 작성</span>
              </Link>
              <Link
                href="/mypage/downloads"
                className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg transition-all text-center"
              >
                <svg className="w-8 h-8 text-accent mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium">다운로드</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
