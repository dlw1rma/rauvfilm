'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PartnerCodeData {
  partnerCode: string | null;
  message: string;
  status: string;
  referrals: Array<{
    id: number;
    customerName: string;
    weddingDate: string;
    createdAt: string;
  }>;
  referralCount: number;
  totalReferralDiscount: number;
}

export default function PartnerCodePage() {
  const router = useRouter();
  const [data, setData] = useState<PartnerCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mypage/partner-code');
        if (!res.ok) {
          router.push('/mypage/login');
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        router.push('/mypage/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const copyToClipboard = async () => {
    if (!data?.partnerCode) return;
    try {
      await navigator.clipboard.writeText(data.partnerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  const shareKakao = () => {
    if (!data?.partnerCode) return;
    const text = `라우브필름 짝꿍 코드: ${data.partnerCode}\n이 코드로 예약하시면 서로 1만원 할인!\nhttps://rauvfilm.co.kr`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      copyToClipboard();
    }
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

      <div className="bg-background rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold mb-2">내 짝꿍 코드</h1>
        <p className="text-muted-foreground mb-6">{data?.message}</p>

        {data?.partnerCode ? (
          <>
            {/* 코드 표시 */}
            <div className="bg-muted rounded-lg p-6 text-center mb-6">
              <p className="text-3xl font-bold tracking-wider mb-4">{data.partnerCode}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-lg bg-background border border-border hover:border-accent transition-colors"
                >
                  {copied ? '복사됨!' : '코드 복사'}
                </button>
                <button
                  onClick={shareKakao}
                  className="px-4 py-2 rounded-lg bg-[#FEE500] text-[#3C1E1E] font-medium hover:brightness-95 transition-all"
                >
                  공유하기
                </button>
              </div>
            </div>

            {/* 안내 */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-accent mb-2">짝꿍 할인 안내</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- 친구가 이 코드로 예약하면 <strong>서로 1만원씩</strong> 할인!</li>
                <li>- 추천 횟수에 제한이 없습니다</li>
                <li>- 할인은 예약 확정 시 자동 적용됩니다</li>
              </ul>
            </div>

            {/* 추천 현황 */}
            {data.referralCount > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  추천 현황 ({data.referralCount}명)
                </h3>
                <div className="space-y-2">
                  {data.referrals.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg"
                    >
                      <span>{r.customerName}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(r.weddingDate).toLocaleDateString('ko-KR')} 예식
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-green-600 mt-3">
                  총 {(data.totalReferralDiscount).toLocaleString()}원 할인 적용됨
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              예약이 확정되면 짝꿍 코드가 생성됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
