import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 잔금 확인 (본인 인증 필요)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const reservationId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호가 필요합니다." },
        { status: 401 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, reservation.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 후기 할인 금액 (후기 링크가 있으면 2만원)
    const REVIEW_DISCOUNT_AMOUNT = 20000;
    const reviewDiscount = reservation.reviewLink ? REVIEW_DISCOUNT_AMOUNT : 0;

    // 최종 할인 금액 계산
    const totalDiscount = reservation.discountAmount + reviewDiscount;

    // 잔금 계산: 전체 금액 - 총 할인 금액
    const totalAmount = reservation.totalAmount || 0;
    const remainingBalance = Math.max(0, totalAmount - totalDiscount);

    return NextResponse.json({
      reservation: {
        id: reservation.id,
        title: reservation.title,
        author: reservation.author,
        referralCode: reservation.referralCode,
        referredCount: reservation.referredCount,
        reviewLink: reservation.reviewLink,
        totalAmount: reservation.totalAmount,
        discountAmount: reservation.discountAmount,
      },
      balance: {
        totalAmount,
        totalDiscount,
        reviewDiscount,
        remainingBalance,
      },
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "잔금 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 후기 링크 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const reservationId = parseInt(id);
    const body = await request.json();
    const { reviewLink, password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "비밀번호가 필요합니다." },
        { status: 401 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, reservation.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 후기 링크 업데이트
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { reviewLink: reviewLink || null },
    });

    // 업데이트된 잔금 정보 계산
    const REVIEW_DISCOUNT_AMOUNT = 20000;
    const reviewDiscount = updated.reviewLink ? REVIEW_DISCOUNT_AMOUNT : 0;
    const totalDiscount = updated.discountAmount + reviewDiscount;
    const totalAmount = updated.totalAmount || 0;
    const remainingBalance = Math.max(0, totalAmount - totalDiscount);

    return NextResponse.json({
      message: "후기 링크가 업데이트되었습니다.",
      reservation: {
        id: updated.id,
        reviewLink: updated.reviewLink,
      },
      balance: {
        totalAmount,
        totalDiscount,
        reviewDiscount,
        remainingBalance,
      },
    });
  } catch (error) {
    console.error("Error updating review link:", error);
    return NextResponse.json(
      { error: "후기 링크 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}
