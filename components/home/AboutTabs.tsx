"use client";

import { useState } from "react";
import Link from "next/link";

export default function AboutTabs() {
  const [activeTab, setActiveTab] = useState<"director" | "custom">("director");

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block">
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">라우브필름의 특별함</h2>
        </div>

        {/* Tab Navigation - Minimal Pills */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex p-1 bg-muted rounded-full">
            <button
              onClick={() => setActiveTab("director")}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === "director"
                  ? "bg-foreground text-background shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              DIRECTOR
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === "custom"
                  ? "bg-foreground text-background shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CUSTOM
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[500px]">
          {/* Director Content */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "director"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8 pointer-events-none absolute inset-0"
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Big Typography */}
              <div>
                <div className="mb-8">
                  <span className="text-7xl md:text-8xl lg:text-9xl font-bold text-muted/20 leading-none select-none">
                    01
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  검증된 감독진
                </h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed mobile-br-hidden">
                  대표가 직접 인정한 실력 있는 감독진만이 촬영합니다.
                  <br />
                  VFX/유튜브 프로덕션 출신 대표감독이 직접 보정하여
                  <br />
                  프리미엄 퀄리티를 보장합니다.
                </p>
                <Link
                  href="/tip"
                  className="inline-flex items-center gap-2 text-sm font-medium border-b border-current pb-1 hover:text-accent transition-colors"
                >
                  영상 시청 가이드 보기
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* Right - Feature Cards */}
              <div className="space-y-4">
                {[
                  { num: "01", title: "대표 인증 감독진", desc: "실력을 인정받은 감독만 촬영" },
                  { num: "02", title: "대표 직접 보정", desc: "VFX/프로덕션 출신 대표의 손길" },
                  { num: "03", title: "정밀 색보정", desc: "표준 DI 작업 환경 구축" },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="group flex items-start gap-6 p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
                  >
                    <span className="text-2xl font-bold text-accent">{item.num}</span>
                    <div>
                      <h4 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Content */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "custom"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8 pointer-events-none absolute inset-0"
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Big Typography */}
              <div>
                <div className="mb-8">
                  <span className="text-7xl md:text-8xl lg:text-9xl font-bold text-muted/20 leading-none select-none">
                    02
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  커스텀 촬영
                </h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed mobile-br-hidden">
                  원하시는 스타일 그대로 담아드립니다.
                  <br />
                  대표 촬영 한정으로 원하시는 형식을
                  <br />
                  최대한 반영하여 제작합니다.
                </p>
                <a
                  href="https://pf.kakao.com/_xlXAin/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#FEE500] text-[#3C1E1E] font-medium hover:brightness-95 transition-all hover:shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.093 5.903-.143.526-.52 1.907-.596 2.2-.094.36.132.355.278.258.115-.076 1.825-1.212 2.562-1.705.539.08 1.095.122 1.663.122 5.523 0 10-3.477 10-7.778C20 6.477 17.523 3 12 3z"/>
                  </svg>
                  카카오톡 상담하기
                </a>
              </div>

              {/* Right - Feature Cards */}
              <div className="space-y-4">
                {[
                  { num: "01", title: "맞춤 영상 제작", desc: "원하시는 형식 최대한 반영" },
                  { num: "02", title: "상담 후 신청", desc: "요청사항 신청서 작성" },
                  { num: "03", title: "기본 구성", desc: "시네마틱 하이라이트 + 기록영상" },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="group flex items-start gap-6 p-6 rounded-2xl border border-border bg-background hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
                  >
                    <span className="text-2xl font-bold text-accent">{item.num}</span>
                    <div>
                      <h4 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}

                {/* Note */}
                <p className="text-xs text-muted-foreground/70 pl-6 mt-4">
                  * 요청 형식에 따라 추가비용 발생 또는 반영 불가할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
