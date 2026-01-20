import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// POST: 문의 제출
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const { name, phone, email, weddingDate, message } = body;

    // 유효성 검사
    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 형식 검사 (간단한 검증)
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(phone.replace(/-/g, ""))) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        email: email || null,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        message,
      },
    });

    // TODO: 이메일 알림 발송 기능 추가 가능

    return NextResponse.json(
      { message: "문의가 성공적으로 접수되었습니다.", id: contact.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "문의 접수에 실패했습니다." },
      { status: 500 }
    );
  }
}

// GET: 문의 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // TODO: 관리자 인증 확인 필요

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contact.count(),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "문의 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
