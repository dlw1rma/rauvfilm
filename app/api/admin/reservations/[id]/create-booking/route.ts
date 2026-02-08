import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt } from "@/lib/validation";
import { decrypt } from "@/lib/encryption";
import { isExcludedFromNewYearDiscount } from "@/lib/constants";

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

    // 상품 조회: productType으로 매칭, 없으면 기본 상품
    let matchedProduct = reservation.productType
      ? await prisma.product.findFirst({ where: { name: reservation.productType } })
      : null;
    if (!matchedProduct) {
      matchedProduct = await prisma.product.findFirst({ where: {} });
    }
    if (!matchedProduct) {
      matchedProduct = await prisma.product.create({
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

    // 신년할인 계산: discountNewYear 체크 + 제외 상품이 아닌 경우 5만원
    const newYearDiscountAmount =
      reservation.discountNewYear && !isExcludedFromNewYearDiscount(reservation.productType)
        ? 50000
        : 0;

    // eventDiscount = 전체 할인에서 신년할인 제외한 금액
    const totalDiscountAmount = reservation.discountAmount || 0;
    const eventDiscountAmount = Math.max(0, totalDiscountAmount - newYearDiscountAmount);

    const listPrice = reservation.totalAmount || matchedProduct.price;
    const depositAmount = reservation.depositAmount || 100000;
    const referralDiscountVal = reservation.referralDiscount || 0;
    const reviewDiscountVal = reservation.reviewDiscount || 0;
    const finalBalance = Math.max(
      0,
      listPrice - depositAmount - eventDiscountAmount - newYearDiscountAmount - referralDiscountVal - reviewDiscountVal
    );

    // Booking 생성
    const booking = await prisma.booking.create({
      data: {
        customerName: author,
        customerPhone: phoneForBooking,
        customerEmail: productEmail || null,
        weddingDate: weddingDateObj,
        weddingVenue: reservation.venueName || "미정",
        weddingTime: reservation.weddingTime || null,
        productId: matchedProduct.id,
        listPrice,
        depositAmount,
        eventDiscount: eventDiscountAmount,
        newYearDiscount: newYearDiscountAmount,
        referralDiscount: referralDiscountVal,
        reviewDiscount: reviewDiscountVal,
        finalBalance,
        status: reservation.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED",
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
