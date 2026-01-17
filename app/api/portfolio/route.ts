import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: 포트폴리오 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: {
      isVisible: boolean;
      category?: string;
      featured?: boolean;
    } = {
      isVisible: true,
    };

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

    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { error: "포트폴리오를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
