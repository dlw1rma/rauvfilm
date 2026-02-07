import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDictionary } from '@/lib/dictionary';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { MypageTranslationProvider } from '@/components/mypage/MypageTranslationProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import KakaoChannelButton from '@/components/KakaoChannelButton';

async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  return localeCookie && isValidLocale(localeCookie) ? localeCookie : 'ko';
}

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.mypage.metaTitle,
    description: t.mypage.metaDescription,
  };
}

export default async function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <Header locale={locale} />
      <div className="min-h-screen bg-muted/30">
        <div className="bg-background border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/mypage" className="text-xl font-bold">
                {t.mypage.title}
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t.mypage.goHome}
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <MypageTranslationProvider translations={t.mypage}>
            {children}
          </MypageTranslationProvider>
        </div>
      </div>
      <Footer locale={locale} />
      <KakaoChannelButton label={t.common.kakaoConsult} />
    </>
  );
}
