import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: 예약 목록 조회
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
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
    const prisma = getPrisma();
    const body = await request.json();
    const {
      title,
      content,
      author,
      password,
      isPrivate,
      // 필수 작성항목(공통)
      brideName,
      bridePhone,
      groomName,
      groomPhone,
      receiptPhone,
      depositName,
      productEmail,
      productType,
      partnerCode,
      foundPath,
      termsAgreed,
      faqRead,
      // 개인정보 활용 동의
      privacyAgreed,
      // 본식DVD 예약 고객님 필수 추가 작성 항목
      weddingDate,
      weddingTime,
      venueName,
      venueFloor,
      guestCount,
      makeupShoot,
      paebaekShoot,
      receptionShoot,
      mainSnapCompany,
      makeupShop,
      dressShop,
      deliveryAddress,
      seonwonpan,
      gimbalShoot,
      // 본식DVD 주 재생매체
      playbackDevice,
      // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
      shootDate,
      shootTimePlace,
      shootConcept,
      // 할인사항 및 특이사항 작성 항목
      specialNotes,
      discountInfo,
    } = body;

    // 유효성 검사
    if (!title || !author || !password) {
      return NextResponse.json(
        { error: "제목, 계약자 성함, 비밀번호는 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (!brideName || !bridePhone || !groomName || !groomPhone) {
      return NextResponse.json(
        { error: "신부님/신랑님 성함 및 전화번호는 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (!termsAgreed || !faqRead || !privacyAgreed) {
      return NextResponse.json(
        { error: "약관 동의 및 개인정보 활용 동의는 필수입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    const reservation = await prisma.reservation.create({
      data: {
        title,
        content: content || "",
        author,
        password: hashedPassword,
        isPrivate: isPrivate || false,
        // 필수 작성항목(공통)
        brideName: brideName || null,
        bridePhone: bridePhone || null,
        groomName: groomName || null,
        groomPhone: groomPhone || null,
        receiptPhone: receiptPhone || null,
        depositName: depositName || null,
        productEmail: productEmail || null,
        productType: productType || null,
        partnerCode: partnerCode || null,
        foundPath: foundPath || null,
        termsAgreed: termsAgreed || false,
        faqRead: faqRead || false,
        // 개인정보 활용 동의
        privacyAgreed: privacyAgreed || false,
        // 본식DVD 예약 고객님 필수 추가 작성 항목
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        weddingTime: weddingTime || null,
        venueName: venueName || null,
        venueFloor: venueFloor || null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        makeupShoot: makeupShoot || false,
        paebaekShoot: paebaekShoot || false,
        receptionShoot: receptionShoot || false,
        mainSnapCompany: mainSnapCompany || null,
        makeupShop: makeupShop || null,
        dressShop: dressShop || null,
        deliveryAddress: deliveryAddress || null,
        seonwonpan: seonwonpan || false,
        gimbalShoot: gimbalShoot || false,
        // 본식DVD 주 재생매체
        playbackDevice: playbackDevice || null,
        // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
        shootDate: shootDate ? new Date(shootDate) : null,
        shootTimePlace: shootTimePlace || null,
        shootConcept: shootConcept || null,
        // 할인사항 및 특이사항 작성 항목
        specialNotes: specialNotes || null,
        discountInfo: discountInfo || null,
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
