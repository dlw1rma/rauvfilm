"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const cards = [
  {
    title: "생생하게 담아내는",
    titleHighlight: "영화 같은 영상미",
    description: (
      <>
        지금 감정이, 오래 지나도 낯설지 않도록
        <br />
        과한 연출과 인위적 촬영보다는
        <br />
        느낌과 분위기를 살린 감정이 실린 영상을 만듭니다.
        <br />
        한 번 보고 끝나는 영상이 아니라,
        <br />
        <span className="text-white font-medium">10년 후에도 더 따뜻해지는 영상</span>이 되길 바랍니다.
      </>
    ),
  },
  {
    title: "기록이 아닌,",
    titleHighlight: "기억을 담기 위해",
    description: (
      <>
        예식장의 분위기, 드레스, 부케, 메이크업 하나
        <br />
        흘려보지 않고 담아냅니다.
        <br />
        가장 예쁜 모습의 기억을 남겨드리기 위한 사명감이 있기에
        <br />
        우리가 <span className="text-white font-medium">영화처럼 촬영, 색감/피부보정, 편집</span>하는 이유입니다.
      </>
    ),
  },
  {
    title: "외주 없이,",
    titleHighlight: "끝까지 직접",
    description: (
      <>
        라우브필름의 영상은 알바 인력이 아닌
        <br />
        전속 감독과 대표의 손끝에서 완성됩니다.
        <br />
        전문화된 교육과정을 통과한 감독님들로 구성되어 촬영하며
        <br />
        자연스럽게 흐르도록 편집합니다.
        <br />
        <span className="text-white font-medium">오래 기억에 남는 영상</span>은 수많은 고민 끝에 만들어집니다.
      </>
    ),
  },
  {
    title: "시간이 지나도",
    titleHighlight: "선명한 고화질로",
    description: (
      <>
        결혼식은 짧지만,
        <br />
        기억을 담은 영상은 평생갑니다.
        <br />
        라우브필름은 그 하루가 흐릿해지지 않도록,
        <br />
        선명한 화질인 4K와 천만원이 넘는 장비들로 작업됩니다.
        <br />
        지금보다 시간이 지날수록 소중해지는 영상
        <br />
        그래서 우리는 <span className="text-white font-medium">시간이 지나도 소중한 영상</span>을 만듭니다.
      </>
    ),
  },
];

export default function AboutPage() {
  const [aboutImage, setAboutImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/site-images")
      .then((res) => res.json())
      .then((data: Record<string, { secureUrl?: string }>) => {
        if (data["about"]?.secureUrl) {
          setAboutImage(data["about"].secureUrl);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen py-20 px-6 md:py-20">
      <div className="mx-auto max-w-5xl">
        {/* About 이미지 (관리자 사이트 이미지에서 'About 이미지'로 설정) */}
        {aboutImage && (
          <div className="relative w-full aspect-[16/9] max-h-[400px] rounded-xl overflow-hidden mb-12 bg-muted">
            <Image
              src={aboutImage}
              alt="About"
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {/* Main Title */}
        <h1 className="text-center text-2xl md:text-3xl font-medium text-accent mb-15 leading-relaxed tracking-tight">
          &apos;감정을 영원히 보존할 수 있게 기억을 담는 일을 합니다.&apos;
        </h1>
        
        {/* Hero Content */}
        <div className="flex justify-center items-center mb-15">
          <div className="text-center max-w-3xl">
            <p className="text-lg leading-loose text-muted-foreground font-light mb-7 mobile-br-hidden">
              단순히 카메라를 들고 촬영하는 사람이 아닌.
              <br />
              특별한 날의 모습과 감정을 이해하고
              <br />
              가장 아름다운 방식으로 기억하는 스토리텔러입니다.
            </p>
          </div>
        </div>
        
        {/* Divider */}
        <div className="flex items-center justify-center my-15 h-5">
          <div className="flex-1 h-px bg-[#444444]" />
          <div className="w-2 h-2 bg-accent rotate-45 mx-5 flex-shrink-0" />
          <div className="flex-1 h-px bg-[#444444]" />
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-transparent rounded-lg p-9 md:p-10 border border-border transition-all duration-200 hover:-translate-y-1 hover:border-accent cursor-default"
            >
              <h2 className="text-xl font-semibold text-white mb-5 leading-snug tracking-tight">
                {card.title} <span className="text-accent font-semibold">{card.titleHighlight}</span>
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground font-light mobile-br-hidden">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
