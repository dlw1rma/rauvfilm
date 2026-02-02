import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}

// GET: 출장비 기준 목록
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");

  const where = branch ? { branch } : {};

  const rules = await prisma.travelFeeRule.findMany({
    where,
    orderBy: [{ region: "asc" }, { district: "asc" }],
  });

  return NextResponse.json({ rules });
}

// POST: 출장비 기준 추가
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { branch, region, district, fee } = body;

    if (!branch || !region || fee === undefined) {
      return NextResponse.json(
        { error: "지점, 지역, 금액은 필수입니다." },
        { status: 400 }
      );
    }

    // 중복 체크
    const existing = await prisma.travelFeeRule.findFirst({
      where: {
        branch,
        region,
        district: district || null,
        isActive: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 동일한 지역 기준이 등록되어 있습니다." },
        { status: 409 }
      );
    }

    const rule = await prisma.travelFeeRule.create({
      data: {
        branch,
        region,
        district: district || null,
        fee: parseInt(String(fee), 10),
        isActive: true,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Travel fee create error:", error);
    return NextResponse.json(
      { error: "출장비 기준 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 출장비 기준 수정
export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, fee, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    const data: { fee?: number; isActive?: boolean } = {};
    if (fee !== undefined) data.fee = parseInt(String(fee), 10);
    if (isActive !== undefined) data.isActive = isActive;

    const rule = await prisma.travelFeeRule.update({
      where: { id: parseInt(String(id), 10) },
      data,
    });

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Travel fee update error:", error);
    return NextResponse.json(
      { error: "출장비 기준 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 출장비 기준 삭제
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
  }

  try {
    await prisma.travelFeeRule.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("Travel fee delete error:", error);
    return NextResponse.json(
      { error: "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
