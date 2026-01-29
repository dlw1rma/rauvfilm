/**
 * 이전 사이트 계약자 엑셀 이관
 * POST /api/admin/bookings/import-excel
 * FormData: file (.xlsx / .xls)
 * - 북킹(Booking) 생성 + 예약글(Reservation) 생성 + 답변(Reply)으로 예약확정 처리
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';
import { encrypt } from '@/lib/encryption';
import { sanitizeString, normalizePhone } from '@/lib/validation';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
}

const AUTHOR_KEYS = ['계약자', '이름', '성함', '고객명', 'customerName', 'author'];
const BRIDE_NAME_KEYS = ['신부', '신부 이름', '신부명', 'brideName'];
const BRIDE_PHONE_KEYS = ['신부 전화', '신부 연락처', '신부 휴대폰', '신부 전화번호', 'bridePhone'];
const GROOM_NAME_KEYS = ['신랑', '신랑 이름', '신랑명', 'groomName'];
const GROOM_PHONE_KEYS = ['신랑 전화', '신랑 연락처', '신랑 휴대폰', '신랑 전화번호', 'groomPhone'];
const DATE_KEYS = ['예식일', '날짜', 'weddingDate'];
const TIME_KEYS = ['예식 시간', '시간', 'weddingTime'];
const VENUE_KEYS = ['예식장', '장소', 'weddingVenue'];
const VENUE_FLOOR_KEYS = ['층', '홀', '층/홀', 'venueFloor'];
const PRODUCT_TYPE_KEYS = ['상품', '상품 종류', 'productType'];
const RECEIPT_PHONE_KEYS = ['현금영수증', '영수증 전화', 'receiptPhone'];
const DEPOSIT_NAME_KEYS = ['예약금 입금자', '입금자명', 'depositName'];
const PRODUCT_EMAIL_KEYS = ['이메일', '상품 받을 이메일', 'productEmail'];
const PARTNER_CODE_KEYS = ['짝궁', '짝궁 코드', 'partnerCode'];
const GUEST_COUNT_KEYS = ['초대인원', '인원', 'guestCount'];
const SPECIAL_NOTES_KEYS = ['특이사항', '요구사항', 'specialNotes'];

function findCol(row: string[], keys: string[]): number {
  for (let i = 0; i < row.length; i++) {
    const cell = String(row[i] ?? '').trim();
    if (keys.some((k) => cell.includes(k))) return i;
  }
  return -1;
}

function parseDate(val: unknown): Date | null {
  if (val == null) return null;
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  const s = String(val).trim();
  if (!s) return null;
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function normalizePhone(val: unknown): string {
  return String(val ?? '').replace(/[^0-9]/g, '') || '';
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

    if (authorCol < 0 || brideNameCol < 0 || bridePhoneCol < 0 || groomNameCol < 0 || groomPhoneCol < 0 || dateCol < 0 || venueCol < 0) {
      return NextResponse.json(
        { error: '엑셀 1행에 필수 컬럼이 누락되었습니다. 계약자/이름, 신부 이름/전화, 신랑 이름/전화, 예식일/날짜, 예식장/장소가 필요합니다.' },
        { status: 400 }
      );
    }

    const defaultProduct = await prisma.product.findFirst({ where: {} });
    if (!defaultProduct) {
      return NextResponse.json({ error: '등록된 상품이 없습니다. 상품을 먼저 등록해주세요.' }, { status: 400 });
    }

    const created: { id: number; customerName: string; weddingDate: string }[] = [];
    const skipped: { row: number; reason: string }[] = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const author = sanitizeString(row[authorCol], 50);
      const brideName = sanitizeString(row[brideNameCol], 50);
      const bridePhone = normalizePhone(row[bridePhoneCol]);
      const groomName = sanitizeString(row[groomNameCol], 50);
      const groomPhone = normalizePhone(row[groomPhoneCol]);
      const weddingDate = parseDate(row[dateCol]);
      const weddingTime = String(row[timeCol] ?? '').trim();
      const weddingVenue = String(row[venueCol] ?? '').trim();
      const venueFloor = String(row[venueFloorCol] ?? '').trim();
      const productType = String(row[productTypeCol] ?? '').trim();
      const receiptPhone = normalizePhone(row[receiptPhoneCol]);
      const depositName = String(row[depositNameCol] ?? '').trim();
      const productEmail = String(row[productEmailCol] ?? '').trim();
      const partnerCode = String(row[partnerCodeCol] ?? '').trim();
      const guestCount = row[guestCountCol] ? parseInt(String(row[guestCountCol])) : null;
      const specialNotes = String(row[specialNotesCol] ?? '').trim();

      if (!author || !brideName || !bridePhone || !groomName || !groomPhone || !weddingVenue) {
        skipped.push({ row: r + 1, reason: '필수 항목 누락 (계약자/신부/신랑 이름·전화, 예식장)' });
        continue;
      }
      if (!weddingDate) {
        skipped.push({ row: r + 1, reason: '예식일 형식 오류' });
        continue;
      }
      if (bridePhone.length < 10 || groomPhone.length < 10) {
        skipped.push({ row: r + 1, reason: '전화번호 형식 오류' });
        continue;
      }

      try {
        // Booking 생성 (계약자는 author 사용)
        const b = await prisma.booking.create({
          data: {
            customerName: author,
            customerPhone: bridePhone, // 신부 전화를 기본으로
            weddingDate,
            weddingVenue,
            productId: defaultProduct.id,
            listPrice: defaultProduct.price,
            eventDiscount: 0,
            finalBalance: defaultProduct.price - 100000,
          },
        });

        // 짝궁코드 생성 (상품 종류가 가성비형/기본형이면 자동 생성)
        let referralCode: string | null = null;
        let finalPartnerCode: string | null = null;
        const isCoupleDiscount = productType === '가성비형' || productType === '기본형';
        
        if (isCoupleDiscount && !partnerCode) {
          const weddingDateStr = weddingDate.toISOString().slice(0, 10).replace(/-/g, '');
          const yy = weddingDateStr.slice(2, 4);
          const mmdd = weddingDateStr.slice(4, 8);
          const cleanName = author.replace(/\s/g, '');
          referralCode = `${yy}${mmdd} ${cleanName}`;
          finalPartnerCode = referralCode;
        } else if (partnerCode) {
          finalPartnerCode = partnerCode;
        }

        const weddingDateStr = weddingDate.toISOString().slice(0, 10);
        const title = `[엑셀 이관] ${author} ${weddingDateStr}`;
        const hashedPassword = await bcrypt.hash('excel-import', 10);
        const encryptedAuthor = encrypt(author) ?? author;

        // Reservation 생성 (일반 예약 폼과 동일한 필드)
        const res = await prisma.reservation.create({
          data: {
            title,
            author: encryptedAuthor,
            password: hashedPassword,
            content: specialNotes || `엑셀 이관: ${weddingVenue}`,
            isPrivate: true,
            status: 'CONFIRMED',
            // 필수 작성항목(공통) - 개인정보 암호화
            brideName: encrypt(brideName) || null,
            bridePhone: encrypt(bridePhone) || null,
            groomName: encrypt(groomName) || null,
            groomPhone: encrypt(groomPhone) || null,
            receiptPhone: receiptPhone ? encrypt(receiptPhone) : null,
            depositName: depositName || null,
            productEmail: productEmail ? encrypt(productEmail) : null,
            productType: productType || null,
            partnerCode: finalPartnerCode,
            foundPath: null,
            termsAgreed: true,
            faqRead: true,
            privacyAgreed: true,
            // 본식DVD 예약 고객님 필수 추가 작성 항목
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
            // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
            eventType: null,
            shootLocation: null,
            shootDate: null,
            shootTime: null,
            shootConcept: null,
            // 할인사항 (체크박스)
            discountCouple: isCoupleDiscount,
            discountReview: false,
            discountNewYear: true,
            discountReviewBlog: false,
            // 특이사항
            specialNotes: specialNotes || null,
            // 커스텀 촬영 요청 필드
            customShootingRequest: false,
            customStyle: null,
            customEditStyle: null,
            customMusic: null,
            customLength: null,
            customEffect: null,
            customContent: null,
            customSpecialRequest: null,
            // 잔금 및 할인 시스템
            totalAmount: defaultProduct.price,
            depositAmount: 100000,
            discountAmount: 0,
            referralDiscount: 0,
            reviewDiscount: 0,
            finalBalance: defaultProduct.price - 100000,
            referralCode,
            referredBy: null,
            referredCount: 0,
          },
        });

        await prisma.reply.create({
          data: {
            reservationId: res.id,
            content: '예약 확정되었습니다. (엑셀 이관)',
          },
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
    });
  } catch (error) {
    console.error('엑셀 이관 오류:', error);
    return NextResponse.json(
      { error: '엑셀 이관 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
