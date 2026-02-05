/**
 * 마이페이지 - 예약글 상세 조회 및 수정 API
 * GET /api/mypage/reservations/[id]
 * PUT /api/mypage/reservations/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/encryption';
import { safeParseInt } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    
    if (reservationId === 0) {
      return NextResponse.json(
        { error: '잘못된 예약 ID입니다.' },
        { status: 400 }
      );
    }

    // 예약 조회
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 로그인된 예약 정보로 소유권 확인
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
      select: {
        author: true,
        brideName: true,
        bridePhone: true,
        groomName: true,
        groomPhone: true,
      },
    });

    if (!currentReservation) {
      return NextResponse.json(
        { error: '인증 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 복호화하여 검색 조건 생성
    const decryptedAuthor = decrypt(currentReservation.author) || '';
    const decryptedBrideName = decrypt(currentReservation.brideName) || '';
    const decryptedGroomName = decrypt(currentReservation.groomName) || '';
    const decryptedBridePhone = decrypt(currentReservation.bridePhone) || '';
    const decryptedGroomPhone = decrypt(currentReservation.groomPhone) || '';

    const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');
    const normalizedBridePhone = normalizePhone(decryptedBridePhone);
    const normalizedGroomPhone = normalizePhone(decryptedGroomPhone);

    // 수정하려는 예약의 정보 복호화
    const rAuthor = decrypt(reservation.author) || '';
    const rBrideName = decrypt(reservation.brideName) || '';
    const rGroomName = decrypt(reservation.groomName) || '';
    const rBridePhone = decrypt(reservation.bridePhone) || '';
    const rGroomPhone = decrypt(reservation.groomPhone) || '';

    const rNormalizedBridePhone = normalizePhone(rBridePhone);
    const rNormalizedGroomPhone = normalizePhone(rGroomPhone);

    // 소유권 확인
    const authorMatch = rAuthor === decryptedAuthor && 
      (rNormalizedBridePhone === normalizedBridePhone || 
       rNormalizedGroomPhone === normalizedGroomPhone ||
       rNormalizedBridePhone === normalizedGroomPhone ||
       rNormalizedGroomPhone === normalizedBridePhone);
    const brideMatch = rBrideName === decryptedBrideName && 
      rNormalizedBridePhone === normalizedBridePhone;
    const groomMatch = rGroomName === decryptedGroomName && 
      rNormalizedGroomPhone === normalizedGroomPhone;

    if (!authorMatch && !brideMatch && !groomMatch) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const eventSnapApplications = await prisma.eventSnapApplication.findMany({
      where: { reservationId: reservationId },
      orderBy: { createdAt: "desc" },
    });

    // 개인정보 복호화하여 반환
    return NextResponse.json({
      id: reservation.id,
      title: reservation.title,
      content: reservation.content || '',
      author: rAuthor,
      brideName: rBrideName,
      bridePhone: rBridePhone,
      groomName: rGroomName,
      groomPhone: rGroomPhone,
      receiptPhone: decrypt(reservation.receiptPhone),
      depositName: reservation.depositName,
      productEmail: decrypt(reservation.productEmail),
      productType: reservation.productType,
      partnerCode: reservation.partnerCode,
      foundPath: reservation.foundPath,
      weddingDate: reservation.weddingDate,
      weddingTime: reservation.weddingTime,
      venueName: reservation.venueName,
      venueFloor: reservation.venueFloor,
      guestCount: reservation.guestCount,
      makeupShoot: reservation.makeupShoot,
      paebaekShoot: reservation.paebaekShoot,
      receptionShoot: reservation.receptionShoot,
      mainSnapCompany: reservation.mainSnapCompany,
      makeupShop: reservation.makeupShop,
      dressShop: reservation.dressShop,
      deliveryAddress: decrypt(reservation.deliveryAddress),
      usbOption: reservation.usbOption,
      seonwonpan: reservation.seonwonpan,
      gimbalShoot: reservation.gimbalShoot,
      playbackDevice: reservation.playbackDevice,
      eventType: reservation.eventType,
      shootLocation: reservation.shootLocation,
      shootDate: reservation.shootDate,
      shootTime: reservation.shootTime,
      shootConcept: reservation.shootConcept,
      discountCouple: reservation.discountCouple,
      discountReview: reservation.discountReview,
      discountNewYear: reservation.discountNewYear,
      discountReviewBlog: reservation.discountReviewBlog,
      specialNotes: reservation.specialNotes,
      customShootingRequest: reservation.customShootingRequest,
      customStyle: reservation.customStyle,
      customEditStyle: reservation.customEditStyle,
      customMusic: reservation.customMusic,
      customLength: reservation.customLength,
      customEffect: reservation.customEffect,
      customContent: reservation.customContent,
      customSpecialRequest: reservation.customSpecialRequest,
      eventSnapApplications,
      reviewLink: reservation.reviewLink,
      reviewRefundAccount: reservation.reviewRefundAccount,
      reviewRefundDepositorName: reservation.reviewRefundDepositorName,
      createdAt: reservation.createdAt,
    });
  } catch (error) {
    console.error('예약 조회 오류:', error);
    return NextResponse.json(
      { error: '예약 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    
    if (reservationId === 0) {
      return NextResponse.json(
        { error: '잘못된 예약 ID입니다.' },
        { status: 400 }
      );
    }

    // 예약 조회 및 소유권 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 로그인된 예약 정보로 소유권 확인
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
      select: {
        author: true,
        brideName: true,
        bridePhone: true,
        groomName: true,
        groomPhone: true,
      },
    });

    if (!currentReservation) {
      return NextResponse.json(
        { error: '인증 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 복호화하여 검색 조건 생성
    const decryptedAuthor = decrypt(currentReservation.author) || '';
    const decryptedBrideName = decrypt(currentReservation.brideName) || '';
    const decryptedGroomName = decrypt(currentReservation.groomName) || '';
    const decryptedBridePhone = decrypt(currentReservation.bridePhone) || '';
    const decryptedGroomPhone = decrypt(currentReservation.groomPhone) || '';

    const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');
    const normalizedBridePhone = normalizePhone(decryptedBridePhone);
    const normalizedGroomPhone = normalizePhone(decryptedGroomPhone);

    // 수정하려는 예약의 정보 복호화
    const rAuthor = decrypt(reservation.author) || '';
    const rBrideName = decrypt(reservation.brideName) || '';
    const rGroomName = decrypt(reservation.groomName) || '';
    const rBridePhone = decrypt(reservation.bridePhone) || '';
    const rGroomPhone = decrypt(reservation.groomPhone) || '';

    const rNormalizedBridePhone = normalizePhone(rBridePhone);
    const rNormalizedGroomPhone = normalizePhone(rGroomPhone);

    // 소유권 확인
    const authorMatch = rAuthor === decryptedAuthor && 
      (rNormalizedBridePhone === normalizedBridePhone || 
       rNormalizedGroomPhone === normalizedGroomPhone ||
       rNormalizedBridePhone === normalizedGroomPhone ||
       rNormalizedGroomPhone === normalizedBridePhone);
    const brideMatch = rBrideName === decryptedBrideName && 
      rNormalizedBridePhone === normalizedBridePhone;
    const groomMatch = rGroomName === decryptedGroomName && 
      rNormalizedGroomPhone === normalizedGroomPhone;

    if (!authorMatch && !brideMatch && !groomMatch) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 전화번호 정규화 (하이픈 제거)
    const normalizePhoneNumber = (phone: string | null | undefined): string | null => {
      if (!phone) return null;
      return phone.replace(/[^0-9]/g, '');
    };

    // 상품 종류별 기본 가격 (할인 전 가격)
    const getProductBasePrice = (productType: string | null): number => {
      switch (productType) {
        case '가성비형':
          return 340000; // 할인 전 34만원
        case '기본형':
          return 600000; // 할인 전 60만원
        case '시네마틱형':
          return 950000; // 할인 전 95만원
        case '야외스냅':
          return 0; // 가격 정보 필요 시 추가
        case '프리웨딩':
          return 0; // 가격 정보 필요 시 추가
        default:
          return 0;
      }
    };

    // 추가 옵션 가격 계산
    const calculateAdditionalOptions = (options: any): number => {
      let additionalPrice = 0;
      if (options.makeupShoot) additionalPrice += 200000; // 메이크업 촬영
      if (options.paebaekShoot) additionalPrice += 50000; // 폐백 촬영
      if (options.receptionShoot) additionalPrice += 50000; // 피로연 촬영
      // USB는 개당 20,000원이지만 개수를 알 수 없으므로 일단 제외
      return additionalPrice;
    };

    // 상품이 변경되었거나 추가 옵션이 변경된 경우 totalAmount 재계산
    // body.productType이 명시적으로 전달되었는지 확인 (null, undefined, 빈 문자열 모두 처리)
    const newProductType = body.productType !== undefined && body.productType !== null && body.productType !== '' 
      ? body.productType 
      : reservation.productType;
    const productChanged = newProductType !== reservation.productType;
    
    console.log(`[예약 수정] 상품 변경 확인: 기존=${reservation.productType}, 새로운=${newProductType}, body.productType=${body.productType}, 변경됨=${productChanged}`);
    const optionsChanged = 
      (body.makeupShoot !== undefined && body.makeupShoot !== reservation.makeupShoot) ||
      (body.paebaekShoot !== undefined && body.paebaekShoot !== reservation.paebaekShoot) ||
      (body.receptionShoot !== undefined && body.receptionShoot !== reservation.receptionShoot);

    // 가성비형으로 변경되면 신년할인과 예약후기 할인 제거
    if (productChanged && newProductType === '가성비형') {
      body.discountNewYear = false;
      body.discountReviewBlog = false;
    }

    // 상품 변경 시 항상 totalAmount 재계산
    let newTotalAmount = reservation.totalAmount || 0;
    if (productChanged || optionsChanged) {
      const basePrice = getProductBasePrice(newProductType);
      const additionalPrice = calculateAdditionalOptions({
        makeupShoot: body.makeupShoot !== undefined ? body.makeupShoot : reservation.makeupShoot,
        paebaekShoot: body.paebaekShoot !== undefined ? body.paebaekShoot : reservation.paebaekShoot,
        receptionShoot: body.receptionShoot !== undefined ? body.receptionShoot : reservation.receptionShoot,
      });
      newTotalAmount = basePrice + additionalPrice;
      console.log(`[예약 수정] 상품 변경: ${reservation.productType} -> ${newProductType}, totalAmount: ${reservation.totalAmount} -> ${newTotalAmount}, basePrice=${basePrice}, additionalPrice=${additionalPrice}`);
    } else {
      console.log(`[예약 수정] 상품 변경 없음: productType=${reservation.productType}, body.productType=${body.productType}`);
    }

    // 업데이트 데이터 준비 (개인정보는 암호화)
    const updateData: any = {
      title: body.title,
      content: body.content || null,
      author: body.author ? encrypt(body.author) : reservation.author,
      brideName: body.brideName ? encrypt(body.brideName) : reservation.brideName,
      bridePhone: body.bridePhone ? encrypt(normalizePhoneNumber(body.bridePhone) || '') : reservation.bridePhone,
      groomName: body.groomName ? encrypt(body.groomName) : reservation.groomName,
      groomPhone: body.groomPhone ? encrypt(normalizePhoneNumber(body.groomPhone) || '') : reservation.groomPhone,
      receiptPhone: body.receiptPhone ? encrypt(normalizePhoneNumber(body.receiptPhone) || '') : reservation.receiptPhone,
      depositName: body.depositName || null,
      productEmail: body.productEmail ? encrypt(body.productEmail) : reservation.productEmail,
      productType: body.productType !== undefined ? body.productType : reservation.productType,
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
      deliveryAddress: body.deliveryAddress ? encrypt(body.deliveryAddress) : reservation.deliveryAddress,
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
      // 가성비형이면 신년할인과 예약후기 할인 제거
      discountNewYear: newProductType === '가성비형' ? false : (body.discountNewYear !== undefined ? body.discountNewYear : (reservation.discountNewYear ?? true)),
      discountReviewBlog: newProductType === '가성비형' ? false : (body.discountReviewBlog || false),
      specialNotes: body.specialNotes || null,
      customShootingRequest: body.customShootingRequest || false,
      customStyle: body.customStyle || null,
      customEditStyle: body.customEditStyle || null,
      customMusic: body.customMusic || null,
      customLength: body.customLength || null,
      customEffect: body.customEffect || null,
      customContent: body.customContent || null,
      customSpecialRequest: body.customSpecialRequest || null,
      // 상품 변경 시 totalAmount 업데이트
      totalAmount: newTotalAmount,
    };

    // 할인 금액 재계산 (상품 변경 시 항상 재계산, 또는 할인 옵션 변경 시)
    const discountOptionsChanged = 
      (body.discountNewYear !== undefined && body.discountNewYear !== reservation.discountNewYear) ||
      (body.discountReviewBlog !== undefined && body.discountReviewBlog !== reservation.discountReviewBlog) ||
      (body.mainSnapCompany !== undefined && body.mainSnapCompany !== reservation.mainSnapCompany);

    if (productChanged || optionsChanged || discountOptionsChanged) {
      const depositAmount = reservation.depositAmount || 100000;
      let discountAmount = 0;
      
      // 신년 할인 (가성비형이면 제외)
      const finalDiscountNewYear = newProductType === '가성비형' ? false : (body.discountNewYear !== undefined ? body.discountNewYear : reservation.discountNewYear);
      if (finalDiscountNewYear) {
        discountAmount += 50000;
      }
      
      // 르메그라피 제휴 할인 (메인스냅이 르메그라피이고 기본형/시네마틱형인 경우)
      const mainSnapCompany = body.mainSnapCompany !== undefined ? body.mainSnapCompany : reservation.mainSnapCompany || '';
      const isLemeGraphy = mainSnapCompany.toLowerCase().includes('르메그라피') || mainSnapCompany.toLowerCase().includes('leme');
      if (isLemeGraphy && (newProductType === '기본형' || newProductType === '시네마틱형')) {
        discountAmount += 150000;
      }
      
      // 짝꿍 할인 (예약 확정 후 적용되므로 기존 값 유지)
      // 후기 할인 (후기 제출 후 적용되므로 기존 값 유지)
      
      updateData.discountAmount = discountAmount;
      const referralDiscount = reservation.referralDiscount || 0;
      const reviewDiscount = reservation.reviewDiscount || 0;
      updateData.finalBalance = Math.max(0, newTotalAmount - depositAmount - discountAmount - referralDiscount - reviewDiscount);
      
      console.log(`[예약 수정] 할인 재계산: discountAmount=${discountAmount}, referralDiscount=${referralDiscount}, reviewDiscount=${reviewDiscount}, finalBalance=${updateData.finalBalance}, productChanged=${productChanged}, discountOptionsChanged=${discountOptionsChanged}`);
    } else if (productChanged) {
      // 상품만 변경되었고 할인 옵션은 변경되지 않은 경우에도 재계산
      const depositAmount = reservation.depositAmount || 100000;
      let discountAmount = 0;
      
      // 신년 할인 (가성비형이면 제외)
      const finalDiscountNewYear = newProductType === '가성비형' ? false : reservation.discountNewYear;
      if (finalDiscountNewYear) {
        discountAmount += 50000;
      }
      
      // 르메그라피 제휴 할인
      const mainSnapCompany = reservation.mainSnapCompany || '';
      const isLemeGraphy = mainSnapCompany.toLowerCase().includes('르메그라피') || mainSnapCompany.toLowerCase().includes('leme');
      if (isLemeGraphy && (newProductType === '기본형' || newProductType === '시네마틱형')) {
        discountAmount += 150000;
      }
      
      updateData.discountAmount = discountAmount;
      const referralDiscount = reservation.referralDiscount || 0;
      const reviewDiscount = reservation.reviewDiscount || 0;
      updateData.finalBalance = Math.max(0, newTotalAmount - depositAmount - discountAmount - referralDiscount - reviewDiscount);
      
      console.log(`[예약 수정] 상품만 변경 - 할인 재계산: discountAmount=${discountAmount}, finalBalance=${updateData.finalBalance}`);
    }

    // 짝궁할인 처리
    if (body.discountCouple) {
      // 짝궁할인을 체크한 경우
      if (reservation.partnerCode) {
        // 이미 입력된 경우 - 기존 값 유지
        updateData.partnerCode = reservation.partnerCode;
      } else if (body.partnerCode) {
        // 새로 입력한 경우 - 입력한 값 사용
        updateData.partnerCode = body.partnerCode;
      } else if (!reservation.referralCode) {
        // 짝궁할인을 신청하지 않았다가 신청한 경우 referralCode 생성
        const { decrypt } = await import('@/lib/encryption');
        const decryptedAuthor = decrypt(reservation.author) || '';
        
        if (reservation.weddingDate && decryptedAuthor) {
          try {
            // weddingDate를 YYYYMMDD 형식으로 변환
            let dateStr: string;
            if (typeof reservation.weddingDate === 'string') {
              dateStr = reservation.weddingDate.replace(/-/g, '').substring(0, 8);
              if (dateStr.length !== 8) {
                const date = new Date(reservation.weddingDate);
                if (!isNaN(date.getTime())) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  dateStr = `${year}${month}${day}`;
                } else {
                  dateStr = '';
                }
              }
            } else {
              dateStr = '';
            }

            if (dateStr) {
              // YYMMDD 형식으로 변환 (앞의 20 제거)
              const yy = dateStr.slice(2, 4);
              const mmdd = dateStr.slice(4, 8);
              // 이름에서 공백 제거
              const cleanName = decryptedAuthor.replace(/\s/g, '');
              const referralCode = `${yy}${mmdd} ${cleanName}`;
              updateData.referralCode = referralCode;
            }
          } catch (e) {
            console.error("Error generating referralCode:", e);
          }
        }
      }
    } else {
      // 짝궁할인을 체크하지 않은 경우 - partnerCode를 null로 저장
      updateData.partnerCode = null;
    }

    // 변경 사항 비교 및 PendingChange 생성
    // 개인정보는 복호화된 값으로 비교
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    // 비교할 필드 목록 (개인정보 제외)
    const fieldsToCompare = [
      'title', 'content', 'productType', 'foundPath', 'weddingDate', 'weddingTime',
      'venueName', 'venueFloor', 'guestCount', 'makeupShoot', 'paebaekShoot',
      'receptionShoot', 'mainSnapCompany', 'makeupShop', 'dressShop', 'usbOption',
      'seonwonpan', 'gimbalShoot', 'playbackDevice', 'eventType', 'shootLocation',
      'shootDate', 'shootTime', 'shootConcept', 'discountCouple', 'discountReview',
      'discountNewYear', 'discountReviewBlog', 'specialNotes', 'customShootingRequest',
      'customStyle', 'customEditStyle', 'customMusic', 'customLength', 'customEffect',
      'customContent', 'customSpecialRequest',
    ];

    // 개인정보 필드 (복호화하여 비교, 암호화된 값으로 저장)
    const encryptedFieldsToCompare = [
      { key: 'author', bodyKey: 'author', oldDecrypted: rAuthor },
      { key: 'brideName', bodyKey: 'brideName', oldDecrypted: rBrideName },
      { key: 'bridePhone', bodyKey: 'bridePhone', oldDecrypted: rBridePhone },
      { key: 'groomName', bodyKey: 'groomName', oldDecrypted: rGroomName },
      { key: 'groomPhone', bodyKey: 'groomPhone', oldDecrypted: rGroomPhone },
      { key: 'receiptPhone', bodyKey: 'receiptPhone', oldDecrypted: decrypt(reservation.receiptPhone) },
      { key: 'productEmail', bodyKey: 'productEmail', oldDecrypted: decrypt(reservation.productEmail) },
      { key: 'deliveryAddress', bodyKey: 'deliveryAddress', oldDecrypted: decrypt(reservation.deliveryAddress) },
      { key: 'depositName', bodyKey: 'depositName', oldDecrypted: reservation.depositName },
    ];

    // 일반 필드 변경 감지
    for (const field of fieldsToCompare) {
      const oldVal = (reservation as Record<string, unknown>)[field];
      const newVal = (updateData as Record<string, unknown>)[field];

      // 값이 다르면 변경사항에 추가
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[field] = { old: oldVal, new: newVal };
      }
    }

    // 개인정보 필드 변경 감지
    for (const { key, bodyKey, oldDecrypted } of encryptedFieldsToCompare) {
      const newVal = body[bodyKey];
      // 전화번호는 정규화해서 비교
      const normalizedOld = key.includes('Phone') ? normalizePhone(oldDecrypted || '') : oldDecrypted;
      const normalizedNew = key.includes('Phone') ? normalizePhone(newVal || '') : newVal;

      if (normalizedOld !== normalizedNew && (normalizedOld || normalizedNew)) {
        // 마스킹된 값으로 저장 (개인정보 보호)
        changes[key] = {
          old: key.includes('Phone') ? (normalizedOld ? normalizedOld.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3') : null) : (oldDecrypted || null),
          new: key.includes('Phone') ? (normalizedNew ? normalizedNew.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3') : null) : (newVal || null),
        };
      }
    }

    // 변경사항이 없으면 바로 반환
    if (Object.keys(changes).length === 0) {
      return NextResponse.json({
        success: true,
        message: '변경된 내용이 없습니다.',
      });
    }

    // 기존 대기중인 변경 요청이 있는지 확인
    const existingPending = await prisma.pendingChange.findFirst({
      where: {
        reservationId: reservationId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      // 기존 요청이 있으면 업데이트
      await prisma.pendingChange.update({
        where: { id: existingPending.id },
        data: {
          changes: JSON.stringify(changes),
          updatedAt: new Date(),
        },
      });
    } else {
      // 새 변경 요청 생성
      await prisma.pendingChange.create({
        data: {
          reservationId: reservationId,
          changes: JSON.stringify(changes),
        },
      });
    }

    console.log(`[예약 수정] 변경 요청 생성됨: reservationId=${reservationId}, 변경 필드=${Object.keys(changes).join(', ')}`);

    return NextResponse.json({
      success: true,
      message: '수정 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.',
      pendingApproval: true,
      changedFields: Object.keys(changes),
    });
  } catch (error) {
    console.error('예약 수정 오류:', error);
    return NextResponse.json(
      { error: '예약 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
