/**
 * 관리자 - 야외스냅/프리웨딩 신청 단건
 * GET: 상세, PATCH: 상태/메모 수정
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResponse = await requireAdminAuth(request);
    if (authResponse) return authResponse;

    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
    }

    const row = await prisma.eventSnapApplication.findUnique({
      where: { id },
    });

    if (!row) {
      return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (e) {
    console.error("[admin event-snap-applications GET id]", e);
    return NextResponse.json(
      { error: "조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResponse = await requireAdminAuth(request);
    if (authResponse) return authResponse;

    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const status = body.status;
    const adminNote = body.adminNote;

    const data: { status?: string; adminNote?: string | null } = {};
    if (status !== undefined) {
      const s = String(status).trim();
      if (["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(s)) {
        data.status = s;
      }
    }
    if (adminNote !== undefined) {
      data.adminNote = String(adminNote).trim() || null;
    }

    const updated = await prisma.eventSnapApplication.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[admin event-snap-applications PATCH id]", e);
    return NextResponse.json(
      { error: "수정에 실패했습니다." },
      { status: 500 }
    );
  }
}
