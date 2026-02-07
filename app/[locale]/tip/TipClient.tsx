"use client";

import React from "react";

interface TipTranslations {
  pageTitle: string;
  introLine1: string;
  introLine2: string;
  introLine3: string;
  section1Title: string;
  section1Highlight: string;
  section1HighlightDesc: string;
  section1ScreenLabel: string;
  section1ScreenDesc: string;
  section1ScreenSuffix: string;
  section1LightLabel: string;
  section1LightDesc: string;
  section1LightSuffix: string;
  section1OledNote: string;
  section1AppleTitle: string;
  section1AppleBrightness: string;
  section1AppleBrightnessValue: string;
  section1AppleToggle1: string;
  section1AppleToggle2: string;
  section1AppleToggleDesc: string;
  section1TvTitle: string;
  section1TvMode: string;
  section1TvDesc: string;
  section1TvSuffix: string;
  section1TvFallback: string;
  section1TvFallbackMode: string;
  section1TvFallbackSuffix: string;
  section2Title: string;
  section2Desc1: string;
  section2Desc1Line2: string;
  section2Desc2: string;
  section2Desc2Line2: string;
  section3Title: string;
  section3KakaoLabel: string;
  section3KakaoDesc: string;
  section3KakaoStep: string;
  section3KakaoToggle: string;
  section3KakaoSuffix: string;
  section3UsbLabel: string;
  section3UsbDesc: string;
  section3UsbStep: string;
  section3UsbCheck: string;
  section3UsbSuffix: string;
  section3LostNotice: string;
  section3LostDesc: string;
  section4Title: string;
  section4Intro: string;
  section4Item1Label: string;
  section4Item1Desc: string;
  section4Item2Label: string;
  section4Item2Desc: string;
  section4Item3Label: string;
  section4Item3Desc: string;
  section4Item4Label: string;
  section4Item4Desc: string;
  section4RequestLine1: string;
  section4RequestLine2: string;
  section4DeadlinePrefix: string;
  section4DeadlineValue: string;
  section4DeadlineSuffix: string;
  section5Title: string;
  section5InterviewLabel: string;
  section5InterviewDesc: string;
  section5InterviewNote: string;
  section5Intro: string;
  section5Tip1Prefix: string;
  section5Tip1Bold: string;
  section5Tip2Prefix: string;
  section5Tip2Bold: string;
  section5Tip3Prefix: string;
  section5Tip3Bold: string;
  section5Tip3Suffix: string;
  section5Disclaimer: string;
}

interface TipClientProps {
  translations: TipTranslations;
}

export default function TipClient({ translations: t }: TipClientProps) {
  const sections = [
    {
      number: "01",
      title: t.section1Title,
      content: (
        <>
          <p className="mb-6">
            <strong className="text-accent font-semibold">{t.section1Highlight}</strong>
            <br />
            {t.section1HighlightDesc}
          </p>

          <p className="mb-6">
            {t.section1ScreenDesc} <strong className="text-white font-semibold">{t.section1ScreenLabel}</strong>{t.section1ScreenSuffix}
            <br />
            {t.section1LightDesc} <strong className="text-white font-semibold">{t.section1LightLabel}</strong>{t.section1LightSuffix}
          </p>

          <p className="text-[#777777] text-sm font-medium leading-relaxed mt-4">
            {t.section1OledNote}
          </p>

          <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
            <p className="text-white text-base font-semibold mb-4">{t.section1AppleTitle}</p>
            <div className="bg-muted rounded-lg p-6 border-l-4 border-accent">
              <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
                {t.section1AppleBrightness} <strong className="text-white font-semibold">{t.section1AppleBrightnessValue}</strong>
              </p>
              <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
                <strong className="text-white font-semibold">{t.section1AppleToggle1}</strong> / <strong className="text-white font-semibold">{t.section1AppleToggle2}</strong>{t.section1AppleToggleDesc}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
            <p className="text-white text-base font-semibold mb-4">{t.section1TvTitle}</p>
            <div className="bg-muted rounded-lg p-6 border-l-4 border-accent">
              <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
                {t.section1TvDesc} <strong className="text-white font-semibold">{t.section1TvMode}</strong>{t.section1TvSuffix}<br />
                {t.section1TvFallback} <strong className="text-white font-semibold">{t.section1TvFallbackMode}</strong>{t.section1TvFallbackSuffix}
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      number: "02",
      title: t.section2Title,
      content: (
        <>
          <p className="mb-6">
            {t.section2Desc1}
            <br />
            {t.section2Desc1Line2}
          </p>

          <p className="mb-6">
            {t.section2Desc2}
            <br />
            {t.section2Desc2Line2}
          </p>
        </>
      ),
    },
    {
      number: "03",
      title: t.section3Title,
      content: (
        <>
          <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
              <strong className="text-white font-semibold">{t.section3KakaoLabel}</strong>{t.section3KakaoDesc}
            </p>
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
              {t.section3KakaoStep} <strong className="text-white font-semibold">{t.section3KakaoToggle}</strong>{t.section3KakaoSuffix}
            </p>
          </div>

          <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
              <strong className="text-white font-semibold">{t.section3UsbLabel}</strong>{t.section3UsbDesc}
            </p>
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
              {t.section3UsbStep} <strong className="text-white font-semibold">{t.section3UsbCheck}</strong>{t.section3UsbSuffix}
            </p>
          </div>

          <div className="bg-accent/8 border border-accent/25 rounded-lg p-6">
            <p className="text-[#dddddd] text-sm font-medium leading-relaxed mb-1.5">
              {t.section3LostNotice}
            </p>
            <p className="text-[#dddddd] text-sm font-medium leading-relaxed">
              {t.section3LostDesc}
            </p>
          </div>
        </>
      ),
    },
    {
      number: "04",
      title: t.section4Title,
      content: (
        <>
          <p className="mb-6">{t.section4Intro}</p>

          <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
            <ul className="list-none space-y-3.5">
              <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
                <span className="absolute left-0 text-accent font-bold">•</span>
                <strong className="text-white font-semibold">{t.section4Item1Label}</strong> {t.section4Item1Desc}
              </li>
              <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
                <span className="absolute left-0 text-accent font-bold">•</span>
                <strong className="text-white font-semibold">{t.section4Item2Label}</strong> {t.section4Item2Desc}
              </li>
              <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
                <span className="absolute left-0 text-accent font-bold">•</span>
                <strong className="text-white font-semibold">{t.section4Item3Label}</strong> {t.section4Item3Desc}
              </li>
              <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
                <span className="absolute left-0 text-accent font-bold">•</span>
                <strong className="text-white font-semibold">{t.section4Item4Label}</strong>{t.section4Item4Desc ? ` ${t.section4Item4Desc}` : ""}
              </li>
            </ul>
          </div>

          <p className="mb-6">
            {t.section4RequestLine1}
            <br />
            {t.section4RequestLine2}
          </p>

          <div className="bg-accent/8 border border-accent/25 rounded-lg p-6">
            <p className="text-[#dddddd] text-sm font-medium leading-relaxed">
              {t.section4DeadlinePrefix} <strong className="text-white font-semibold">{t.section4DeadlineValue}</strong> {t.section4DeadlineSuffix}
            </p>
          </div>
        </>
      ),
    },
    {
      number: "05",
      title: t.section5Title,
      content: (
        <>
          <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
              <strong className="text-white font-semibold">{t.section5InterviewLabel}</strong>{t.section5InterviewDesc}
            </p>
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
              {t.section5InterviewNote}
            </p>
          </div>

          <p className="mb-6">{t.section5Intro}</p>

          <ul className="list-none space-y-3.5 mb-6">
            <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
              <span className="absolute left-0 text-accent font-bold">•</span>
              {t.section5Tip1Prefix} <strong className="text-white font-semibold">{t.section5Tip1Bold}</strong>
            </li>
            <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
              <span className="absolute left-0 text-accent font-bold">•</span>
              {t.section5Tip2Prefix} <strong className="text-white font-semibold">{t.section5Tip2Bold}</strong>
            </li>
            <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
              <span className="absolute left-0 text-accent font-bold">•</span>
              {t.section5Tip3Prefix} <strong className="text-white font-semibold">{t.section5Tip3Bold}</strong>{t.section5Tip3Suffix ? ` ${t.section5Tip3Suffix}` : ""}
            </li>
          </ul>

          <p className="text-[#777777] text-sm font-medium leading-relaxed">
            {t.section5Disclaimer}
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-20 px-4 md:py-20">
      <div className="mx-auto max-w-3xl">
        {/* Title */}
        <div className="mb-15 text-center">
          <h1 className="relative inline-block text-3xl md:text-4xl font-bold text-white pb-5">
            {t.pageTitle}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-15 h-0.5 bg-accent" />
          </h1>
        </div>

        {/* Intro */}
        <div className="text-center mb-17 text-[#aaaaaa] text-base font-medium leading-loose mobile-br-hidden">
          {t.introLine1}
          <br />
          {t.introLine2}
          <br />
          {t.introLine3}
        </div>

        {/* Sections */}
        <div className="space-y-17">
          {sections.map((section, index) => (
            <div key={section.number}>
              {/* Section Title */}
              <h2 className="flex items-center gap-3.5 mb-6 text-xl md:text-2xl font-bold text-white">
                <span className="text-accent text-xl md:text-2xl font-bold">{section.number}</span>
                {section.title}
              </h2>

              {/* Section Content */}
              <div className="text-[#cccccc] text-base font-medium leading-loose mobile-br-hidden">
                {section.content}
              </div>

              {/* Divider */}
              {index < sections.length - 1 && (
                <div className="h-px bg-[#2a2a2a] my-12" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
