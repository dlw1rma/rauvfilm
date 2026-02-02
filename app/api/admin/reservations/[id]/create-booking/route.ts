import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt } from "@/lib/validation";
import { decrypt } from "@/lib/encryption";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST: 예약글에서 예약관리(Booking) 생성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
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

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약 문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (reservation.bookingId) {
      return NextResponse.json(
        { error: "이미 연결된 예약관리(Booking)가 있습니다." },
        { status: 400 }
      );
    }

    // 개인정보 복호화
    const author = decrypt(reservation.author) || reservation.author;
    const bridePhone = decrypt(reservation.bridePhone);
    const groomPhone = decrypt(reservation.groomPhone);
    const productEmail = decrypt(reservation.productEmail);

    // 기본 상품 조회 (없으면 자동 생성)
    let defaultProduct = await prisma.product.findFirst({ where: {} });
    if (!defaultProduct) {
      defaultProduct = await prisma.product.create({
        data: { name: "기본 상품", price: 0, description: "자동 생성", isActive: true },
      });
    }

    // 예식일 처리
    let weddingDateObj: Date;
    if (reservation.weddingDate) {
      weddingDateObj = new Date(reservation.weddingDate);
      if (isNaN(weddingDateObj.getTime())) {
        weddingDateObj = new Date("2099-12-31");
      }
    } else {
      weddingDateObj = new Date("2099-12-31");
    }

    // 전화번호 처리: 해외거주면 이메일, 없으면 플레이스홀더
    let phoneForBooking: string;
    if (reservation.overseasResident) {
      phoneForBooking = productEmail || "no-email@placeholder.local";
    } else {
      phoneForBooking = bridePhone || groomPhone || "00000000000";
    }

    // Booking 생성
    const booking = await prisma.booking.create({
      data: {
        customerName: author,
        customerPhone: phoneForBooking,
        customerEmail: productEmail || null,
        weddingDate: weddingDateObj,
        weddingVenue: reservation.venueName || "미정",
        weddingTime: reservation.weddingTime || null,
        productId: defaultProduct.id,
        listPrice: reservation.totalAmount || defaultProduct.price,
        depositAmount: reservation.depositAmount || 100000,
        eventDiscount: reservation.discountAmount || 0,
        referralDiscount: reservation.referralDiscount || 0,
        reviewDiscount: reservation.reviewDiscount || 0,
        finalBalance: reservation.finalBalance || Math.max(
          0,
          (reservation.totalAmount || defaultProduct.price) -
            (reservation.depositAmount || 100000) -
            (reservation.discountAmount || 0)
        ),
        status: reservation.status === "CONFIRMED" ? "CONFIRMED" : "PENDING",
        reservationId: reservation.id,
        referredBy:
          reservation.discountCouple && reservation.partnerCode
            ? reservation.partnerCode
            : null,
      },
    });

    // Reservation에 bookingId 연결
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { bookingId: booking.id },
    });

    return NextResponse.json(
      { message: "예약관리(Booking)가 생성되었습니다.", bookingId: booking.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking from reservation:", error);
    return NextResponse.json(
      { error: "예약관리 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
