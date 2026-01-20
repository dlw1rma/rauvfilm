"use client";

import React from "react";

const steps = [
  {
    number: 1,
    icon: "💬",
    label: "카카오톡 채널로",
    text: "촬영 가능여부 확인",
  },
  {
    number: 2,
    icon: "📋",
    label: "계약 희망 시 카카오톡 채널로",
    text: "예약방법 안내 받기",
  },
  {
    number: 3,
    icon: "✉️",
    label: "안내 따라서 완료 후",
    text: "확정문자와 계약서 받기",
  },
];

export default function ReservationProcessPage() {
  return (
    <div className="min-h-screen py-20 px-4 md:py-20">
      <div className="mx-auto max-w-5xl">
        {/* Title */}
        <div className="mb-4 text-center">
          <h1 className="relative inline-block text-3xl md:text-4xl font-bold text-white pb-4">
            예약절차
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-15 h-0.5 bg-accent" />
          </h1>
        </div>
        
        <p className="text-center text-muted-foreground text-base font-medium mb-15">
          간단한 3단계로 예약이 완료됩니다
        </p>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 relative">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Step Card */}
              <div className="relative bg-muted rounded-2xl p-10 text-center border border-border transition-all duration-300 hover:border-accent hover:-translate-y-1">
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#222222] flex items-center justify-center text-4xl">
                  {step.icon}
                </div>
                
                {/* Label */}
                <p className="text-accent text-xs font-semibold mb-2">
                  {step.label}
                </p>
                
                {/* Main Text */}
                <p className="text-white text-lg font-bold leading-relaxed">
                  {step.text}
                </p>
              </div>
              
              {/* Arrow (Desktop) */}
              {index < steps.length - 1 && (
                <>
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-[#444444] text-2xl font-light z-10">
                    →
                  </div>
                  {/* Mobile Arrow */}
                  <div className="md:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 text-[#444444] text-2xl font-light">
                    ↓
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
