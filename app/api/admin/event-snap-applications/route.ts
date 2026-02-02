/**
 * 관리자 - 야외스냅/프리웨딩 신청 목록
 * GET: 전체 신청 목록
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResponse = await requireAdminAuth(request);
    if (authResponse) return authResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: { status?: string; type?: string } = {};
    if (status && status.trim()) where.status = status.trim();
    if (type && (type === "야외스냅" || type === "프리웨딩")) where.type = type;

    const list = await prisma.eventSnapApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(list);
  } catch (e) {
    console.error("[admin event-snap-applications GET]", e);
    return NextResponse.json(
      { error: "목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
