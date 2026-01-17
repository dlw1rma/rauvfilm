import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 답변 등록/수정
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservationId = parseInt(id);
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "답변 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // 예약 존재 여부 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { reply: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    let reply;
    if (reservation.reply) {
      // 기존 답변 수정
      reply = await prisma.reply.update({
        where: { reservationId },
        data: { content },
      });
    } else {
      // 새 답변 등록
      reply = await prisma.reply.create({
        data: {
          content,
          reservationId,
        },
      });
    }

    return NextResponse.json(reply);
  } catch (error) {
    console.error("Reply creation error:", error);
    return NextResponse.json(
      { error: "답변 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 답변 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservationId = parseInt(id);

    await prisma.reply.delete({
      where: { reservationId },
    });

    return NextResponse.json({ message: "답변이 삭제되었습니다." });
  } catch (error) {
    console.error("Reply deletion error:", error);
    return NextResponse.json(
      { error: "답변 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
