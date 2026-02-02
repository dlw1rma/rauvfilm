"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={cn("w-full", className)}>
      {/* 탭 버튼 영역 */}
      <div className="flex justify-center border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-8 py-4 text-sm font-medium tracking-wider transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {/* 활성 인디케이터 */}
            <span
              className={cn(
                "absolute bottom-0 left-0 h-0.5 w-full bg-accent",
                "transition-transform duration-300 ease-out origin-center",
                activeTab === tab.id ? "scale-x-100" : "scale-x-0"
              )}
            />
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div className="relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "transition-all duration-300 ease-out",
              activeTab === tab.id
                ? "opacity-100 translate-y-0"
                : "hidden opacity-0"
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
