import Link from "next/link";
import PortfolioSlider from "@/components/home/PortfolioSlider";
import HeroVideoSlider from "@/components/home/HeroVideoSlider";

const serviceItems = [
  {
    title: "Product",
    subtitle: "상품 구성",
    href: "/pricing",
    description: "본식DVD, 시네마틱 영상, 하이라이트 영상 등",
  },
  {
    title: "Reservation",
    subtitle: "예약 절차",
    href: "/reservation",
    description: "간편한 예약 과정 안내",
  },
  {
    title: "Contract",
    subtitle: "계약 약관",
    href: "/terms",
    description: "계약금, 잔금, 취소 규정 안내",
  },
  {
    title: "FAQ",
    subtitle: "자주 묻는 질문",
    href: "/faq",
    description: "궁금한 점을 확인해보세요",
  },
  {
    title: "About",
    subtitle: "라우브필름에 대해서",
    href: "/about",
    description: "라우브필름을 소개합니다",
  },
  {
    title: "TIP",
    subtitle: "영상 활용법",
    href: "/faq",
    description: "영상을 더 잘 활용하는 방법",
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
          <h2 className="mb-12 text-center text-2xl font-bold tracking-widest">SERVICE</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serviceItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-xl bg-background p-6 border border-border transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-accent/10"
              >
                <h3 className="text-lg font-bold mb-1 group-hover:text-accent transition-colors tracking-wider">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{item.subtitle}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COLOR Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-widest">COLOR</h2>
          <div className="bg-muted rounded-xl p-8 border border-border mb-8">
            <div className="aspect-video bg-background rounded-lg flex items-center justify-center mb-6">
              <p className="text-muted-foreground text-sm">Before / After 비교 슬라이더</p>
            </div>
          </div>
          <p className="text-center text-muted-foreground leading-relaxed">
            특수한 촬영 방식과 자연스러운 색감 보정으로
            <br />
            영화 같은 분위기의 영상을 완성합니다.
            <br /><br />
            과하지 않고 자연스러운 색감,
            <br />
            그날의 감동을 그대로 담아냅니다.
          </p>
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

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl font-bold">촬영이 필요하신가요?</h2>
          <p className="mb-8 text-muted-foreground">
            예식 일정, 촬영 스타일, 가격 등 궁금한 점이 있으시면 언제든 문의해주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="inline-flex h-12 items-center justify-center rounded bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1"
            >
              예약 문의하기
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex h-12 items-center justify-center rounded border border-border px-8 text-base font-medium transition-all hover:bg-muted hover:-translate-y-1"
            >
              포트폴리오 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
