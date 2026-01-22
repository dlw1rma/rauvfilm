import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { generateSessionToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * 관리자 회원가입 API
 * 시크릿키 검증 후 계정 생성
 */

// 환경변수에서 시크릿키 가져오기 (필수)
function getAdminSecretKey(): string {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "ADMIN_SECRET_KEY 환경변수가 설정되지 않았습니다. 프로덕션 환경에서는 반드시 설정해야 합니다."
    );
  }
  return secret;
}

// POST: 회원가입
export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용 (15분에 3회 제한 - 회원가입은 더 엄격하게)
    const rateLimitResponse = rateLimit(request, 3, 15 * 60 * 1000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, password, name, secretKey } = body;

    // 필수 필드 검증
    if (!email || !password || !secretKey) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 시크릿키를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 최소 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 시크릿키 검증
    const validSecretKey = getAdminSecretKey();
    if (secretKey !== validSecretKey) {
      return NextResponse.json(
        { error: "시크릿키가 올바르지 않습니다." },
        { status: 401 }
      );
    }


    // 이미 존재하는 이메일인지 확인
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 계정 생성
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // 회원가입 성공 시 자동 로그인
    const sessionToken = generateSessionToken();
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24시간
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다.",
        admin,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // 구체적인 에러 메시지 반환
    if (error.message?.includes("ADMIN_SECRET_KEY")) {
      return NextResponse.json(
        { error: "서버 설정 오류: ADMIN_SECRET_KEY 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // Prisma 에러 처리
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      );
    }

    if (error.code === "P1001" || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        { error: "데이터베이스 연결 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // Prisma 모델이 없을 때 (마이그레이션 미실행)
    if (error.message?.includes("Unknown model") || error.message?.includes("admin")) {
      return NextResponse.json(
        { error: "데이터베이스 마이그레이션이 필요합니다. Prisma 마이그레이션을 실행해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "회원가입 처리 중 오류가 발생했습니다.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
