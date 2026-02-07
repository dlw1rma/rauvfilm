"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface AboutTranslations {
  mainQuote: string;
  heroText: string;
  card1Title: string;
  card1Highlight: string;
  card1Desc: string;
  card1Emphasis: string;
  card2Title: string;
  card2Highlight: string;
  card2Desc: string;
  card2Emphasis: string;
  card3Title: string;
  card3Highlight: string;
  card3Desc: string;
  card3Emphasis: string;
  card4Title: string;
  card4Highlight: string;
  card4Desc: string;
  card4Emphasis: string;
}

function renderTextWithBreaks(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));
}

function renderDescriptionWithEmphasis(
  desc: string,
  emphasis: string
): React.ReactNode {
  const emphasisIndex = desc.indexOf(emphasis);
  if (emphasisIndex === -1) {
    return renderTextWithBreaks(desc);
  }

  const before = desc.slice(0, emphasisIndex);
  const after = desc.slice(emphasisIndex + emphasis.length);

  return (
    <>
      {renderTextWithBreaks(before)}
      <span className="text-white font-medium">{emphasis}</span>
      {renderTextWithBreaks(after)}
    </>
  );
}

export default function AboutClient({
  translations: t,
}: {
  translations: AboutTranslations;
}) {
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

  const cards = [
    {
      title: t.card1Title,
      titleHighlight: t.card1Highlight,
      desc: t.card1Desc,
      emphasis: t.card1Emphasis,
    },
    {
      title: t.card2Title,
      titleHighlight: t.card2Highlight,
      desc: t.card2Desc,
      emphasis: t.card2Emphasis,
    },
    {
      title: t.card3Title,
      titleHighlight: t.card3Highlight,
      desc: t.card3Desc,
      emphasis: t.card3Emphasis,
    },
    {
      title: t.card4Title,
      titleHighlight: t.card4Highlight,
      desc: t.card4Desc,
      emphasis: t.card4Emphasis,
    },
  ];

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
          {t.mainQuote}
        </h1>

        {/* Hero Content */}
        <div className="flex justify-center items-center mb-15">
          <div className="text-center max-w-3xl">
            <p className="text-lg leading-loose text-muted-foreground font-light mb-7 mobile-br-hidden">
              {renderTextWithBreaks(t.heroText)}
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
                {card.title}{" "}
                <span className="text-accent font-semibold">
                  {card.titleHighlight}
                </span>
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground font-light mobile-br-hidden">
                {renderDescriptionWithEmphasis(card.desc, card.emphasis)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
