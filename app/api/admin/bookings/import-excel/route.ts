/**
 * 이전 사이트 계약자 엑셀 이관
 * POST /api/admin/bookings/import-excel
 * FormData: file (.xlsx / .xls)
 * - 북킹(Booking) 생성 + 예약글(Reservation) 생성 + 답변(Reply)으로 예약확정 처리
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { sanitizeString } from '@/lib/validation';
import { isAdminAuthenticated } from '@/lib/api';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';

const AUTHOR_KEYS = ['계약자', '이름', '성함', '고객명', 'customerName', 'author'];
const BRIDE_NAME_KEYS = ['신부', '신부 이름', '신부명', '신부님', 'brideName'];
const BRIDE_PHONE_KEYS = ['신부 전화', '신부 연락처', '신부 휴대폰', '신부 전화번호', '신부님 전화', 'bridePhone'];
const GROOM_NAME_KEYS = ['신랑', '신랑 이름', '신랑명', '신랑님', 'groomName'];
const GROOM_PHONE_KEYS = ['신랑 전화', '신랑 연락처', '신랑 휴대폰', '신랑 전화번호', '신랑님 전화', 'groomPhone'];
const DATE_KEYS = ['예식일', '날짜', '예식 날짜', '웨딩일', 'weddingDate'];
const TIME_KEYS = ['예식 시간', '시간', 'weddingTime'];
const VENUE_KEYS = ['예식장', '장소', '웨딩홀', 'weddingVenue'];
const VENUE_FLOOR_KEYS = ['층', '홀', '층/홀', 'venueFloor'];
const PRODUCT_TYPE_KEYS = ['상품', '상품 종류', '상품종류', '패키지', 'productType'];
const RECEIPT_PHONE_KEYS = ['현금영수증', '영수증 전화', 'receiptPhone'];
const DEPOSIT_NAME_KEYS = ['예약금 입금자', '입금자명', '입금자', 'depositName'];
const PRODUCT_EMAIL_KEYS = ['이메일', '상품 받을 이메일', 'email', 'productEmail'];
const PARTNER_CODE_KEYS = ['짝궁', '짝궁 코드', '짝궁코드', 'partnerCode'];
const GUEST_COUNT_KEYS = ['초대인원', '인원', 'guestCount'];
const SPECIAL_NOTES_KEYS = ['특이사항', '요구사항', '메모', 'specialNotes'];
const PHONE_KEYS = ['전화', '전화번호', '연락처', '휴대폰', 'phone'];
const PRICE_KEYS = ['금액', '가격', '정가', '총액', 'price', 'listPrice'];
const DISCOUNT_KEYS = ['할인', '할인금액', '할인액', 'discount'];
const TRAVEL_FEE_KEYS = ['출장비', '출장', 'travelFee'];

function findCol(row: string[], keys: string[]): number {
  for (let i = 0; i < row.length; i++) {
    const cell = String(row[i] ?? '').trim();
    if (keys.some((k) => cell.includes(k))) return i;
  }
  return -1;
}

function parseDate(val: unknown): Date | null {
  if (val == null) return null;
  // 엑셀 날짜 시리얼
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  // Date 객체 (cellDates: true)
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val;
  }
  const s = String(val).trim();
  if (!s) return null;
  // "2025.03.15", "2025-03-15", "2025/03/15", "25.03.15" 등 다양한 형식
  const cleaned = s.replace(/[./]/g, '-');
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) return parsed;
  // "250315" 형태 (6자리)
  if (/^\d{6}$/.test(s)) {
    const yy = parseInt(s.slice(0, 2));
    const mm = parseInt(s.slice(2, 4)) - 1;
    const dd = parseInt(s.slice(4, 6));
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    return new Date(year, mm, dd);
  }
  // "20250315" 형태 (8자리)
  if (/^\d{8}$/.test(s)) {
    const yyyy = parseInt(s.slice(0, 4));
    const mm = parseInt(s.slice(4, 6)) - 1;
    const dd = parseInt(s.slice(6, 8));
    return new Date(yyyy, mm, dd);
  }
  return null;
}

/**
 * 전화번호 정규화 (느슨한 버전 - 숫자만 추출)
 */
function flexNormalizePhone(val: string): string {
  return String(val ?? '').replace(/[^0-9]/g, '');
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !file.size) {
      return NextResponse.json({ error: '엑셀 파일을 선택해주세요.' }, { status: 400 });
    }

    // 파일 타입 검증 (보안)
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream', // 일부 브라우저에서 사용
    ];
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = allowedMimeTypes.includes(file.type) || file.type === '';

    if (!hasValidExtension) {
      return NextResponse.json(
        { error: '엑셀 파일(.xlsx, .xls)만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    if (!hasValidMimeType) {
      return NextResponse.json(
        { error: '잘못된 파일 형식입니다. 엑셀 파일을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
    const sn = wb.SheetNames[0];
    const ws = wb.Sheets[sn];
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
    if (rows.length < 2) {
      return NextResponse.json({ error: '데이터가 있는 행이 없습니다.' }, { status: 400 });
    }

    const header = rows[0].map((c) => String(c ?? '').trim());
    const authorCol = findCol(header, AUTHOR_KEYS);
    const brideNameCol = findCol(header, BRIDE_NAME_KEYS);
    const bridePhoneCol = findCol(header, BRIDE_PHONE_KEYS);
    const groomNameCol = findCol(header, GROOM_NAME_KEYS);
    const groomPhoneCol = findCol(header, GROOM_PHONE_KEYS);
    const dateCol = findCol(header, DATE_KEYS);
    const timeCol = findCol(header, TIME_KEYS);
    const venueCol = findCol(header, VENUE_KEYS);
    const venueFloorCol = findCol(header, VENUE_FLOOR_KEYS);
    const productTypeCol = findCol(header, PRODUCT_TYPE_KEYS);
    const receiptPhoneCol = findCol(header, RECEIPT_PHONE_KEYS);
    const depositNameCol = findCol(header, DEPOSIT_NAME_KEYS);
    const productEmailCol = findCol(header, PRODUCT_EMAIL_KEYS);
    const partnerCodeCol = findCol(header, PARTNER_CODE_KEYS);
    const guestCountCol = findCol(header, GUEST_COUNT_KEYS);
    const specialNotesCol = findCol(header, SPECIAL_NOTES_KEYS);
    const phoneCol = findCol(header, PHONE_KEYS);
    const priceCol = findCol(header, PRICE_KEYS);
    const discountCol = findCol(header, DISCOUNT_KEYS);
    const travelFeeCol = findCol(header, TRAVEL_FEE_KEYS);

    // 최소 필수: 계약자/이름 + 예식일 + 예식장
    if (authorCol < 0 && brideNameCol < 0 && groomNameCol < 0) {
      return NextResponse.json(
        { error: `엑셀 1행에 이름 컬럼이 없습니다. (계약자/신부/신랑 중 하나 필요)\n감지된 헤더: ${header.join(', ')}` },
        { status: 400 }
      );
    }
    if (dateCol < 0) {
      return NextResponse.json(
        { error: `엑셀 1행에 예식일/날짜 컬럼이 없습니다.\n감지된 헤더: ${header.join(', ')}` },
        { status: 400 }
      );
    }
    if (venueCol < 0) {
      return NextResponse.json(
        { error: `엑셀 1행에 예식장/장소 컬럼이 없습니다.\n감지된 헤더: ${header.join(', ')}` },
        { status: 400 }
      );
    }

    // DB에서 모든 상품 조회하여 이름으로 매칭 준비
    const allProducts = await prisma.product.findMany({ where: { isActive: true } });
    const defaultProduct = allProducts[0] ?? null;
    if (!defaultProduct) {
      return NextResponse.json({ error: '등록된 상품이 없습니다. 상품을 먼저 등록해주세요.' }, { status: 400 });
    }

    // 상품명 매칭 맵 (부분일치 지원)
    function findProduct(typeName: string) {
      if (!typeName) return defaultProduct;
      // 정확히 일치
      const exact = allProducts.find((p) => p.name === typeName);
      if (exact) return exact;
      // 부분 포함
      const partial = allProducts.find((p) => typeName.includes(p.name) || p.name.includes(typeName));
      if (partial) return partial;
      return defaultProduct;
    }

    const created: { id: number; customerName: string; weddingDate: string }[] = [];
    const skipped: { row: number; reason: string }[] = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] ?? [];

      // 이름: 계약자 > 신부 > 신랑 순으로 fallback
      const author = sanitizeString(row[authorCol], 50)
        || sanitizeString(row[brideNameCol], 50)
        || sanitizeString(row[groomNameCol], 50);
      const brideName = sanitizeString(row[brideNameCol], 50) || author;
      const groomName = sanitizeString(row[groomNameCol], 50) || '';

      // 전화번호: 각 컬럼 > 범용 '전화번호' 컬럼 순으로 fallback
      const bridePhone = flexNormalizePhone(String(row[bridePhoneCol] ?? ''))
        || flexNormalizePhone(String(row[phoneCol] ?? ''));
      const groomPhone = flexNormalizePhone(String(row[groomPhoneCol] ?? ''));

      const weddingDate = parseDate(row[dateCol]);
      const weddingTime = timeCol >= 0 ? String(row[timeCol] ?? '').trim() : '';
      const weddingVenue = String(row[venueCol] ?? '').trim();
      const venueFloor = venueFloorCol >= 0 ? String(row[venueFloorCol] ?? '').trim() : '';
      const productType = productTypeCol >= 0 ? String(row[productTypeCol] ?? '').trim() : '';
      const receiptPhone = receiptPhoneCol >= 0 ? flexNormalizePhone(String(row[receiptPhoneCol] ?? '')) : '';
      const depositName = depositNameCol >= 0 ? String(row[depositNameCol] ?? '').trim() : '';
      const productEmail = productEmailCol >= 0 ? String(row[productEmailCol] ?? '').trim() : '';
      const partnerCode = partnerCodeCol >= 0 ? String(row[partnerCodeCol] ?? '').trim() : '';
      const guestCount = guestCountCol >= 0 && row[guestCountCol] ? parseInt(String(row[guestCountCol])) : null;
      const specialNotes = specialNotesCol >= 0 ? String(row[specialNotesCol] ?? '').trim() : '';
      const customPrice = priceCol >= 0 && row[priceCol] ? parseInt(String(row[priceCol]).replace(/[^0-9]/g, '')) : null;
      const customDiscount = discountCol >= 0 && row[discountCol] ? parseInt(String(row[discountCol]).replace(/[^0-9]/g, '')) : 0;
      const customTravelFee = travelFeeCol >= 0 && row[travelFeeCol] ? parseInt(String(row[travelFeeCol]).replace(/[^0-9]/g, '')) : 0;

      // 최소 필수: 이름 + 예식일 + 예식장
      if (!author) {
        skipped.push({ row: r + 1, reason: '이름 없음 (계약자/신부/신랑 모두 비어있음)' });
        continue;
      }
      if (!weddingDate) {
        skipped.push({ row: r + 1, reason: `예식일 형식 오류: "${String(row[dateCol] ?? '')}"` });
        continue;
      }
      if (!weddingVenue) {
        skipped.push({ row: r + 1, reason: '예식장 없음' });
        continue;
      }

      // 전화번호가 없으면 더미값 사용 (이관 데이터이므로)
      const customerPhone = bridePhone || groomPhone || '00000000000';

      try {
        // 상품 매칭
        const matchedProduct = findProduct(productType);

        // 짝궁코드 생성
        let referralCode: string | null = null;
        let finalPartnerCode: string | null = null;
        const isCoupleDiscount = productType === '가성비형' || productType === '기본형';

        if (isCoupleDiscount && !partnerCode) {
          const weddingDateStr2 = weddingDate.toISOString().slice(0, 10).replace(/-/g, '');
          const yy = weddingDateStr2.slice(2, 4);
          const mmdd = weddingDateStr2.slice(4, 8);
          const cleanName = author.replace(/\s/g, '');
          referralCode = `${yy}${mmdd} ${cleanName}`;
          finalPartnerCode = referralCode;
        } else if (partnerCode) {
          finalPartnerCode = partnerCode;
        }

        // 짝궁코드 중복 체크 - 중복 시 접미사 추가
        if (finalPartnerCode) {
          const baseCode = finalPartnerCode;
          let suffix = 0;
          while (await prisma.booking.findUnique({ where: { partnerCode: finalPartnerCode! } })) {
            suffix++;
            finalPartnerCode = `${baseCode}(${suffix})`;
          }
          if (suffix > 0) {
            referralCode = finalPartnerCode;
          }
        }

        // 1. Booking 생성 - 금액/할인/출장비 적용
        const listPrice = customPrice && customPrice > 0 ? customPrice : matchedProduct.price;
        const travelFee = customTravelFee || 0;
        // 26년 신년할인 (5만원) - 가성비형/1인1캠 제외
        const isGaseongbiOrOneCam = productType.includes('가성비') || matchedProduct.name === '가성비형'
          || productType.includes('1인1캠') || matchedProduct.name.includes('1인1캠');
        const newYearDiscount = isGaseongbiOrOneCam ? 0 : 50000;
        const eventDiscount = (customDiscount || 0) + newYearDiscount;
        const finalBalance = Math.max(0, listPrice + travelFee - 100000 - eventDiscount);

        const b = await prisma.booking.create({
          data: {
            customerName: author,
            customerPhone: customerPhone,
            customerEmail: productEmail || null,
            weddingDate,
            weddingTime: weddingTime || null,
            weddingVenue,
            status: 'CONFIRMED',
            partnerCode: finalPartnerCode,
            productId: matchedProduct.id,
            listPrice,
            travelFee,
            eventDiscount,
            finalBalance,
          },
        });

        const weddingDateStr = weddingDate.toISOString().slice(0, 10);
        const title = `[엑셀 이관] ${author} ${weddingDateStr}`;
        const hashedPassword = await bcrypt.hash('excel-import', 10);
        const encryptedAuthor = encrypt(author) ?? author;

        // 2. Reservation 생성 (bookingId 연결)
        const res = await prisma.reservation.create({
          data: {
            bookingId: b.id,
            title,
            author: encryptedAuthor,
            password: hashedPassword,
            content: specialNotes || `엑셀 이관: ${weddingVenue}`,
            isPrivate: true,
            status: 'CONFIRMED',
            brideName: brideName ? (encrypt(brideName) || null) : null,
            bridePhone: bridePhone ? (encrypt(bridePhone) || null) : null,
            groomName: groomName ? (encrypt(groomName) || null) : null,
            groomPhone: groomPhone ? (encrypt(groomPhone) || null) : null,
            receiptPhone: receiptPhone ? (encrypt(receiptPhone) || null) : null,
            depositName: depositName || null,
            productEmail: productEmail ? (encrypt(productEmail) || null) : null,
            productType: productType || matchedProduct.name,
            partnerCode: finalPartnerCode,
            foundPath: null,
            termsAgreed: true,
            faqRead: true,
            privacyAgreed: true,
            weddingDate: weddingDateStr,
            weddingTime: weddingTime || null,
            venueName: weddingVenue,
            venueFloor: venueFloor || null,
            guestCount: guestCount || null,
            makeupShoot: false,
            paebaekShoot: false,
            receptionShoot: false,
            mainSnapCompany: null,
            makeupShop: null,
            dressShop: null,
            deliveryAddress: null,
            usbOption: false,
            seonwonpan: false,
            gimbalShoot: false,
            playbackDevice: null,
            eventType: null,
            shootLocation: null,
            shootDate: null,
            shootTime: null,
            shootConcept: null,
            discountCouple: isCoupleDiscount,
            discountReview: false,
            discountNewYear: !isGaseongbiOrOneCam, // 가성비형/1인1캠 제외
            discountReviewBlog: false,
            specialNotes: specialNotes || null,
            customShootingRequest: false,
            customStyle: null,
            customEditStyle: null,
            customMusic: null,
            customLength: null,
            customEffect: null,
            customContent: null,
            customSpecialRequest: null,
            travelFee,
            totalAmount: listPrice,
            depositAmount: 100000,
            discountAmount: eventDiscount,
            referralDiscount: 0,
            reviewDiscount: 0,
            finalBalance,
            referralCode,
            referredBy: null,
            referredCount: 0,
          },
        });

        // 3. Booking에 reservationId 업데이트
        await prisma.booking.update({
          where: { id: b.id },
          data: { reservationId: res.id },
        });

        created.push({
          id: b.id,
          customerName: b.customerName,
          weddingDate: b.weddingDate.toISOString(),
        });
      } catch (e) {
        skipped.push({ row: r + 1, reason: e instanceof Error ? e.message : '생성 실패' });
      }
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      skipped: skipped.length,
      createdIds: created.map((c) => c.id),
      skippedRows: skipped,
      // 디버깅용: 감지된 컬럼
      detectedColumns: {
        계약자: authorCol >= 0 ? header[authorCol] : '(미감지)',
        신부: brideNameCol >= 0 ? header[brideNameCol] : '(미감지)',
        신랑: groomNameCol >= 0 ? header[groomNameCol] : '(미감지)',
        예식일: header[dateCol],
        예식장: header[venueCol],
        상품: productTypeCol >= 0 ? header[productTypeCol] : '(미감지)',
        금액: priceCol >= 0 ? header[priceCol] : '(미감지)',
        할인: discountCol >= 0 ? header[discountCol] : '(미감지)',
        출장비: travelFeeCol >= 0 ? header[travelFeeCol] : '(미감지)',
        전화번호: phoneCol >= 0 ? header[phoneCol] : '(미감지)',
        신부전화: bridePhoneCol >= 0 ? header[bridePhoneCol] : '(미감지)',
        신랑전화: groomPhoneCol >= 0 ? header[groomPhoneCol] : '(미감지)',
      },
      matchedProducts: allProducts.map((p) => p.name),
    });
  } catch (error) {
    console.error('엑셀 이관 오류:', error);
    return NextResponse.json(
      { error: '엑셀 이관 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
