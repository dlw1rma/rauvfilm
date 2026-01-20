import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

/**
 * Cloudtype 운영 점검용 헬스 체크
 * - DATABASE_URL 주입 여부
 * - DB 연결 가능 여부 (가벼운 SELECT 1)
 *
 * 주의: 이 엔드포인트는 내부 모니터링용으로만 사용하세요.
 */
export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;

  if (!hasDatabaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        env: { DATABASE_URL: false },
        error: "Environment variable not found: DATABASE_URL",
      },
      { status: 500 }
    );
  }

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, env: { DATABASE_URL: true }, db: "ok" });
  } catch (error) {
    console.error("Health check DB error:", error);
    return NextResponse.json(
      { ok: false, env: { DATABASE_URL: true }, db: "error" },
      { status: 500 }
    );
  }
}

