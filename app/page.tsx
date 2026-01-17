import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_70%)] opacity-10" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground sm:text-6xl lg:text-7xl">
            당신의 특별한 순간을
            <br />
            <span className="text-accent">영원히</span> 간직하세요
          </h1>
          <p className="mb-8 text-lg text-text-secondary sm:text-xl">
            라우브필름은 웨딩 본식 DVD와 시네마틱 영상 제작을 전문으로 하는 영상 제작 스튜디오입니다.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/portfolio"
              className="rounded-lg bg-accent px-8 py-4 font-semibold text-accent-foreground transition-all hover:-translate-y-1 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
            >
              포트폴리오 보기
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-border bg-muted px-8 py-4 font-semibold text-foreground transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>

      {/* 서비스 소개 섹션 */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-4xl">
            서비스 안내
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* 본식 DVD */}
            <div className="group rounded-lg border border-border bg-muted p-8 transition-all hover:-translate-y-2 hover:border-accent hover:shadow-xl hover:shadow-accent/10">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">본식 DVD</h3>
              <p className="text-muted-foreground">
                결혼식의 전체 과정을 안정적인 화질로 담아 평생 간직할 수 있는 DVD로 제작해드립니다.
              </p>
            </div>

            {/* 시네마틱 영상 */}
            <div className="group rounded-lg border border-border bg-muted p-8 transition-all hover:-translate-y-2 hover:border-accent hover:shadow-xl hover:shadow-accent/10">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">시네마틱 영상</h3>
              <p className="text-muted-foreground">
                영화 같은 감동적인 연출로 특별한 순간을 예술 작품으로 완성합니다.
              </p>
            </div>

            {/* 하이라이트 편집 */}
            <div className="group rounded-lg border border-border bg-muted p-8 transition-all hover:-translate-y-2 hover:border-accent hover:shadow-xl hover:shadow-accent/10">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">하이라이트 편집</h3>
              <p className="text-muted-foreground">
                결혼식의 주요 장면만 압축하여 SNS 공유에 최적화된 영상으로 제작합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
            지금 바로 상담받아보세요
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            여러분의 특별한 날을 함께하고 싶습니다.
            <br />
            언제든 편하게 문의해주세요.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/reservation"
              className="rounded-lg bg-accent px-8 py-4 font-semibold text-accent-foreground transition-all hover:-translate-y-1 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
            >
              예약 게시판
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-border bg-background px-8 py-4 font-semibold text-foreground transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              가격 확인하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
