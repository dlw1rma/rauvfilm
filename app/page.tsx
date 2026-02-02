import PortfolioSlider from "@/components/home/PortfolioSlider";
import HeroVideoSlider from "@/components/home/HeroVideoSlider";
import ReviewSection from "@/components/home/ReviewSection";
import ColorSection from "@/components/home/ColorSection";
import ServiceSection from "@/components/home/ServiceSection";
import CameraSection from "@/components/home/CameraSection";
import DirectorSection from "@/components/home/DirectorSection";
import CustomSection from "@/components/home/CustomSection";

export default function Home() {
  return (
    <div className="flex flex-col bg-[#111111]">
      {/* Section 1: Hero - 스크롤 기반 텍스트 등장 */}
      <HeroVideoSlider />

      {/* Section 2: Portfolio Slider */}
      <section className="py-16 md:py-20 overflow-hidden bg-[#111111]">
        <PortfolioSlider />
      </section>

      {/* Section 3: Service */}
      <ServiceSection />

      {/* Section 4: Color */}
      <ColorSection />

      {/* Section 5: Camera */}
      <CameraSection />

      {/* Section 6: Director - 2x2 카드 그리드 */}
      <DirectorSection />

      {/* Section 7: Custom - 중앙 카드 레이아웃 */}
      <CustomSection />

      {/* Section 8: 고객후기 */}
      <ReviewSection />
    </div>
  );
}
