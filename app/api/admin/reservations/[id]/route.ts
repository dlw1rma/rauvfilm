import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 관리자용 예약 상세 조회 (모든 필드 포함)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 인증 확인
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reply: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비밀번호 제외하고 반환
    const { password, ...reservationWithoutPassword } = reservation;

    return NextResponse.json(reservationWithoutPassword);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "예약 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
