import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeParseInt, sanitizeString, isValidUrl } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 포트폴리오 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const portfolioId = safeParseInt(id, 0, 1, 2147483647);
    if (portfolioId === 0) {
      return NextResponse.json(
        { error: "잘못된 포트폴리오 ID입니다." },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "포트폴리오를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "포트폴리오 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 포트폴리오 수정 (관리자만 가능)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { id } = await params;
    const portfolioId = safeParseInt(id, 0, 1, 2147483647);
    if (portfolioId === 0) {
      return NextResponse.json(
        { error: "잘못된 포트폴리오 ID입니다." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { title, youtubeUrl, thumbnailUrl, category, featured, description, isVisible, order } = body;

    // URL 검증
    if (youtubeUrl && !isValidUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: "올바른 YouTube URL 형식이 아닙니다." },
        { status: 400 }
      );
    }
    if (thumbnailUrl && !isValidUrl(thumbnailUrl)) {
      return NextResponse.json(
        { error: "올바른 썸네일 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        ...(title && { title: sanitizeString(title, 200) }),
        ...(youtubeUrl && { youtubeUrl: sanitizeString(youtubeUrl, 2000) }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl: thumbnailUrl ? sanitizeString(thumbnailUrl, 2000) : null }),
        ...(category && { category }),
        ...(typeof featured === "boolean" && { featured }),
        ...(description !== undefined && { description }),
        ...(typeof isVisible === "boolean" && { isVisible }),
        ...(typeof order === "number" && { order }),
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { error: "포트폴리오 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 포트폴리오 삭제 (관리자만 가능)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { id } = await params;
    const portfolioId = safeParseInt(id, 0, 1, 2147483647);
    if (portfolioId === 0) {
      return NextResponse.json(
        { error: "잘못된 포트폴리오 ID입니다." },
        { status: 400 }
      );
    }

    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });

    return NextResponse.json({ message: "포트폴리오가 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return NextResponse.json(
      { error: "포트폴리오 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
