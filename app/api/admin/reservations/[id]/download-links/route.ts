import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: 다운로드 링크 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // 인증 확인
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { pdfUrl, videoUrl } = body;

    // URL 유효성 검사 (선택사항)
    if (pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim() !== "") {
      try {
        new URL(pdfUrl);
      } catch {
        return NextResponse.json(
          { error: "유효하지 않은 PDF URL입니다." },
          { status: 400 }
        );
      }
    }

    if (videoUrl && typeof videoUrl === "string" && videoUrl.trim() !== "") {
      try {
        new URL(videoUrl);
      } catch {
        return NextResponse.json(
          { error: "유효하지 않은 영상 URL입니다." },
          { status: 400 }
        );
      }
    }

    // 예약 존재 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 다운로드 링크 업데이트
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        pdfUrl: pdfUrl && pdfUrl.trim() !== "" ? pdfUrl.trim() : null,
        videoUrl: videoUrl && videoUrl.trim() !== "" ? videoUrl.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      pdfUrl: updated.pdfUrl,
      videoUrl: updated.videoUrl,
    });
  } catch (error) {
    console.error("Error updating download links:", error);
    return NextResponse.json(
      { error: "다운로드 링크 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
