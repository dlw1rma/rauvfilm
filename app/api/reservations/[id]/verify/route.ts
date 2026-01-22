import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { safeParseInt } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST: 비밀번호 확인
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting 적용 (브루트포스 공격 방지)
    const rateLimitResponse = rateLimit(request, 10, 15 * 60 * 1000); // 15분에 10회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { password: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, reservation.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다.", verified: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "비밀번호 확인에 실패했습니다." },
      { status: 500 }
    );
  }
}
