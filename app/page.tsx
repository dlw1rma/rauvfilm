import Link from "next/link";
import PortfolioSlider from "@/components/home/PortfolioSlider";
import HeroVideoSlider from "@/components/home/HeroVideoSlider";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";

// SERVICE 섹션 상단 4개 카드
const serviceItemsTop = [
  {
    title: "상품 구성",
    titleEn: "Product",
    href: "/pricing",
    icon: "dollar",
  },
  {
    title: "예약 절차",
    titleEn: "Reservation process",
    href: "/reservation",
    icon: "calendar",
  },
  {
    title: "계약 약관",
    titleEn: "Contract terms",
    href: "/terms",
    icon: "document",
  },
  {
    title: "FAQ",
    titleEn: "FAQ",
    href: "/faq",
    icon: "question",
  },
];

// SERVICE 섹션 하단 2개 넓은 카드
const serviceItemsBottom = [
  {
    title: "라우브필름에 대해서 알아보세요.",
    subtitle: "결혼식 영상에 대한 라우브필름의 철학.",
    href: "/about",
    icon: "chart",
  },
  {
    title: "[TIP] 라우브필름 최대로 활용하기.",
    subtitle: "영상 시청 방법, 커스텀 요청 방법 등등.",
    href: "/faq",
    icon: "lightbulb",
  },
];

const cameras = [
  { name: "SONY FX3", desc: "Cinema Line" },
  { name: "SONY A7S3", desc: "Low Light Master" },
  { name: "SONY A7M4", desc: "High Resolution" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Video Slider Section */}
      <HeroVideoSlider />

      {/* Portfolio Slider Section */}
      <section className="py-16 overflow-hidden">
        <PortfolioSlider />
      </section>

      {/* SERVICE Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="mx-auto max-w-6xl">
          {/* Section Title - Left aligned, Red */}
          <h2 className="mb-8 text-left text-2xl font-bold tracking-widest text-accent">SERVICE</h2>

          {/* Top 4 Cards - 4 columns on desktop, 2 on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {serviceItemsTop.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-lg bg-background p-8 md:p-10 border border-border transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10 min-h-[200px] md:min-h-[220px] flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  {item.icon === "dollar" && (
                    <svg className="w-8 h-8 md:w-9 md:h-9 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.icon === "calendar" && (
                    <svg className="w-8 h-8 md:w-9 md:h-9 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  )}
                  {item.icon === "document" && (
                    <svg className="w-8 h-8 md:w-9 md:h-9 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )}
                  {item.icon === "question" && (
                    <svg className="w-8 h-8 md:w-9 md:h-9 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-accent transition-colors text-center">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground text-center">{item.titleEn}</p>
              </Link>
            ))}
          </div>

          {/* Bottom 2 Wide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceItemsBottom.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-lg bg-background p-8 md:p-10 border border-border transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10 min-h-[160px] md:min-h-[180px]"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
                    {item.icon === "chart" && (
                      <svg className="w-7 h-7 md:w-8 md:h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    )}
                    {item.icon === "lightbulb" && (
                      <svg className="w-7 h-7 md:w-8 md:h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COLOR Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-left text-2xl font-bold tracking-widest text-accent">COLOR</h2>
          <p className="text-left text-muted-foreground leading-relaxed mb-8">
            특수한 촬영 방식과 자연스러운 색감과 피부보정, 드레스 디테일 보정으로
            <br className="hidden md:block" />
            가장 예쁜 모습만을 남겨드리고 있습니다.
          </p>
          <div className="mb-8 relative w-full rounded-lg overflow-hidden">
            {/* PC 버전 영상 - 16:9 비율 */}
            <div className="hidden md:block relative w-full" style={{ aspectRatio: "16/9" }}>
              <iframe
                src="https://www.youtube.com/embed/BEEXhZW2GMo?autoplay=1&mute=1&loop=1&playlist=BEEXhZW2GMo&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            </div>
            {/* 모바일 버전 영상 - 쇼츠 비율 (9:16) */}
            <div className="md:hidden relative w-full mx-auto" style={{ aspectRatio: "9/16", maxWidth: "400px" }}>
              <iframe
                src="https://www.youtube.com/embed/6GEYb31W9go?autoplay=1&mute=1&loop=1&playlist=6GEYb31W9go&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CAMERA Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-2xl font-bold tracking-widest">CAMERA</h2>
          <p className="text-center text-muted-foreground mb-12">SONY 정품 장비만을 사용합니다</p>
          <div className="grid md:grid-cols-3 gap-6">
            {cameras.map((camera) => (
              <div
                key={camera.name}
                className="bg-background rounded-xl p-8 border border-border text-center hover:-translate-y-1 transition-transform"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-1">{camera.name}</h3>
                <p className="text-xs text-muted-foreground">{camera.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIRECTOR Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-widest">DIRECTOR</h2>
          <div className="bg-muted rounded-xl p-8 border border-border">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Sehan Son</h3>
              <p className="text-muted-foreground">대표 감독</p>
            </div>
            <div className="space-y-4 text-center text-muted-foreground">
              <p>VFX 아티스트 및 유튜브 프로덕션 출신</p>
              <p>
                영상에 대한 깊은 이해와 기술력을 바탕으로
                <br />
                특별한 웨딩 영상을 제작합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOM Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-widest">CUSTOM</h2>
          <p className="text-muted-foreground mb-8">
            특별한 요청사항이 있으신가요?
            <br />
            맞춤형 영상 제작도 가능합니다.
          </p>
          <a
            href="https://pf.kakao.com/_xlXAin/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded bg-[#FEE500] px-8 text-base font-medium text-[#3C1E1E] transition-all hover:brightness-95 hover:-translate-y-1"
          >
            카카오톡 상담하기
          </a>
        </div>
      </section>

      {/* REVIEW Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-widest">REVIEW</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg flex items-center justify-center hover:-translate-y-1 transition-transform cursor-pointer"
              >
                <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="https://search.naver.com/search.naver?query=라우브필름+후기"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-accent hover:underline"
            >
              +REVIEW 더 보기
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* NOTICE Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-widest">NOTICE</h2>
          <div className="bg-background rounded-xl p-6 border border-border">
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <span className="text-xs text-muted-foreground whitespace-nowrap">2024.01</span>
                <div>
                  <p className="font-medium mb-1">카카오톡 상담 채널 안내</p>
                  <p className="text-sm text-muted-foreground">
                    상담은 카카오톡 채널을 통해 진행됩니다. 우측 하단 버튼을 클릭해주세요.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-xs text-muted-foreground whitespace-nowrap">2024.01</span>
                <div>
                  <p className="font-medium mb-1">예약 안내</p>
                  <p className="text-sm text-muted-foreground">
                    성수기(4-6월, 9-11월)에는 예약이 빠르게 마감될 수 있습니다. 미리 문의해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
