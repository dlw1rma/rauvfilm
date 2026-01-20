import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateSessionToken,
  validateSessionToken,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST: 로그인 (이메일/비밀번호)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용 (15분에 5회 제한)
    const rateLimitResponse = rateLimit(request, 5, 15 * 60 * 1000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // 관리자 계정 조회
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    });

    // 타이밍 공격 방지: 계정 존재 여부와 관계없이 항상 bcrypt.compare 실행
    // 더미 해시를 사용하여 동일한 시간 소요
    const dummyHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    const passwordToCompare = admin?.password || dummyHash;
    
    // 비밀번호 검증 (항상 실행하여 타이밍 공격 방지)
    const isValid = await bcrypt.compare(password, passwordToCompare);

    if (!admin || !isValid) {
      // 실패한 로그인 시도 로깅 (보안 모니터링)
      console.warn(`[SECURITY] Failed login attempt for email: ${email} from IP: ${request.headers.get("x-forwarded-for") || "unknown"}`);
      
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 세션 토큰 생성
    const sessionToken = generateSessionToken();

    // 쿠키에 세션 토큰 저장
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24시간
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "로그인 성공",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// GET: 세션 확인
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

// DELETE: 로그아웃
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");

    return NextResponse.json({
      success: true,
      message: "로그아웃 되었습니다."
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "로그아웃 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
