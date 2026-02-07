import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";
import PortfolioSlider from "@/components/home/PortfolioSlider";
import HeroVideoSlider from "@/components/home/HeroVideoSlider";
import ReviewSection from "@/components/home/ReviewSection";
import ColorSection from "@/components/home/ColorSection";
import ServiceSection from "@/components/home/ServiceSection";
import CameraSection from "@/components/home/CameraSection";
import DirectorSection from "@/components/home/DirectorSection";
import CustomSection from "@/components/home/CustomSection";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');

  return (
    <div className="flex flex-col bg-[#111111]">
      <HeroVideoSlider translations={{
        heroLine1: t.home.heroLine1,
        heroLine2: t.home.heroLine2,
        heroSubtitle: t.home.heroSubtitle,
      }} />
      <section className="py-16 md:py-20 overflow-hidden bg-[#111111]">
        <PortfolioSlider />
      </section>
      <ServiceSection translations={t.home} locale={locale} />
      <ColorSection translations={{
        colorDesc: t.home.colorDesc,
        colorInstruction: t.home.colorInstruction,
      }} />
      <CameraSection translations={{
        cameraDetail: t.home.cameraDetail,
        cameraDesc1: t.home.cameraDesc1,
        cameraDesc2: t.home.cameraDesc2,
        cameraDesc3: t.home.cameraDesc3,
        cameraDesc4: t.home.cameraDesc4,
        cameraNote: t.home.cameraNote,
      }} />
      <DirectorSection translations={{
        directorSubtitle: t.home.directorSubtitle,
        directorFeature1Title: t.home.directorFeature1Title,
        directorFeature1Desc: t.home.directorFeature1Desc,
        directorFeature2Title: t.home.directorFeature2Title,
        directorFeature2Desc: t.home.directorFeature2Desc,
        directorFeature3Title: t.home.directorFeature3Title,
        directorFeature3Desc: t.home.directorFeature3Desc,
        directorFeature4Title: t.home.directorFeature4Title,
        directorFeature4Desc: t.home.directorFeature4Desc,
        directorNote: t.home.directorNote,
      }} />
      <CustomSection translations={{
        customSubtitle: t.home.customSubtitle,
        customCardTitle: t.home.customCardTitle,
        customDesc: t.home.customDesc,
        customFeature1: t.home.customFeature1,
        customFeature2: t.home.customFeature2,
        customFeature3: t.home.customFeature3,
        customFeature4: t.home.customFeature4,
        customNote: t.home.customNote,
        customCta: t.home.customCta,
      }} />
      <ReviewSection translations={t.home} locale={locale} />
    </div>
  );
}
