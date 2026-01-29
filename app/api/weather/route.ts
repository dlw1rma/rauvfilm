/**
 * 날씨 API (Open-Meteo 프록시, API 키 불필요)
 * GET ?lat=37.5665&lon=126.978 (기본: 서울)
 * GET ?date=YYYY-MM-DD → 해당 날짜 예보 (16일 이내만 가능, 초과 시 tooFar)
 */

import { NextRequest, NextResponse } from "next/server";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";
const MAX_FORECAST_DAYS = 16;

const wmoToLabel: Record<number, string> = {
  0: "맑음",
  1: "대체로 맑음",
  2: "약간 흐림",
  3: "흐림",
  45: "안개",
  48: "서리 안개",
  51: "이슬비",
  53: "이슬비",
  55: "이슬비",
  61: "비",
  63: "비",
  65: "폭우",
  71: "눈",
  73: "눈",
  75: "폭설",
  77: "진눈깨비",
  80: "소나기",
  81: "소나기",
  82: "폭우",
  85: "눈 소나기",
  86: "눈 소나기",
  95: "뇌우",
  96: "뇌우",
  99: "뇌우",
};

function parseDate(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  return isNaN(d.getTime()) ? null : d;
}

function daysFromToday(target: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.ceil((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") ?? "37.5665";
    const lon = searchParams.get("lon") ?? "126.9780";
    const dateParam = searchParams.get("date");

    // date 없으면 오늘 기준 현재 날씨 (기존 동작)
    if (!dateParam || !dateParam.trim()) {
      const url = `${OPEN_METEO}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m&timezone=Asia%2FSeoul`;
      const res = await fetch(url, { next: { revalidate: 600 } });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: "날씨를 불러오지 못했습니다." }, { status: 502 });
      }
      const current = data.current;
      if (!current) {
        return NextResponse.json({ error: "날씨 데이터가 없습니다." }, { status: 502 });
      }
      const weatherCode = Number(current.weather_code) || 0;
      const label = wmoToLabel[weatherCode] ?? "알 수 없음";
      return NextResponse.json({
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        weatherCode,
        weatherLabel: label,
      });
    }

    const targetDate = parseDate(dateParam.trim());
    if (!targetDate) {
      return NextResponse.json({ error: "잘못된 날짜 형식입니다." }, { status: 400 });
    }

    const daysAhead = daysFromToday(targetDate);
    if (daysAhead > MAX_FORECAST_DAYS) {
      return NextResponse.json({
        tooFar: true,
        date: dateParam.trim(),
        message: "일정이 너무 멀어 아직 날씨 정보가 없습니다.",
      });
    }

    const url = `${OPEN_METEO}?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=${MAX_FORECAST_DAYS}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "날씨를 불러오지 못했습니다." }, { status: 502 });
    }

    const daily = data.daily;
    if (!daily || !Array.isArray(daily.time)) {
      return NextResponse.json({ error: "날씨 데이터가 없습니다." }, { status: 502 });
    }

    const want = dateParam.trim();
    const idx = daily.time.indexOf(want);
    if (idx === -1) {
      return NextResponse.json({
        tooFar: true,
        date: want,
        message: "일정이 너무 멀어 아직 날씨 정보가 없습니다.",
      });
    }

    const weatherCode = Number(daily.weather_code?.[idx]) ?? 0;
    const label = wmoToLabel[weatherCode] ?? "알 수 없음";
    const maxT = daily.temperature_2m_max?.[idx];
    const minT = daily.temperature_2m_min?.[idx];
    const temperature = maxT != null ? Number(maxT) : minT != null ? Number(minT) : null;

    return NextResponse.json({
      date: want,
      temperature,
      weatherCode,
      weatherLabel: label,
      temperatureMin: minT != null ? Number(minT) : undefined,
      temperatureMax: maxT != null ? Number(maxT) : undefined,
    });
  } catch (e) {
    console.error("[weather API]", e);
    return NextResponse.json(
      { error: "날씨를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
