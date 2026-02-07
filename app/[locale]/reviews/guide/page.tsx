import type { Metadata } from 'next';
import { getDictionary } from '@/lib/dictionary';
import { isValidLocale } from '@/lib/i18n';
import LocaleLink from '@/components/ui/LocaleLink';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.reviewGuide.metaTitle,
    description: t.reviewGuide.metaDescription,
  };
}

export default async function ReviewGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  const g = t.reviewGuide;

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {g.pageTitle}
          </h1>
          <p className="text-muted-foreground text-lg">
            {g.intro} 💕
          </p>
        </div>

        {/* 기본 안내 */}
        <div className="text-center mb-16 space-y-3">
          <div className="bg-accent-subtle border border-accent/30 rounded-lg p-4 mb-4">
            <p className="text-foreground font-bold text-lg mb-2">
              ⚠️ {g.onlyBookingReview}
            </p>
            <p className="text-muted-foreground text-sm">
              {g.onlyBookingReviewDesc}
            </p>
          </div>
          <p
            className="text-foreground text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: g.deadlineNotice }}
          />
          <p className="text-foreground text-lg font-medium">
            {g.submitNotice}
          </p>
        </div>

        {/* 혜택 안내 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>🎁</span>
            {g.benefitsTitle}
          </h2>

          {/* 가성비형/1인1캠 안내 */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div>
                <p className="font-bold text-foreground mb-1">{g.budgetProductNotice}</p>
                <p className="text-sm text-muted-foreground">
                  <span dangerouslySetInnerHTML={{ __html: g.budgetProductDesc }} /><br />
                  {g.budgetProductNoDiscount}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{g.benefitsApplyNote}</p>

          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-6 border-l-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg mb-2">{g.benefit1Title}</h3>
                  <p
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: g.benefit1Desc }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 border-l-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg mb-2">{g.benefit2Title}</h3>
                  <p
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: g.benefit2Desc }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 border-l-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg mb-2">{g.benefit3Title}</h3>
                  <p
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: g.benefit3Desc }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>{g.benefitsFootnote}</p>
          </div>
        </div>

        <div className="h-px bg-border my-12"></div>

        {/* 블로그/카페 가이드 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>📝</span>
            {g.blogCafeGuideTitle}
          </h2>
          <ul className="space-y-4 list-none">
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              <span dangerouslySetInnerHTML={{ __html: g.blogCafeGuide1 }} />
            </li>
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              <span dangerouslySetInnerHTML={{ __html: g.blogCafeGuide2pre }} /> <br className="hidden md:block" />
              <span dangerouslySetInnerHTML={{ __html: g.blogCafeGuide2post }} />
            </li>
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              {g.blogCafeGuide3}
            </li>
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              <span dangerouslySetInnerHTML={{ __html: g.blogCafeGuide4 }} /> 😊
            </li>
          </ul>
        </div>

        {/* 추천 웨딩 카페 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>💒</span>
            {g.recommendedCafesTitle}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
            <span dangerouslySetInnerHTML={{ __html: g.recommendedCafesDesc }} /><br className="hidden md:block" />
            {g.recommendedCafesDescSuffix}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">{g.cafeMakeMyWedding}</div>
              <div className="text-muted-foreground text-sm mb-2">&rarr; {g.cafeMakeMyWeddingTab}</div>
              <div className="text-muted-foreground/70 text-xs">{g.cafeMakeMyWeddingNote}</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">{g.cafeINiWedding}</div>
              <div className="text-muted-foreground text-sm mb-2">&rarr; {g.cafeINiWeddingTab}</div>
              <div className="text-muted-foreground/70 text-xs">{g.cafeINiWeddingNote}</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">{g.cafeJWedding}</div>
              <div className="text-muted-foreground text-sm mb-2">&rarr; {g.cafeJWeddingTab}</div>
              <div className="text-muted-foreground/70 text-xs">{g.cafeJWeddingNote}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">{g.cafeWiwiyu}</div>
              <div className="text-muted-foreground text-sm">&rarr; {g.cafeWiwiyuTab}</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">{g.cafeYozmWedding}</div>
              <div className="text-muted-foreground text-sm">&rarr; {g.cafeYozmWeddingTab}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-accent-subtle border border-accent/30 rounded-lg p-5 md:p-6 mt-5">
            <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
            <span
              className="text-accent/90 text-sm md:text-base font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: g.directWeddingWarning }}
            />
          </div>
        </div>

        <div className="h-px bg-border my-12"></div>

        {/* 짝궁코드 TIP */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>💡</span>
            {g.tipTitle}
          </h2>
          <p className="text-foreground text-base md:text-lg font-medium leading-relaxed mb-5">
            <span dangerouslySetInnerHTML={{ __html: g.tipDesc }} /><br className="hidden md:block" />
            <span dangerouslySetInnerHTML={{ __html: g.tipDescSuffix }} />
          </p>
          <span className="inline-block bg-accent text-white px-4 py-2 rounded-md text-sm md:text-base font-semibold mt-3">
            {g.tipExample}
          </span>
        </div>

        <div className="h-px bg-border my-12"></div>

        {/* 짝궁 구하는 방법 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>🎯</span>
            {g.findBuddyTitle}
          </h2>
          <p className="text-muted-foreground/80 text-sm md:text-base mb-8">
            {g.findBuddyDesc}
          </p>

          <div className="space-y-5">
            <div className="bg-muted rounded-xl p-7 border-l-4 border-accent">
              <div className="text-foreground font-bold text-base md:text-lg mb-4">
                {g.threadCommentTitle}
              </div>
              <div className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                {g.threadCommentDesc} 😊
              </div>
              <div className="bg-background rounded-lg p-5 mt-4 text-muted-foreground/80 text-sm md:text-base leading-relaxed italic whitespace-pre-line">
                {g.threadCommentSample}
              </div>
            </div>

            <div className="bg-muted rounded-xl p-7 border-l-4 border-accent">
              <div className="text-foreground font-bold text-base md:text-lg mb-4">
                {g.groupChatTitle}
              </div>
              <div className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                {g.groupChatDesc}<br className="hidden md:block" />
                {g.groupChatDescSuffix}
              </div>
              <div className="bg-background rounded-lg p-5 mt-4 text-muted-foreground/80 text-sm md:text-base leading-relaxed italic whitespace-pre-line">
                {g.groupChatSample}
              </div>
            </div>

            <div className="bg-muted rounded-xl p-7 border-l-4 border-accent">
              <div className="text-foreground font-bold text-base md:text-lg mb-4">
                {g.dmTitle}
              </div>
              <div
                className="text-muted-foreground text-sm md:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: g.dmDesc }}
              />
            </div>
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="text-center mt-12">
          <LocaleLink
            href="/mypage/review"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {g.backToReview}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
