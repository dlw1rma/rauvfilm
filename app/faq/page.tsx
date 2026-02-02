"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "하이라이트 영상은 무엇인가요?",
    answer:
      "2~3분 길이의 영상으로, 예식 간의 중요한 장면만 모아서 뮤직비디오 형식으로 제작된 영상입니다.",
  },
  {
    question: "기록 영상은 길이가 얼마나 되나요?",
    answer:
      "신부대기실부터 원판까지 전부 담아드리고 있습니다. 따라서 신부님들마다 진행되는 상황이 상이하기에 통상적으로 30분~1시간 30분 정도의 길이입니다.\n\n다만 1인 1캠 기록영상은 1개의 카메라로 진행되다 보니, 본식이 너무 짧은 경우 안내된 영상 길이가 미달일 수 있습니다.",
  },
  {
    question: "SNS영상은 무엇인가요?",
    answer:
      "인스타 스토리나 릴스에 올리실 수 있는 30초~1분 길이의 영상을 4K 화질, 세로비율로 제작해드리고 있습니다.",
  },
  {
    question: "영상은 언제 받을 수 있나요?",
    answer:
      "순차대로 정성드려 작업하고 있기에, 예식 올리신 날로부터 3개월 이내에 전달드리고 있습니다.",
  },
  {
    question: "원본 영상 받을 수 있나요?",
    answer:
      "4K로 촬영하고 있어 원본 영상이 70GB 이상으로 고용량이라 전달에 어려움이 있고, 편집을 위한 형식으로 촬영되기에 일반적인 방법으로는 시청이 어려워 전달드리지 않고 있습니다.\n\n기본적으로 기록영상에 예식 전반적인 과정이 포함되어 전달되기에 별도로 구매하실 필요는 없습니다.\n\n만약 신랑신부님들이 직접 편집 후 SNS, 유튜브 계정 업로드를 위해 원본을 원하시는 경우 5만원의 추가금이 발생하며, 이는 편하게 사용하실 수 있게 변환하는 과정과 사용법 안내 가이드, 전달드리는 USB or 클라우드 비용입니다.",
  },
  {
    question: "원하는 편집 형식이 있는데 맞춰서 제작해주실 수 있나요?",
    answer:
      "참고영상 전달주시면 가능한 맞춰서 진행드리고 있으며, 내용에 따라서 추가비용이 발생할 수 있는 점 안내드립니다.",
  },
  {
    question: "작가님은 언제 예식장에 도착하시나요?",
    answer:
      "예식 시작 1시간 30분 전부터 도착하고 있으며, 선원판 진행 시 2시간 정도 일찍 도착하고 있습니다.\n\n촬영 시작은 예식 1시간 전 신부대기실부터 시작됩니다.\n\n(선원판 진행 시 1시간 30분 전 선원판부터 촬영됩니다.)\n(선원판과 연출촬영은 예식장과 신부대기실 이외 다른 곳에서 진행 시 사전에 말씀주셔야 하며, 미리 말씀해 주시지 않거나 장소 여건 상 제한 시 촬영이 안될 수 있습니다.)",
  },
  {
    question: "현금영수증 발급 가능한가요?",
    answer:
      "별도의 금액 추가 없이 모든 상품의 발급 가능합니다.\n(25. 05. 01. 계약자부터)",
  },
  {
    question: "출장비는 발생하나요?",
    answer:
      "서울 인근에 본점이 위치하고 있으며, 최근 청주점을 오픈하여 서울과 청주 이외의 도시는 출장비가 발생합니다.\n\n이외 지역 출장비는 예식장으로부터 가까운 곳으로 산출되며, 가까운 지점의 감독님 배정이 전부 완료되어 어려운 경우 거리가 먼 지역의 감독님이 배정되기에 출장비 가격이 오를 수 있습니다.",
  },
  {
    question: "[기본형]에 SNS영상을 추가하고 싶어요!",
    answer:
      "추가 가능하시며, 본래 제공사항이 아니기에 추가금이 발생하실 수 있는 점 양해 부탁드립니다.",
  },
  {
    question: "촬영 전 최종연락은 언제 주시나요?",
    answer:
      "예식 올리시는 주 월요일이나 화요일에 유선으로 연락드리고 있으며, 연락을 받지 못하셨을 경우 필히 카카오톡이나 전화로 연락 부탁드리겠습니다.",
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
