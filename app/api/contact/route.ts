import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { safeParseInt, sanitizeString, normalizePhone, isValidEmail } from "@/lib/validation";

// POST: 문의 제출
export async function POST(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 5, 15 * 60 * 1000); // 15분에 5회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { name, phone, email, weddingDate, message } = body;

    // 입력 검증 및 sanitization
    const sanitizedName = sanitizeString(name, 50);
    const normalizedPhone = normalizePhone(phone);
    const sanitizedEmail = email ? sanitizeString(email, 255) : null;
    const sanitizedMessage = sanitizeString(message, 5000);

    // 유효성 검사
    if (!sanitizedName || !normalizedPhone || !sanitizedMessage) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    // 전화번호 길이 검증
    if (normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 이메일 검증
    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name: sanitizedName,
        phone: normalizedPhone,
        email: sanitizedEmail,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        message: sanitizedMessage,
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
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = safeParseInt(searchParams.get("page"), 1, 1, 1000);
    const limit = safeParseInt(searchParams.get("limit"), 20, 1, 100);
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
