import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// GET: 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin");

    // admin=true인 경우 관리자 인증 필수
    let where: { isVisible?: boolean } = { isVisible: true };
    if (admin === "true") {
      const { requireAdminAuth } = await import("@/lib/auth");
      const authResponse = await requireAdminAuth(request);
      if (authResponse) {
        return authResponse; // 인증 실패 시 공개 데이터만 반환
      }
      where = {}; // 관리자 인증 성공 시 모든 데이터
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "리뷰를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 리뷰 등록 (관리자만 가능)
export async function POST(request: NextRequest) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const prisma = getPrisma();
    const body = await request.json();
    const { title, excerpt, sourceUrl, sourceType, author, imageUrl } = body;

    if (!title || !sourceUrl) {
      return NextResponse.json(
        { error: "제목과 원본 URL은 필수입니다." },
        { status: 400 }
      );
    }

    // 가장 큰 order 값 조회
    const maxOrder = await prisma.review.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const review = await prisma.review.create({
      data: {
        title,
        excerpt: excerpt || null,
        sourceUrl,
        sourceType: sourceType || "naver_blog",
        author: author || null,
        imageUrl: imageUrl || null,
        order: (maxOrder?.order || 0) + 1,
        isVisible: true,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "리뷰 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
