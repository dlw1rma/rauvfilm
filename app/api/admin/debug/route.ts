import { NextResponse } from "next/server";

/**
 * 디버깅용 엔드포인트 - 환경변수 로드 상태 확인
 * 프로덕션에서는 제거하거나 보호해야 합니다.
 */
export async function GET() {
  const hasHash = !!process.env.ADMIN_PASSWORD_HASH;
  const hashLength = process.env.ADMIN_PASSWORD_HASH?.length || 0;
  const hashPrefix = process.env.ADMIN_PASSWORD_HASH?.substring(0, 20) || "없음";
  const hasSecret = !!process.env.SESSION_SECRET;
  const secretLength = process.env.SESSION_SECRET?.length || 0;

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    adminPasswordHash: {
      exists: hasHash,
      length: hashLength,
      prefix: hashPrefix,
      full: process.env.ADMIN_PASSWORD_HASH || "설정되지 않음",
    },
    sessionSecret: {
      exists: hasSecret,
      length: secretLength,
      prefix: process.env.SESSION_SECRET?.substring(0, 10) || "없음",
    },
    allEnvKeys: Object.keys(process.env)
      .filter((key) => key.includes("ADMIN") || key.includes("SESSION"))
      .sort(),
  });
}
