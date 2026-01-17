import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 예약 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reservationId = parseInt(id);

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reply: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { viewCount: { increment: 1 } },
    });

    // 비밀번호 제외하고 반환
    const { password, ...reservationWithoutPassword } = reservation;

    // 비밀글인 경우 민감 정보 마스킹
    if (reservation.isPrivate) {
      return NextResponse.json({
        ...reservationWithoutPassword,
        phone: reservation.phone
          ? reservation.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
          : null,
        email: reservation.email
          ? reservation.email.replace(/(.{3}).*(@.*)/, "$1***$2")
          : null,
      });
    }

    return NextResponse.json(reservationWithoutPassword);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "예약 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 예약 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reservationId = parseInt(id);
    const body = await request.json();
    const { password, title, content, phone, email, weddingDate, location, isPrivate } = body;

    // 기존 예약 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, reservation.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 업데이트
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        title,
        content,
        phone: phone || null,
        email: email || null,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        location: location || null,
        isPrivate: isPrivate || false,
      },
    });

    return NextResponse.json({
      message: "예약 문의가 수정되었습니다.",
      id: updatedReservation.id,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "예약 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 예약 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reservationId = parseInt(id);
    const body = await request.json();
    const { password } = body;

    // 기존 예약 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, reservation.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 삭제
    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return NextResponse.json({ message: "예약 문의가 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { error: "예약 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
