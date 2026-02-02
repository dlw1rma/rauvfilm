import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 포트폴리오 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const admin = searchParams.get("admin");

    const where: {
      isVisible?: boolean;
      category?: string;
      featured?: boolean;
    } = {};

    // admin=true인 경우 관리자 인증 필수
    if (admin === "true") {
      const { requireAdminAuth } = await import("@/lib/auth");
      const authResponse = await requireAdminAuth(request);
      if (authResponse) {
        // 인증 실패 시 공개 데이터만 반환
        where.isVisible = true;
      } else {
        // 관리자 인증 성공 시 모든 데이터
        // where는 빈 객체 유지
      }
    } else {
      // 관리자가 아닌 경우 공개된 것만
      where.isVisible = true;
    }

    if (category) {
      where.category = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    const portfolios = await prisma.portfolio.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const response = NextResponse.json({ portfolios });
    if (admin !== "true") {
      response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");
    }
    return response;
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { error: "포트폴리오를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 포트폴리오 등록 (관리자만 가능)
export async function POST(request: NextRequest) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const body = await request.json();
    const { title, youtubeUrl, thumbnailUrl, category, featured, description } = body;

    if (!title || !youtubeUrl) {
      return NextResponse.json(
        { error: "제목과 YouTube URL은 필수입니다." },
        { status: 400 }
      );
    }

    // 가장 큰 order 값 조회
    const maxOrder = await prisma.portfolio.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        youtubeUrl,
        thumbnailUrl: thumbnailUrl || null,
        category: category || "가성비형",
        featured: featured || false,
        description: description || null,
        order: (maxOrder?.order || 0) + 1,
        isVisible: true,
      },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json(
      { error: "포트폴리오 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
