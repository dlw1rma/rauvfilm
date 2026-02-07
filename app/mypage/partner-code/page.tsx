'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDateKorean } from '@/lib/formatDate';
import { useMypageTranslation } from '@/components/mypage/MypageTranslationProvider';

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
  const t = useMypageTranslation();
  const [data, setData] = useState<PartnerCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

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

  const copyToClipboard = async (text?: string) => {
    const textToCopy = text || data?.partnerCode || '';
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(t.costCopyFailed || '복사에 실패했습니다.');
    }
  };

  // 공유 텍스트 생성
  const getShareText = () => {
    if (!data?.partnerCode) return '';
    return t.partnerShareText
      ? t.partnerShareText.replace('{code}', data.partnerCode)
      : `라우브필름에서 할인된 가격으로 본식DVD를 만나보세요!\n\n짝꿍 코드: ${data.partnerCode}\n\n이 코드로 예약하시면 서로 1만원씩 할인받을 수 있어요!\n친구와 함께 특별한 순간을 영원히 남겨보세요\n\n예약하기: https://rauvfilm.co.kr/reservation/new`;
  };

  // 카카오톡 공유
  const shareKakao = () => {
    if (!data?.partnerCode) return;
    const text = getShareText();
    const url = `https://rauvfilm.co.kr/reservation/new?partnerCode=${encodeURIComponent(data.partnerCode)}`;

    const kakao = typeof window !== 'undefined' ? (window as any).Kakao : null;
    if (kakao && kakao.isInitialized && kakao.isInitialized()) {
      kakao.Share.sendDefault({
        objectType: 'text',
        text: text,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      });
    } else {
      if (navigator.share) {
        navigator.share({
          title: t.partnerCodeTitle,
          text: text,
          url: url,
        });
      } else {
        copyToClipboard(`${text}\n${url}`);
        alert(t.shareLinkCopied || '공유 링크가 클립보드에 복사되었습니다.');
      }
    }
    setShowShareMenu(false);
  };

  // 페이스북 공유
  const shareFacebook = () => {
    if (!data?.partnerCode) return;
    const url = `https://rauvfilm.co.kr/reservation/new?partnerCode=${encodeURIComponent(data.partnerCode)}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
    setShowShareMenu(false);
  };

  // 트위터/X 공유
  const shareTwitter = () => {
    if (!data?.partnerCode) return;
    const text = getShareText();
    const url = `https://rauvfilm.co.kr/reservation/new?partnerCode=${encodeURIComponent(data.partnerCode)}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
    setShowShareMenu(false);
  };

  // 링크 복사
  const copyShareLink = () => {
    if (!data?.partnerCode) return;
    const url = `https://rauvfilm.co.kr/reservation/new?partnerCode=${encodeURIComponent(data.partnerCode)}`;
    copyToClipboard(url);
    setShowShareMenu(false);
  };

  // 네이버 밴드 공유
  const shareNaverBand = () => {
    if (!data?.partnerCode) return;
    const text = getShareText();
    const url = `https://rauvfilm.co.kr/reservation/new?partnerCode=${encodeURIComponent(data.partnerCode)}`;
    window.open(
      `https://band.us/plugin/share?body=${encodeURIComponent(text + '\n' + url)}&route=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
    setShowShareMenu(false);
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
        {t.goBack || '돌아가기'}
      </Link>

      <div className="bg-background rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold mb-2">{t.myPartnerCode || '내 짝꿍 코드'}</h1>
        <p className="text-muted-foreground mb-6">{data?.message}</p>

        {data?.partnerCode ? (
          <>
            {/* 코드 표시 */}
            <div className="bg-muted rounded-lg p-6 text-center mb-6">
              <p className="text-3xl font-bold tracking-wider mb-4">{data.partnerCode}</p>
              <div className="flex gap-3 justify-center relative">
                <button
                  onClick={() => copyToClipboard()}
                  className="px-4 py-2 rounded-lg bg-background border border-border hover:border-accent transition-colors"
                >
                  {copied ? t.copied : (t.codeCopy || '코드 복사')}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-all flex items-center gap-2"
                  >
                    {t.share || '공유하기'}
                    <svg className={`w-4 h-4 transition-transform ${showShareMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* 공유 메뉴 */}
                  {showShareMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowShareMenu(false)}
                      />
                      <div className="absolute top-full mt-2 right-0 bg-background border border-border rounded-lg shadow-lg z-20 min-w-[200px] overflow-hidden">
                        <button
                          onClick={shareKakao}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-[#FEE500]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                          </svg>
                          <span>{t.kakaoTalk || '카카오톡'}</span>
                        </button>
                        <button
                          onClick={shareFacebook}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span>{t.facebook || '페이스북'}</span>
                        </button>
                        <button
                          onClick={shareTwitter}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <span>{t.twitterX || '트위터/X'}</span>
                        </button>
                        <button
                          onClick={shareNaverBand}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-[#00C73C]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                          </svg>
                          <span>{t.naverBand || '네이버 밴드'}</span>
                        </button>
                        <button
                          onClick={copyShareLink}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-t border-border"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                          <span>{t.copyLink || '링크 복사'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 안내 */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-accent mb-2">{t.partnerDiscountGuide || '짝꿍 할인 안내'}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- {t.partnerGuide1 || '친구가 이 코드로 예약하면 서로 1만원씩 할인!'}</li>
                <li>- {t.partnerGuide2 || '추천 횟수에 제한이 없습니다'}</li>
                <li>- {t.partnerGuide3 || '할인은 예약 확정 시 자동 적용됩니다'}</li>
              </ul>
            </div>

            {/* 추천 현황 */}
            {data.referralCount > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  {t.referralStatus || '추천 현황'} ({data.referralCount}{t.personUnit || '명'})
                </h3>
                <div className="space-y-2">
                  {data.referrals.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg"
                    >
                      <span className="font-medium">{r.customerName}</span>
                      <span className="text-sm text-muted-foreground">
                        {r.weddingDate ? formatDateKorean(r.weddingDate) : (t.dateUndecided || '날짜 미정')} {t.weddingCeremony || '예식'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-3">
                  {t.totalDiscountAppliedLabel || '총'} {(data.totalReferralDiscount).toLocaleString()}{t.wonDiscountApplied || '원 할인 적용됨'}
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
              {t.partnerCodeWaiting || '예약이 확정되면 짝꿍 코드가 생성됩니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
