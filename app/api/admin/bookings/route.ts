/**
 * 관리자 - 예약 목록 API
 * GET /api/admin/bookings
 * POST /api/admin/bookings (새 예약 생성)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatKRW } from '@/lib/pricing';
import { safeParseInt, sanitizeString } from '@/lib/validation';
import { encrypt } from '@/lib/encryption';
import { isAdminAuthenticated } from '@/lib/api';
import bcrypt from 'bcryptjs';

/**
 * 예약 목록 조회
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = sanitizeString(searchParams.get('search'), 100);
    const page = safeParseInt(searchParams.get('page'), 1, 1, 1000);
    const limit = safeParseInt(searchParams.get('limit'), 20, 1, 100);
    const upcomingDays = searchParams.get('upcoming_days');
    const thisWeek = searchParams.get('this_week') === '1';

    const where: Record<string, unknown> = {};
    const showDeleted = searchParams.get('deleted') === '1';

    // 3일 지난 소프트 삭제 예약 자동 영구 삭제
    const purgeDate = new Date();
    purgeDate.setDate(purgeDate.getDate() - 3);
    try {
      const expired = await prisma.booking.findMany({
        where: { deletedAt: { not: null, lt: purgeDate } },
        select: { id: true, reservationId: true },
      });
      for (const b of expired) {
        if (b.reservationId) {
          try { await prisma.reservation.delete({ where: { id: b.reservationId } }); } catch {}
        }
        await prisma.booking.delete({ where: { id: b.id } });
      }
      if (expired.length > 0) console.log(`자동 영구 삭제: ${expired.length}건`);
    } catch (purgeError) {
      console.error('자동 퍼지 오류:', purgeError);
    }

    if (showDeleted) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    if (upcomingDays) {
      const days = safeParseInt(upcomingDays, 7, 1, 90);
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      where.weddingDate = { gte: start, lte: end };
    }
    if (thisWeek && !upcomingDays) {
      const now = new Date();
      const day = now.getDay();
      const monOffset = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(mon.getDate() + monOffset);
      mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon);
      sun.setDate(sun.getDate() + 6);
      sun.setHours(23, 59, 59, 999);
      where.weddingDate = { gte: mon, lte: sun };
    }

    // 상태 필터
    if (status && status !== 'all') {
      where.status = status;
    }

    // 검색 (이름, 전화번호, 예식장) - sanitized search 사용
    if (search && search.length >= 2) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { weddingVenue: { contains: search } },
        { partnerCode: { contains: search } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          product: true,
          discountEvent: true,
        },
        orderBy: { createdAt: 'desc' }, // 최신 등록순
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // 상태별 통계 (삭제되지 않은 것만)
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    });

    const statusCounts = stats.reduce(
      (acc, s) => {
        acc[s.status] = s._count;
        return acc;
      },
      {} as Record<string, number>
    );

    // 삭제된 예약 건수
    const deletedCount = await prisma.booking.count({ where: { deletedAt: { not: null } } });

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        weddingDate: b.weddingDate,
        weddingVenue: b.weddingVenue,
        weddingTime: b.weddingTime,
        status: b.status,
        partnerCode: b.partnerCode,
        reservationId: b.reservationId ?? null,
        product: {
          id: b.product.id,
          name: b.product.name,
        },
        listPrice: b.listPrice,
        listPriceFormatted: formatKRW(b.listPrice),
        depositAmount: b.depositAmount,
        eventDiscount: b.eventDiscount,
        referralDiscount: b.referralDiscount,
        reviewDiscount: b.reviewDiscount,
        finalBalance: b.finalBalance,
        finalBalanceFormatted: formatKRW(b.finalBalance),
        depositPaidAt: b.depositPaidAt,
        balancePaidAt: b.balancePaidAt,
        videoUrl: b.videoUrl,
        contractUrl: b.contractUrl,
        reviewCount: 0,
        createdAt: b.createdAt,
        deletedAt: b.deletedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
      deletedCount,
    });
  } catch (error) {
    console.error('예약 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '예약 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 새 예약 생성
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      weddingDate,
      weddingVenue,
      weddingTime,
      productId,
      customListPrice,
      discountEventId,
      specialDiscount,
      specialDiscountReason,
      coupleDiscountAmount,
      newYearDiscountAmount,
      travelFee,
      referredBy,
      adminNote,
      // 추가 필드
      brideName,
      bridePhone,
      groomName,
      groomPhone,
      makeupShoot,
      paebaekShoot,
      receptionShoot,
      usbOption,
      seonwonpan,
      discountNewYear,
      discountCouple,
      discountReview,
      discountReviewBlog,
      mainSnapCompany,
      partnerCode,
    } = body;

    // 필수 필드 검증
    if (!customerName || !customerPhone || !weddingDate || !weddingVenue || !productId) {
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 상품 조회
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '존재하지 않는 상품입니다.' },
        { status: 400 }
      );
    }

    // 이벤트 할인 조회
    let eventDiscount = 0;
    if (discountEventId) {
      const event = await prisma.discountEvent.findUnique({
        where: { id: discountEventId },
      });
      if (event && event.isActive) {
        const now = new Date();
        if (now >= event.startDate && now <= event.endDate) {
          eventDiscount = event.amount;
        }
      }
    }

    // 전화번호 정규화
    const normalizedPhone = customerPhone.replace(/[^0-9]/g, '');

    // 금액 계산: 직접 입력 금액이 있으면 사용, 없으면 상품 가격
    const listPrice = customListPrice && customListPrice > 0 ? customListPrice : product.price;
    const travelFeeAmount = travelFee || 0;
    const specialDiscountAmount = specialDiscount || 0;
    const coupleDiscountValue = coupleDiscountAmount || 0;
    const newYearDiscountValue = newYearDiscountAmount || 0;

    // eventDiscount = 이벤트할인 + 특별할인(수동)만 (신년할인 제외)
    const totalEventDiscount = eventDiscount + specialDiscountAmount;
    // referralDiscount = 짝궁할인
    const totalReferralDiscount = coupleDiscountValue;
    // newYearDiscount = 신년할인 (별도 필드)
    const totalNewYearDiscount = newYearDiscountValue;

    // 잔금 계산: 금액 + 출장비 - 예약금(10만원) - 이벤트/특별할인 - 신년할인 - 짝궁할인
    const finalBalance = Math.max(0, listPrice + travelFeeAmount - 100000 - totalEventDiscount - totalNewYearDiscount - totalReferralDiscount);

    // 관리자 메모에 할인 내역 기록
    const discountNotes: string[] = [];
    if (specialDiscountReason) discountNotes.push(`[특별할인: ${specialDiscountAmount.toLocaleString()}원 - ${specialDiscountReason}]`);
    if (newYearDiscountValue > 0) discountNotes.push(`[신년할인: ${newYearDiscountValue.toLocaleString()}원]`);
    if (coupleDiscountValue > 0) discountNotes.push(`[짝궁할인: ${coupleDiscountValue.toLocaleString()}원]`);
    const notePrefix = discountNotes.length > 0 ? discountNotes.join(' ') : '';
    const finalAdminNote = notePrefix
      ? `${notePrefix}\n${adminNote || ''}`.trim()
      : (adminNote || null);

    // 예약 생성
    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: normalizedPhone,
        customerEmail: customerEmail || null,
        weddingDate: new Date(weddingDate),
        weddingVenue,
        weddingTime: weddingTime || null,
        productId,
        listPrice,
        travelFee: travelFeeAmount,
        discountEventId: discountEventId || null,
        eventDiscount: totalEventDiscount,
        newYearDiscount: totalNewYearDiscount,
        referralDiscount: totalReferralDiscount,
        referredBy: referredBy || null,
        adminNote: finalAdminNote,
        finalBalance,
      },
      include: {
        product: true,
        discountEvent: true,
      },
    });

    // 예약글(Reservation) 동기화 생성
    try {
      const weddingDateStr = new Date(weddingDate).toISOString().slice(0, 10);
      const title = `[예약관리] ${customerName} ${weddingDateStr}`;
      const hashedPassword = await bcrypt.hash('booking-sync', 10);
      const encryptedAuthor = encrypt(customerName.trim()) ?? customerName.trim();

      // 신부/신랑 정보 암호화
      const encryptedBrideName = brideName ? (encrypt(brideName) || null) : null;
      const encryptedBridePhone = bridePhone ? (encrypt(bridePhone) || null) : null;
      const encryptedGroomName = groomName ? (encrypt(groomName) || null) : null;
      const encryptedGroomPhone = groomPhone ? (encrypt(groomPhone) || null) : null;

      const reservation = await prisma.reservation.create({
        data: {
          title,
          author: encryptedAuthor,
          password: hashedPassword,
          content: specialDiscountReason
            ? `예약관리에서 생성됨: ${weddingVenue}\n[특별할인: ${specialDiscountAmount.toLocaleString()}원 - ${specialDiscountReason}]`
            : `예약관리에서 생성됨: ${weddingVenue}`,
          isPrivate: true,
          status: 'CONFIRMED',
          weddingDate: weddingDateStr,
          weddingTime: weddingTime || null,
          venueName: weddingVenue,
          productType: product.name || null,
          termsAgreed: true,
          faqRead: true,
          privacyAgreed: true,
          travelFee: travelFeeAmount,
          totalAmount: listPrice,
          depositAmount: 100000,
          discountAmount: totalEventDiscount + totalReferralDiscount,
          finalBalance,
          bookingId: booking.id,
          // 추가 필드
          brideName: encryptedBrideName,
          bridePhone: encryptedBridePhone,
          groomName: encryptedGroomName,
          groomPhone: encryptedGroomPhone,
          makeupShoot: makeupShoot || false,
          paebaekShoot: paebaekShoot || false,
          receptionShoot: receptionShoot || false,
          usbOption: usbOption || false,
          seonwonpan: seonwonpan || false,
          discountNewYear: discountNewYear || false,
          discountCouple: discountCouple || false,
          discountReview: discountReview || false,
          discountReviewBlog: discountReviewBlog || false,
          mainSnapCompany: mainSnapCompany || null,
          partnerCode: partnerCode || null,
          referredBy: referredBy || null,
        },
      });

      // Booking에 reservationId 연결
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reservationId: reservation.id },
      });
    } catch (syncError) {
      console.error('예약글 동기화 생성 오류 (계속 진행):', syncError);
      // 동기화 실패해도 Booking 생성은 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        weddingDate: booking.weddingDate,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('예약 생성 오류:', error);
    return NextResponse.json(
      { error: '예약 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
