"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const travelCostData = {
  seoul: [
    { price: "33,000원", value: 33000, locations: ["구리", "분당", "성남(야탑)", "판교", "안양", "과천", "광명", "시흥", "부천", "부평", "군포", "용인", "수원", "인천", "경기도 광주"] },
    { price: "55,000원", value: 55000, locations: ["안산", "이천", "의정부", "김포", "남양주", "화성", "파주", "의왕", "일산"] },
    { price: "77,000원", value: 77000, locations: ["여주", "안성", "오산", "평택", "강화", "양평", "가평"] },
    { price: "165,000원", value: 165000, locations: ["연천", "홍천", "충주", "청주", "아산", "당진", "서산", "천안", "춘천", "원주"] },
    { price: "187,000원", value: 187000, locations: ["철원"] },
    { price: "275,000원", value: 275000, locations: ["논산", "제천", "인제", "영월", "대전", "부여", "양양"] },
    { price: "330,000원", value: 330000, locations: ["강릉", "상주", "구미", "정읍", "안동", "전주"] },
    { price: "440,000원", value: 440000, locations: ["포항", "경주", "대구", "광주", "속초", "동해", "삼척"] },
    { price: "550,000원", value: 550000, locations: ["부산", "목포", "해남", "울산", "거제", "여수", "창원", "마산"] },
  ],
  cheongju: [
    { price: "55,000원", value: 55000, locations: ["대전", "천안", "세종", "아산", "진천"] },
    { price: "110,000원", value: 110000, locations: ["평택", "안성", "문경", "제천", "충주", "공주", "이천", "오산", "상주"] },
    { price: "165,000원", value: 165000, locations: ["논산", "부여", "서산", "여주", "군산", "익산", "전주", "수원", "용인", "화성", "김천", "안양", "성남"] },
    { price: "220,000원", value: 220000, locations: ["원주", "제천", "대구", "서울", "의정부", "인천"] },
    { price: "275,000원", value: 275000, locations: ["광주", "가평", "평창"] },
    { price: "330,000원", value: 330000, locations: ["춘천"] },
    { price: "440,000원", value: 440000, locations: ["삼척", "강릉"] },
    { price: "550,000원", value: 550000, locations: ["속초", "부산", "목포", "해남", "울산", "거제", "여수", "창원", "마산"] },
  ],
};

type Tab = "seoul" | "cheongju";
type PriceGroup = { price: string; value: number; locations: string[] };

export default function TravelCostGuide() {
  const [tab, setTab] = useState<Tab>("seoul");
  const [query, setQuery] = useState("");

  const data: PriceGroup[] = travelCostData[tab];

  // 검색어에 매칭되는 첫 번째 결과 (상단 강조 카드용)
  const matchResult = useMemo(() => {
    if (!query.trim()) return null;
    for (const group of data) {
      for (const loc of group.locations) {
        if (loc.includes(query.trim())) {
          return { location: loc, price: group.price };
        }
      }
    }
    return null;
  }, [query, data]);

  // 필터링된 그룹 목록
  const filtered = useMemo(() => {
    if (!query.trim()) return data.map((g) => ({ ...g }));
    return data
      .map((group) => {
        const matching = group.locations.filter((loc) => loc.includes(query.trim()));
        if (matching.length === 0) return null;
        return { ...group, locations: matching };
      })
      .filter(Boolean) as PriceGroup[];
  }, [query, data]);

  const handleTabSwitch = (t: Tab) => {
    setTab(t);
    setQuery("");
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#111111] via-[#0a0a0a] to-[#111111]">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <span className="inline-block mb-3 text-xs font-medium tracking-widest text-accent uppercase">
            Travel Fee
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            지역별 출장비 안내
          </h2>
          <p className="text-white/50 text-sm sm:text-base">
            거점 지역을 선택한 뒤, 촬영 지역을 검색해 보세요.
          </p>
        </div>

        {/* 탭 토글 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1 gap-1">
            <button
              onClick={() => handleTabSwitch("seoul")}
              className={`rounded-full px-6 sm:px-8 py-2.5 text-sm font-semibold transition-all duration-200 ${
                tab === "seoul"
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              서울 기준
            </button>
            <button
              onClick={() => handleTabSwitch("cheongju")}
              className={`rounded-full px-6 sm:px-8 py-2.5 text-sm font-semibold transition-all duration-200 ${
                tab === "cheongju"
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              청주 기준
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="지역명을 입력해 주세요 (예: 부산, 강릉)"
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-white/10 bg-white/5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <svg
                className="w-4 h-4 text-white/30 hover:text-white/60 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* 검색 결과 강조 카드 */}
        {query.trim() && matchResult && (
          <div className="mb-8 p-5 rounded-2xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-sm text-white/50 mb-1">
              <span className="font-medium">
                {tab === "seoul" ? "서울" : "청주"} 기준
              </span>
              {" → "}
              <span className="font-semibold text-white">
                {matchResult.location}
              </span>
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-accent">
              {matchResult.price}
            </p>
          </div>
        )}

        {/* 결과 없음 */}
        {query.trim() && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <svg
                className="w-7 h-7 text-white/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">
              검색된 지역이 없습니다.
            </p>
            <p className="text-white/40 text-sm mb-5">
              기재되지 않은 곳은 별도 협의가 필요합니다.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              문의하기
            </Link>
          </div>
        )}

        {/* 가격별 그룹 카드 목록 */}
        {filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((group) => (
              <div
                key={group.price}
                className="rounded-2xl border border-white/5 bg-[#151515] overflow-hidden"
              >
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
                  <span className="inline-flex items-center justify-center min-w-[100px] px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-bold text-sm">
                    {group.price}
                  </span>
                  <span className="text-xs text-white/30">
                    {group.locations.length}개 지역
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed">
                    {group.locations.map((loc, i) => {
                      const isMatch =
                        query.trim() && loc.includes(query.trim());
                      return (
                        <span key={loc}>
                          <span
                            className={isMatch ? "text-accent font-semibold" : "text-white/60"}
                          >
                            {loc}
                          </span>
                          {i < group.locations.length - 1 && (
                            <span className="text-white/20">, </span>
                          )}
                        </span>
                      );
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-10 pt-6 border-t border-white/5">
          <div className="flex items-start gap-2 text-xs sm:text-sm text-white/30">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="space-y-1">
              <p>제주도는 항공편 별도 문의가 필요합니다.</p>
              <p>
                위 출장비는 수도권/충청권 외 지역에 해당하며, 촬영 거리 및
                상황에 따라 변동될 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
