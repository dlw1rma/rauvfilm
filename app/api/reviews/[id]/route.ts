import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 리뷰 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

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

// PUT: 리뷰 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    const body = await request.json();
    const { title, excerpt, sourceUrl, sourceType, author, isVisible, order } = body;

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(title && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(sourceUrl && { sourceUrl }),
        ...(sourceType && { sourceType }),
        ...(author !== undefined && { author }),
        ...(typeof isVisible === "boolean" && { isVisible }),
        ...(typeof order === "number" && { order }),
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

// DELETE: 리뷰 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

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
