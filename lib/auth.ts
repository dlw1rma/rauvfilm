import "server-only";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * 보안 강화된 관리자 인증 유틸리티
 * - 환경변수 필수 검증
 * - 강력한 세션 토큰 생성 (crypto.randomBytes)
 * - 비밀번호 bcrypt 해싱
 */

// 환경변수 검증 (기본값 제거)
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `필수 환경변수가 설정되지 않았습니다: ${key}. 프로덕션 환경에서는 반드시 설정해야 합니다.`
    );
  }
  return value;
}

// 세션 시크릿키 (필수)
const SESSION_SECRET = getRequiredEnv("SESSION_SECRET");

// 세션 토큰 생성 (crypto.randomBytes 사용 - 암호학적으로 안전)
export function generateSessionToken(): string {
  // 32바이트 랜덤 데이터 생성
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Date.now();
  const payload = `${timestamp}-${randomBytes.toString("hex")}`;

  // HMAC으로 서명 생성
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest("hex");

  return `${payload}-${signature}`;
}

// 세션 토큰 검증
export function validateSessionToken(token: string): boolean {
  if (!token) return false;

  try {
    const parts = token.split("-");
    if (parts.length < 3) return false;

    // 서명 부분 분리
    const signature = parts[parts.length - 1];
    const payload = parts.slice(0, -1).join("-");

    // HMAC 검증
    const hmac = crypto.createHmac("sha256", SESSION_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    // 서명 불일치 시 거부
    if (signature !== expectedSignature) return false;

    // 타임스탬프 추출 및 만료 확인 (24시간)
    const timestamp = parseInt(payload.split("-")[0]);
    if (isNaN(timestamp)) return false;

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return now - timestamp < twentyFourHours;
  } catch {
    return false;
  }
}

// 비밀번호 해시 생성 헬퍼 (회원가입/비밀번호 변경용)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 서버 측 인증 미들웨어
export async function requireAdminAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    return null; // 인증 성공
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "인증 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 세션에서 관리자 정보 가져오기 (선택적)
export async function getAdminFromSession(): Promise<{ id: number; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return null;
    }

    // 실제로는 세션 토큰에 관리자 ID를 포함하거나 별도 세션 테이블에서 조회
    // 현재는 간단한 구현이므로 null 반환
    return null;
  } catch {
    return null;
  }
}
