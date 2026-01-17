import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 포트폴리오 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const portfolioId = parseInt(id);

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

// PUT: 포트폴리오 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const portfolioId = parseInt(id);
    const body = await request.json();
    const { title, youtubeUrl, category, featured, description, isVisible, order } = body;

    const portfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        ...(title && { title }),
        ...(youtubeUrl && { youtubeUrl }),
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

// DELETE: 포트폴리오 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const portfolioId = parseInt(id);

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
