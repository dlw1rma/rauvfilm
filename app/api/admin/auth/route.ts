import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateSessionToken,
  validateSessionToken,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// POST: 로그인
export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용 (15분에 5회 제한)
    const rateLimitResponse = rateLimit(request, 5, 15 * 60 * 1000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 검증 (bcrypt)
    const isValid = await verifyPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "비밀번호가 올바르지 않습니다." },
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
      message: "로그인 성공"
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
