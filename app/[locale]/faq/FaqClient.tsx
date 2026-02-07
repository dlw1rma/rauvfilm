"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaqTranslations {
  title: string;
  subtitle: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  q3: string;
  a3: string;
  q4: string;
  a4: string;
  q5: string;
  a5: string;
  q6: string;
  a6: string;
  q7: string;
  a7: string;
  q8: string;
  a8: string;
  q9: string;
  a9: string;
  q10: string;
  a10: string;
  q11: string;
  a11: string;
}

export default function FaqClient({
  translations: t,
}: {
  translations: FaqTranslations;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: t.q1, answer: t.a1 },
    { question: t.q2, answer: t.a2 },
    { question: t.q3, answer: t.a3 },
    { question: t.q4, answer: t.a4 },
    { question: t.q5, answer: t.a5 },
    { question: t.q6, answer: t.a6 },
    { question: t.q7, answer: t.a7 },
    { question: t.q8, answer: t.a8 },
    { question: t.q9, answer: t.a9 },
    { question: t.q10, answer: t.a10 },
    { question: t.q11, answer: t.a11 },
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-widest">{t.title}</h1>
          <p className="text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-muted overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <svg
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform text-muted-foreground",
                    openIndex === index && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="px-6 pb-6 text-muted-foreground whitespace-pre-line">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
