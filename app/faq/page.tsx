"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "예약은 어떻게 하나요?",
    answer:
      "홈페이지 예약 페이지 또는 카카오톡 채널을 통해 예약하실 수 있습니다. 예식일, 예식장, 원하시는 상품을 말씀해 주시면 상담을 도와드립니다.",
  },
  {
    question: "촬영 당일 주의사항이 있나요?",
    answer:
      "특별한 주의사항은 없습니다. 저희가 예식 흐름에 맞춰 자연스럽게 촬영하기 때문에 편하게 예식에 집중하시면 됩니다. 다만, 촬영을 원하시는 특별한 순간이 있다면 미리 말씀해 주세요.",
  },
  {
    question: "영상은 언제 받을 수 있나요?",
    answer:
      "본식 DVD는 예식 후 약 2-3주, 시네마틱 영상은 약 4-6주 정도 소요됩니다. 성수기에는 조금 더 걸릴 수 있으며, 정확한 일정은 상담 시 안내드립니다.",
  },
  {
    question: "수정 요청은 가능한가요?",
    answer:
      "영상 전달 후 1회에 한해 간단한 수정이 가능합니다. 배경음악 변경, 자막 수정 등 간단한 수정은 무료로 진행해 드립니다.",
  },
  {
    question: "계약금과 잔금은 어떻게 되나요?",
    answer:
      "계약금은 총 금액의 30%이며, 예약 확정 시 입금해 주시면 됩니다. 잔금은 예식 1주일 전까지 입금해 주시면 됩니다.",
  },
  {
    question: "취소 및 환불 정책은 어떻게 되나요?",
    answer:
      "예식일 30일 전 취소 시 계약금 전액 환불, 14일 전 취소 시 50% 환불, 7일 이내 취소 시 환불이 어렵습니다. 날짜 변경은 1회에 한해 무료로 가능합니다.",
  },
  {
    question: "야외 촬영도 가능한가요?",
    answer:
      "네, 가능합니다. EVENT SNAP 메뉴에서 촬영 가능한 야외 장소를 확인하실 수 있으며, 원하시는 장소가 있다면 별도 상담해 주세요.",
  },
  {
    question: "2인 캠, 3인 캠의 차이는 무엇인가요?",
    answer:
      "촬영자 수에 따라 다양한 앵글에서 촬영이 가능합니다. 2인 캠은 주요 순간을 두 가지 각도에서, 3인 캠은 더욱 풍부한 앵글로 촬영합니다. 예식장 규모와 예산에 맞게 선택하시면 됩니다.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-widest">FAQ</h1>
          <p className="text-lg text-muted-foreground">
            자주 묻는 질문을 모았습니다
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
                <div className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-muted-foreground">
            궁금한 점이 더 있으신가요?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://pf.kakao.com/_xlXAin/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#FEE500] px-8 text-base font-medium text-[#3C1E1E] transition-all hover:brightness-95 hover:-translate-y-1"
            >
              카카오톡 상담
            </a>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-base font-medium transition-all hover:bg-muted hover:-translate-y-1"
            >
              문의하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
