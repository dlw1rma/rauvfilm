import "server-only";
import { NextRequest, NextResponse } from "next/server";

/**
 * 간단한 Rate Limiting 구현
 * 프로덕션에서는 Redis 등을 사용하는 것을 권장
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

// 메모리 기반 저장소 (프로덕션에서는 Redis 사용 권장)
const store: RateLimitStore = {};

// 주기적으로 오래된 항목 정리 (메모리 누수 방지)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetAt < now) {
        delete store[key];
      }
    });
  }, 60000); // 1분마다 정리
}

/**
 * Rate Limiting 미들웨어
 * @param request 요청 객체
 * @param maxRequests 최대 요청 수
 * @param windowMs 시간 윈도우 (밀리초)
 * @returns null이면 통과, NextResponse면 차단
 */
export function rateLimit(
  request: NextRequest,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 기본 15분
): NextResponse | null {
  // IP 주소 추출
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const key = `rate-limit:${ip}`;
  const now = Date.now();

  // 기존 기록 확인
  const record = store[key];

  if (!record || record.resetAt < now) {
    // 새 기록 생성
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return null; // 통과
  }

  // 요청 수 증가
  record.count++;

  if (record.count > maxRequests) {
    // 차단
    return NextResponse.json(
      {
        error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)),
        },
      }
    );
  }

  return null; // 통과
}
