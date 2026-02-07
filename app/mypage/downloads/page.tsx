'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMypageTranslation } from '@/components/mypage/MypageTranslationProvider';

interface BookingData {
  videoUrl: string | null;
  contractUrl: string | null;
  status: string;
  statusLabel: string;
}

export default function DownloadsPage() {
  const router = useRouter();
  const t = useMypageTranslation();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mypage/booking');
        if (!res.ok) {
          router.push('/mypage/login');
          return;
        }
        const data = await res.json();
        setBooking(data.booking);
      } catch {
        router.push('/mypage/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const hasVideo = !!booking?.videoUrl;
  const hasContract = !!booking?.contractUrl;
  const hasAnyDownload = hasVideo || hasContract;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/mypage" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {t.goBack || '돌아가기'}
      </Link>

      <div className="bg-background rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold mb-2">{t.downloadsTitle}</h1>
        <p className="text-muted-foreground mb-6">
          {t.downloadsSub}
        </p>

        {hasAnyDownload ? (
          <div className="space-y-4">
            {/* 영상 다운로드 */}
            <div className={`p-6 rounded-lg border ${hasVideo ? 'border-accent bg-accent/5' : 'border-border bg-muted'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasVideo ? 'bg-accent/10' : 'bg-muted-foreground/10'}`}>
                  <svg className={`w-6 h-6 ${hasVideo ? 'text-accent' : 'text-muted-foreground'}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t.weddingVideo || '웨딩 영상'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasVideo ? (t.videoReady || '영상이 준비되었습니다') : (t.videoNotReady || '아직 업로드되지 않았습니다')}
                  </p>
                </div>
                {hasVideo && (
                  <a
                    href={booking.videoUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
                  >
                    {t.download}
                  </a>
                )}
              </div>
            </div>

            {/* PDF 다운로드 */}
            <div className={`p-6 rounded-lg border ${hasContract ? 'border-accent bg-accent/5' : 'border-border bg-muted'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasContract ? 'bg-accent/10' : 'bg-muted-foreground/10'}`}>
                  <svg className={`w-6 h-6 ${hasContract ? 'text-accent' : 'text-muted-foreground'}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasContract ? (t.pdfReady || 'PDF가 준비되었습니다') : (t.pdfNotReady || '아직 업로드되지 않았습니다')}
                  </p>
                </div>
                {hasContract && (
                  <a
                    href={booking.contractUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
                  >
                    {t.download}
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">{t.noDownloads || '아직 다운로드 가능한 파일이 없습니다'}</h3>
            <p className="text-muted-foreground text-sm">
              {t.downloadsAfterShoot || '촬영 완료 후 영상과 계약서가 업로드됩니다.'}
            </p>
          </div>
        )}

        {/* 안내사항 */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">{t.notice || '안내사항'}</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- {t.downloadNote1 || '영상은 촬영 후 2-4주 내 업로드됩니다'}</li>
            <li>- {t.downloadNote2 || '다운로드 링크는 영상 업로드일로부터 5년간 유효합니다'}</li>
            <li>- {t.downloadNote3 || '문의사항은 카카오톡 채널로 연락주세요'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
