import type { Metadata } from "next";
import PricingCard from "@/components/pricing/PricingCard";
import OptionRow from "@/components/pricing/OptionRow";
import TravelCostGuide from "@/components/pricing/TravelCostGuide";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');

  return {
    title: t.product.metaTitle,
    description: t.product.metaDescription,
    openGraph: {
      title: t.product.metaTitle,
      description: t.product.metaDescription,
    },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');

  const pricingPlans = [
    {
      name: t.product.budgetName,
      subtitle: t.product.budget,
      originalPrice: "340,000",
      price: "310,000",
      description: t.product.description,
      videoUrl: "https://youtu.be/d7dWvR3TAEo",
      features: [
        t.product.budgetFeature1,
        t.product.budgetFeature2,
        t.product.budgetFeature3,
      ],
      recommendations: [
        t.product.budgetRec1,
        t.product.budgetRec2,
      ],
      popular: false,
    },
    {
      name: t.product.standardName,
      subtitle: t.product.standard,
      originalPrice: "600,000",
      price: "500,000",
      description: t.product.description,
      videoUrl: "https://youtu.be/3ieuC7Ul5ko",
      features: [
        t.product.standardFeature1,
        t.product.standardFeature2,
        t.product.standardFeature3,
      ],
      recommendations: [
        t.product.standardRec1,
        t.product.standardRec2,
        t.product.standardRec3,
      ],
      gimbalNote: t.product.gimbalNote,
      popular: true,
    },
    {
      name: t.product.cinematicName,
      subtitle: t.product.cinematic,
      originalPrice: "950,000",
      price: "850,000",
      description: t.product.description,
      videoUrl: "https://youtu.be/sfKkrvLg_7g",
      features: [
        t.product.cinematicFeature1,
        t.product.cinematicFeature2,
      ],
      recommendations: [
        t.product.cinematicRec1,
        t.product.cinematicRec2,
        t.product.cinematicRec3,
      ],
      gimbalNote: t.product.gimbalNote,
      popular: false,
      isNew: true,
    },
  ];

  const additionalOptions = [
    {
      name: t.product.optionReception,
      description: t.product.optionReceptionDesc,
      price: "50,000",
    },
    {
      name: t.product.optionMakeup,
      description: t.product.optionMakeupDesc,
      price: "200,000",
    },
    {
      name: t.product.optionUSB,
      description: t.product.optionUSBDesc,
      price: t.product.usbPrice,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* 히어로 헤더 섹션 */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.08),transparent_50%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-block mb-4 text-xs font-medium tracking-widest text-accent uppercase">
            {t.product.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {t.product.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t.product.subtitle}
          </p>

          {/* 가격 정보 배지 */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-muted border border-border/50 text-sm">
              {t.product.taxIncluded}
            </span>
            <span className="px-4 py-2 rounded-full bg-muted border border-border/50 text-sm">
              {t.product.maxDiscount}
            </span>
          </div>

          <p className="mt-6 text-sm text-muted-foreground/70">
            {t.product.travelNote}
          </p>
        </div>
      </section>

      {/* 상품 카드 그리드 */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} translations={{ discount: t.product.discount, won: t.product.won, recommendedFor: t.product.recommendedFor, videoLabel: t.product.videoLabel }} />
            ))}
          </div>
        </div>
      </section>

      {/* 이벤트 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#111111] via-[#0a0a0a] to-[#111111]">
        <div className="mx-auto max-w-6xl">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-accent uppercase tracking-wider">{t.product.nowAvailable}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.product.eventTitle}</h2>
            <p className="text-white/50">{t.product.eventSubtitle}</p>
          </div>

          {/* 메인 이벤트 카드 2개 */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* 서울 야외촬영 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{t.product.outdoorShooting}</h3>
                      <p className="text-sm text-white/40">{t.product.outdoorShootingSub}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-medium text-white">{t.product.snapShooting}</p>
                        <p className="text-xs text-white/40 mt-1">{t.product.snapShootingDesc}</p>
                      </div>
                      <span className="text-xl font-bold text-white">{t.product.price50k}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-medium text-white">{t.product.preWedding}</p>
                        <p className="text-xs text-white/40 mt-1">{t.product.preWeddingDesc}</p>
                      </div>
                      <span className="text-xl font-bold text-white">{t.product.price100k}</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/30">{t.product.snapNote}</p>
                </div>
              </div>
            </div>

            {/* 예약후기 작성 이벤트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#141414] rounded-3xl border border-white/10 overflow-hidden">
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-full">HOT</span>
                </div>
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{t.product.reviewEventTitle}</h3>
                    <p className="text-sm text-white/40">{t.product.reviewEventDesc}</p>
                  </div>

                  {/* 가성비형 안내 */}
                  <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-400">
                      {t.product.budgetReviewNote}
                    </p>
                  </div>

                  <p className="text-xs text-white/30 mb-3">{t.product.standardCinematicNote}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">1</span>
                        <div>
                          <p className="font-medium text-white">{t.product.review1}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-accent">{t.product.discount10k}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">2</span>
                        <div>
                          <p className="font-medium text-white">{t.product.review2}</p>
                          <p className="text-xs text-white/40">{t.product.review2bonus}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-accent">{t.product.discount20k}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">3</span>
                        <div>
                          <p className="font-medium text-white">{t.product.review3}</p>
                          <p className="text-xs text-white/40">{t.product.review3bonus}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-accent">{t.product.discount20k}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 촬영 장소 */}
          <div className="mb-12 p-6 rounded-2xl bg-[#151515] border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white/60">{t.product.shootingLocations}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                t.product.locationNoelPark,
                t.product.locationChanggyeonggung,
                t.product.locationDongjak,
                t.product.locationJamsu,
                t.product.locationOlympic,
                t.product.locationSeoulForest,
              ].map((location) => (
                <span
                  key={location}
                  className="px-4 py-2 rounded-full bg-white/5 text-sm text-white/70 hover:bg-white/10 transition-colors cursor-default"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>

          {/* 할인 혜택 */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* 짝꿍할인 */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{t.product.pairDiscount}</h4>
              <p className="text-2xl font-bold text-accent mb-3">{t.product.discount10k}</p>
              <p className="text-xs text-white/40 leading-relaxed">{t.product.pairDiscountDesc}</p>
            </div>

            {/* 촬영후기 */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{t.product.reviewPayback}</h4>
              <p className="text-2xl font-bold text-accent mb-3">{t.product.reviewPaybackAmount}</p>
              <p className="text-xs text-white/40 leading-relaxed">{t.product.reviewPaybackDesc}</p>
            </div>

            {/* 신년할인 */}
            <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{t.product.newYearDiscount}</h4>
              <p className="text-2xl font-bold text-accent mb-3">{t.product.newYearDiscountAmount}</p>
              <p className="text-xs text-white/40 leading-relaxed">{t.product.newYearDiscountDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 옵션 섹션 */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <span className="inline-block mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Additional
            </span>
            <h2 className="text-xl font-bold">{t.product.additionalOptions}</h2>
          </div>

          <div className="rounded-xl border border-border/50 bg-background overflow-hidden divide-y divide-border/50">
            {additionalOptions.map((option, index) => (
              <OptionRow key={index} option={option} currencySuffix={t.product.won} />
            ))}
          </div>
        </div>
      </section>

      {/* 출장비 안내 섹션 */}
      <TravelCostGuide translations={t.travel} />

    </div>
  );
}
