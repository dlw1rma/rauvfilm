import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { safeParseInt, sanitizeString, isValidUrl } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 리뷰 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    if (reviewId === 0) {
      return NextResponse.json(
        { error: "잘못된 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "리뷰 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 리뷰 수정 (관리자만 가능)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const prisma = getPrisma();
    const { id } = await params;
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    if (reviewId === 0) {
      return NextResponse.json(
        { error: "잘못된 리뷰 ID입니다." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { title, excerpt, sourceUrl, sourceType, author, isVisible, order, imageUrl } = body;

    // 입력 검증
    if (sourceUrl && !isValidUrl(sourceUrl)) {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(title && { title: sanitizeString(title, 200) }),
        ...(excerpt !== undefined && { excerpt: excerpt ? sanitizeString(excerpt, 1000) : null }),
        ...(sourceUrl && { sourceUrl: sanitizeString(sourceUrl, 2000) }),
        ...(sourceType && { sourceType }),
        ...(author !== undefined && { author }),
        ...(typeof isVisible === "boolean" && { isVisible }),
        ...(typeof order === "number" && { order }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "리뷰 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 리뷰 삭제 (관리자만 가능)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const prisma = getPrisma();
    const { id } = await params;
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    if (reviewId === 0) {
      return NextResponse.json(
        { error: "잘못된 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "리뷰 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
