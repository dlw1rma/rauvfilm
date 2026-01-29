/**
 * 마이페이지 - 야외스냅/프리웨딩 신청
 * GET: 내 신청 목록, POST: 신청 등록
 */

import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const list = await prisma.eventSnapApplication.findMany({
      where: { reservationId: session.reservationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(list);
  } catch (e) {
    console.error("[mypage event-snap-applications GET]", e);
    return NextResponse.json(
      { error: "신청 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const type = (body.type === "야외스냅" || body.type === "프리웨딩") ? body.type : null;
    if (!type) {
      return NextResponse.json(
        { error: "신청 종류를 선택해주세요. (야외스냅 또는 프리웨딩)" },
        { status: 400 }
      );
    }

    const customerName = String(body.customerName ?? session.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? session.customerPhone ?? "").trim();
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "성함과 연락처는 필수입니다." },
        { status: 400 }
      );
    }

    if (!session.reservationId) {
      return NextResponse.json(
        { error: "예약 정보가 연결되지 않았습니다. 마이페이지 로그인 후 다시 시도해주세요." },
        { status: 400 }
      );
    }

    const application = await prisma.eventSnapApplication.create({
      data: {
        reservationId: session.reservationId,
        type,
        customerName,
        customerPhone,
        customerEmail: body.customerEmail ? String(body.customerEmail).trim() : null,
        shootLocation: body.shootLocation ? String(body.shootLocation).trim() : null,
        shootDate: body.shootDate ? String(body.shootDate).trim() : null,
        shootTime: body.shootTime ? String(body.shootTime).trim() : null,
        shootConcept: body.shootConcept ? String(body.shootConcept).trim() : null,
        specialNotes: body.specialNotes ? String(body.specialNotes).trim() : null,
        status: "PENDING",
      },
    });

    return NextResponse.json(application);
  } catch (e) {
    console.error("[mypage event-snap-applications POST]", e);
    return NextResponse.json(
      { error: "신청 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
