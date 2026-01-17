import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            특별한 순간을
            <br />
            <span className="text-accent">영원히</span> 간직하세요
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            라우브필름은 당신의 소중한 결혼식을 감동적인 영상으로 담아드립니다.
            본식DVD부터 시네마틱 영상까지, 평생 간직할 추억을 만들어 드립니다.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/portfolio"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20"
            >
              포트폴리오 보기
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-base font-medium text-foreground transition-all hover:bg-muted hover:-translate-y-1"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-muted py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">서비스 안내</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "본식 DVD",
                description: "결혼식 전 과정을 담은 기본 영상 패키지",
              },
              {
                title: "시네마틱 영상",
                description: "영화처럼 연출된 감성적인 웨딩 영상",
              },
              {
                title: "하이라이트",
                description: "가장 아름다운 순간을 모은 짧은 영상",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="group rounded-xl bg-background p-8 border border-border transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
              >
                <h3 className="mb-3 text-xl font-semibold group-hover:text-accent transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center text-accent hover:underline"
            >
              자세한 가격 안내 보기
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold">상담이 필요하신가요?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            예식 일정, 촬영 스타일, 가격 등 궁금한 점이 있으시면 언제든 문의해주세요.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20"
          >
            무료 상담 신청
          </Link>
        </div>
      </section>
    </div>
  );
}
