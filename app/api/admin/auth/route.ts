import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 환경변수에서 관리자 비밀번호 가져오기 (없으면 기본값 사용)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
const SESSION_SECRET = process.env.SESSION_SECRET || "rauvfilm-admin-secret-key";

// 간단한 세션 토큰 생성 (실제 프로덕션에서는 JWT나 더 안전한 방식 사용)
function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}-${SESSION_SECRET.substring(0, 8)}`;
}

// 세션 토큰 검증
function validateSessionToken(token: string): boolean {
  if (!token) return false;
  // 토큰이 올바른 형식인지 확인
  const parts = token.split("-");
  if (parts.length < 3) return false;
  // SECRET 부분 확인
  if (parts[2] !== SESSION_SECRET.substring(0, 8)) return false;
  // 타임스탬프 확인 (24시간 유효)
  const timestamp = parseInt(parts[0], 36);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return now - timestamp < twentyFourHours;
}

// POST: 로그인
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
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
