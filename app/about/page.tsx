import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ABOUT | 라우브필름",
  description: "라우브필름을 소개합니다. VFX, 유튜브 프로덕션 출신 감독이 만드는 특별한 웨딩 영상.",
  openGraph: {
    title: "ABOUT | 라우브필름",
    description: "라우브필름을 소개합니다.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">ABOUT</h1>
          <p className="text-lg text-muted-foreground">
            라우브필름을 소개합니다
          </p>
        </div>
      </section>

      {/* Director Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-center tracking-widest">DIRECTOR</h2>
          <div className="bg-background rounded-xl p-8 border border-border">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">Sehan Son</h3>
              <p className="text-muted-foreground">대표 감독</p>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                VFX 아티스트 및 유튜브 프로덕션 출신으로,
                영상에 대한 깊은 이해와 기술력을 바탕으로
                특별한 웨딩 영상을 제작합니다.
              </p>
              <p>
                단순한 기록이 아닌, 두 분의 이야기를 담은
                감성적인 영상을 만들어 드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Camera Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-center tracking-widest">CAMERA</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "SONY FX3", desc: "시네마 라인 카메라" },
              { name: "SONY A7S3", desc: "저조도 특화" },
              { name: "SONY A7M4", desc: "고해상도 촬영" },
            ].map((camera) => (
              <div
                key={camera.name}
                className="bg-muted rounded-xl p-6 border border-border text-center hover:-translate-y-1 transition-transform"
              >
                <h3 className="font-bold mb-2">{camera.name}</h3>
                <p className="text-sm text-muted-foreground">{camera.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-muted-foreground">
            SONY 정품 장비만을 사용하여 최고의 화질을 보장합니다.
          </p>
        </div>
      </section>

      {/* Color Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-center tracking-widest">COLOR</h2>
          <div className="bg-background rounded-xl p-8 border border-border">
            <p className="text-muted-foreground text-center leading-relaxed">
              특수한 촬영 방식과 자연스러운 색감 보정으로
              <br />
              영화 같은 분위기의 영상을 완성합니다.
              <br /><br />
              과하지 않고 자연스러운 색감,
              <br />
              그날의 감동을 그대로 담아냅니다.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
