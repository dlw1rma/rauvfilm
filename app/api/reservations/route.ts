import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: 예약 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          isPrivate: true,
          createdAt: true,
          reply: {
            select: { id: true },
          },
        },
      }),
      prisma.reservation.count(),
    ]);

    const formattedReservations = reservations.map((r: typeof reservations[number]) => ({
      id: r.id,
      title: r.title,
      author: r.author,
      isPrivate: r.isPrivate,
      createdAt: r.createdAt,
      hasReply: !!r.reply,
    }));

    return NextResponse.json({
      reservations: formattedReservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "예약 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 예약 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      author,
      password,
      phone,
      email,
      weddingDate,
      location,
      isPrivate,
    } = body;

    // 유효성 검사
    if (!title || !content || !author || !password) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    const reservation = await prisma.reservation.create({
      data: {
        title,
        content,
        author,
        password: hashedPassword,
        phone: phone || null,
        email: email || null,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        location: location || null,
        isPrivate: isPrivate || false,
      },
    });

    return NextResponse.json(
      { message: "예약 문의가 등록되었습니다.", id: reservation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "예약 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
