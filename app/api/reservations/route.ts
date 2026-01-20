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
      usbOption,
      seonwonpan,
      gimbalShoot,
      // 본식DVD 주 재생매체
      playbackDevice,
      // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
      eventType,
      shootLocation,
      shootDate,
      shootTime,
      shootConcept,
      // 할인사항 (체크박스)
      discountCouple,
      discountReview,
      discountNewYear,
      discountReviewBlog,
      // 특이사항
      specialNotes,
      // 짝꿍 할인 시스템
      referredBy,
      totalAmount,
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

    // 짝꿍 코드 자동 생성: 예식날짜(YYYYMMDD) + 성함
    let referralCode: string | null = null;
    if (weddingDate && author) {
      // weddingDate가 "2025-05-20" 형식이면 "20250520"으로 변환
      const dateStr = weddingDate.replace(/-/g, "");
      referralCode = `${dateStr}${author}`;
    }

    // 짝꿍 할인 금액 (기본 3만원)
    const REFERRAL_DISCOUNT_AMOUNT = 30000;
    let discountAmount = 0;

    // referredBy 코드가 입력된 경우 처리
    if (referredBy) {
      // 기존 예약자 중 해당 코드를 가진 사람 찾기
      const referrer = await prisma.reservation.findFirst({
        where: { referralCode: referredBy },
      });

      if (referrer) {
        // 추천인에게 할인 적용
        await prisma.reservation.update({
          where: { id: referrer.id },
          data: {
            referredCount: { increment: 1 },
            discountAmount: { increment: REFERRAL_DISCOUNT_AMOUNT },
          },
        });

        // 신규 예약자에게도 할인 적용
        discountAmount = REFERRAL_DISCOUNT_AMOUNT;
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        title,
        content: content || "",
        author,
        password: hashedPassword,
        isPrivate: isPrivate !== undefined ? isPrivate : true, // 기본값 true (비밀글만)
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
        weddingDate: weddingDate || null,
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
        usbOption: usbOption || false,
        seonwonpan: seonwonpan || false,
        gimbalShoot: gimbalShoot || false,
        // 본식DVD 주 재생매체
        playbackDevice: playbackDevice || null,
        // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
        eventType: eventType || null,
        shootLocation: shootLocation || null,
        shootDate: shootDate || null,
        shootTime: shootTime || null,
        shootConcept: shootConcept || null,
        // 할인사항 (체크박스)
        discountCouple: discountCouple || false,
        discountReview: discountReview || false,
        discountNewYear: discountNewYear !== undefined ? discountNewYear : true, // 기본값 true (항상 체크)
        discountReviewBlog: discountReviewBlog || false,
        // 특이사항
        specialNotes: specialNotes || null,
        // 짝꿍 할인 시스템
        referralCode: referralCode || null,
        referredBy: referredBy || null,
        referredCount: 0,
        reviewLink: null,
        discountAmount: discountAmount,
        totalAmount: totalAmount || null,
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
