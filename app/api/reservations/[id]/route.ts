import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { safeParseInt } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 예약 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 30, 60 * 1000); // 1분에 30회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(request.url);
    const passwordParam = searchParams.get("password");

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

    // 비밀글인 경우
    if (reservation.isPrivate) {
      // 비밀번호가 제공된 경우 검증
      if (passwordParam) {
        const isPasswordValid = await bcrypt.compare(passwordParam, reservation.password);
        if (isPasswordValid) {
          // 비밀번호 일치 - 전체 내용 반환
          return NextResponse.json({
            ...reservationWithoutPassword,
            isLocked: false,
          });
        }
      }

      // 비밀번호 없거나 불일치 - 잠금 상태로 반환 (내용 숨김)
      return NextResponse.json({
        id: reservation.id,
        title: reservation.title,
        author: reservation.author,
        isPrivate: true,
        isLocked: true,
        createdAt: reservation.createdAt,
        content: "비밀글입니다. 비밀번호를 입력해주세요.",
        phone: null,
        email: null,
        weddingDate: null,
        location: null,
        reply: reservation.reply ? {
          content: "비밀글입니다.",
          createdAt: reservation.reply.createdAt
        } : null,
      });
    }

    return NextResponse.json({
      ...reservationWithoutPassword,
      isLocked: false,
    });
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
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 10, 15 * 60 * 1000); // 15분에 10회
    if (rateLimitResponse) {
      return rateLimitResponse;
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

    // 전화번호 정규화 (하이픈 제거)
    const normalizePhone = (phone: string | null | undefined): string | null => {
      if (!phone) return null;
      return phone.replace(/[^0-9]/g, '');
    };

    // 업데이트
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        title: body.title || reservation.title,
        brideName: body.brideName || null,
        bridePhone: normalizePhone(body.bridePhone),
        groomName: body.groomName || null,
        groomPhone: normalizePhone(body.groomPhone),
        receiptPhone: normalizePhone(body.receiptPhone),
        depositName: body.depositName || null,
        productEmail: body.productEmail || null,
        productType: body.productType || null,
        partnerCode: body.partnerCode || null,
        foundPath: body.foundPath || null,
        weddingDate: body.weddingDate || null,
        weddingTime: body.weddingTime || null,
        venueName: body.venueName || null,
        venueFloor: body.venueFloor || null,
        guestCount: body.guestCount ? parseInt(body.guestCount) : null,
        makeupShoot: body.makeupShoot || false,
        paebaekShoot: body.paebaekShoot || false,
        receptionShoot: body.receptionShoot || false,
        mainSnapCompany: body.mainSnapCompany || null,
        makeupShop: body.makeupShop || null,
        dressShop: body.dressShop || null,
        deliveryAddress: body.deliveryAddress || null,
        usbOption: body.usbOption || false,
        seonwonpan: body.seonwonpan || false,
        gimbalShoot: body.gimbalShoot || false,
        playbackDevice: body.playbackDevice || null,
        eventType: body.eventType || null,
        shootLocation: body.shootLocation || null,
        shootDate: body.shootDate || null,
        shootTime: body.shootTime || null,
        shootConcept: body.shootConcept || null,
        discountCouple: body.discountCouple || false,
        discountReview: body.discountReview || false,
        discountNewYear: body.discountNewYear !== undefined ? body.discountNewYear : true,
        discountReviewBlog: body.discountReviewBlog || false,
        specialNotes: body.specialNotes || null,
        customShootingRequest: body.customShootingRequest || false,
        customStyle: body.customStyle || null,
        customEditStyle: body.customEditStyle || null,
        customMusic: body.customMusic || null,
        customLength: body.customLength || null,
        customEffect: body.customEffect || null,
        customContent: body.customContent || null,
        customSpecialRequest: body.customSpecialRequest || null,
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
    // Rate limiting 적용 (삭제는 더 엄격하게)
    const rateLimitResponse = rateLimit(request, 5, 15 * 60 * 1000); // 15분에 5회
    if (rateLimitResponse) {
      return rateLimitResponse;
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
    const { password, adminDelete } = body;

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

    // 관리자 삭제인 경우 관리자 인증 강제
    if (adminDelete) {
      const { requireAdminAuth } = await import("@/lib/auth");
      const authResponse = await requireAdminAuth(request);
      if (authResponse) {
        return authResponse; // 인증 실패
      }
    } else {
      // 일반 사용자 삭제는 비밀번호 확인
      if (!password) {
        return NextResponse.json(
          { error: "비밀번호를 입력해주세요." },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(password, reservation.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
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
