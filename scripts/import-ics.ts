/**
 * ICS Calendar Data Import Script
 *
 * Google Calendar의 ICS 파일을 파싱하여 Booking 테이블로 이관
 *
 * Usage:
 *   npx tsx scripts/import-ics.ts          # 드라이런 (미리보기, 기본)
 *   npx tsx scripts/import-ics.ts --run     # 실제 마이그레이션 (DB 저장)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { encrypt } from '../lib/encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// ============================================================
// Types
// ============================================================

interface ICSEvent {
  uid: string;
  dtstart: string; // YYYYMMDD
  summary: string;
  description: string;
  status: string;
}

interface ParsedBooking {
  weddingDate: Date;
  weddingTime: string | null;
  weddingVenue: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  groomName: string | null;
  groomPhone: string | null;
  productType: string;
  listPrice: number;
  depositAmount: number;
  travelFee: number;
  eventDiscount: number;
  newYearDiscount: number;
  referralDiscount: number;
  reviewDiscount: number;
  finalBalance: number;
  partnerCode: string | null;
  isCancelled: boolean;
  adminNote: string;
  rawSummary: string;
}

// ============================================================
// ICS Parser
// ============================================================

function parseICSFile(filePath: string): ICSEvent[] {
  const content = fs.readFileSync(filePath, 'utf-8');

  // ICS continuation lines: lines starting with space/tab are joined to previous line
  const unfolded = content.replace(/\r?\n[ \t]/g, '');

  const events: ICSEvent[] = [];
  const lines = unfolded.split(/\r?\n/);

  let inEvent = false;
  let currentEvent: Partial<ICSEvent> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      inEvent = false;
      if (currentEvent.dtstart && currentEvent.summary) {
        events.push({
          uid: currentEvent.uid || '',
          dtstart: currentEvent.dtstart,
          summary: currentEvent.summary,
          description: currentEvent.description || '',
          status: currentEvent.status || 'CONFIRMED',
        });
      }
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith('DTSTART;VALUE=DATE:')) {
      currentEvent.dtstart = line.replace('DTSTART;VALUE=DATE:', '');
    } else if (line.startsWith('DTSTART:')) {
      currentEvent.dtstart = line.replace('DTSTART:', '').substring(0, 8);
    } else if (line.startsWith('SUMMARY:')) {
      currentEvent.summary = unescapeICS(line.replace('SUMMARY:', ''));
    } else if (line.startsWith('DESCRIPTION:')) {
      currentEvent.description = unescapeICS(line.replace('DESCRIPTION:', ''));
    } else if (line.startsWith('UID:')) {
      currentEvent.uid = line.replace('UID:', '');
    } else if (line.startsWith('STATUS:')) {
      currentEvent.status = line.replace('STATUS:', '');
    }
  }

  return events;
}

function unescapeICS(text: string): string {
  return text
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}

// ============================================================
// HTML -> Plain Text
// ============================================================

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/-&gt;/g, '→')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================================
// Data Extraction Helpers
// ============================================================

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-]/g, '');
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length >= 10) return digits;
  return '';
}

function extractBrideInfo(text: string): { name: string | null; phone: string | null } {
  // Bride name - stop before 전화/연락처/double-space/newline
  const nameMatch = text.match(/신부님\s*성함\s*[:：]\s*(.+?)(?:\s{2,}|전화|연락처|\n|$)/);
  const name = nameMatch ? nameMatch[1].trim() : null;

  // Bride phone - "전화 번호" in bride section (before 신랑님)
  let phone: string | null = null;
  const brideSection = text.split(/신랑님\s*성함/)[0] || text;
  const phoneMatch = brideSection.match(/전화\s*번호\s*[:：]\s*([\d\-\s]+)/);
  if (phoneMatch) {
    phone = normalizePhone(phoneMatch[1]);
  }

  // Alternative: 신부님 연락처 (may appear after 신랑님 성함, search full text)
  if (!phone) {
    const contactMatch = text.match(/신부님\s*연락처\s*[:：]?\s*\n?\s*([\d\-\s]+)/);
    if (contactMatch) {
      phone = normalizePhone(contactMatch[1]);
    }
  }

  return { name, phone: phone || null };
}

function extractGroomInfo(text: string): { name: string | null; phone: string | null } {
  // Groom name - stop before 전화/연락처/double-space/newline
  const nameMatch = text.match(/신랑님\s*성함\s*[:：]\s*(.+?)(?:\s{2,}|전화|연락처|\n|$)/);
  const name = nameMatch ? nameMatch[1].trim() : null;

  // Groom phone - "전화 번호" in groom section (after 신랑님 성함, before 현금)
  let phone: string | null = null;
  const groomMatch = text.match(/신랑님\s*성함[\s\S]*/);
  const groomSection = groomMatch ? groomMatch[0] : '';
  // Stop at 현금 영수증 or 예약금 to avoid picking up other numbers
  const groomPhoneArea = groomSection.split(/현금|예약금|이메일/)[0] || groomSection;
  const phoneMatch = groomPhoneArea.match(/전화\s*번호\s*[:：]\s*([\d\-\s]+)/);
  if (phoneMatch) {
    phone = normalizePhone(phoneMatch[1]);
  }

  // Alternative: 신랑님 연락처
  if (!phone) {
    const contactMatch = text.match(/신랑님\s*연락처\s*[:：]?\s*\n?\s*([\d\-\s]+)/);
    if (contactMatch) {
      phone = normalizePhone(contactMatch[1]);
    }
  }

  return { name, phone: phone || null };
}

function extractProductType(description: string): string {
  const productMatch = description.match(/상품\s*종류[^:：]*[:：][ \t]*([^\n]+)/);
  if (productMatch) {
    const raw = productMatch[1].trim();
    if (raw.includes('시네마틱')) return '시네마틱형';
    if (raw.includes('가성비') || raw.includes('1인1캠')) return '가성비형';
    if (raw.includes('기본') || raw.includes('1인2캠') || raw.includes('1인 2캠')) return '기본형';
    if (raw.includes('야외스냅') || raw.includes('프리웨딩')) return '야외스냅';
  }

  // Fallback from other description patterns
  const selectMatch = description.match(/상품선택[\s\S]*?→\s*([^\n]+)/);
  if (selectMatch) {
    const raw = selectMatch[1].trim();
    if (raw.includes('가성비')) return '가성비형';
    if (raw.includes('기본')) return '기본형';
    if (raw.includes('시네마틱')) return '시네마틱형';
  }

  if (description.includes('1인1캠')) return '가성비형';

  return '기본형'; // default
}

function extractVenue(description: string, summary: string): string {
  // From DESCRIPTION - use [ \t]* to avoid eating newlines, stop at 층/홀 or double-space
  const venueMatch = description.match(/장소명\s*[:：][ \t]*(.+?)(?:\s{2,}|층\/홀|\n|$)/);
  if (venueMatch && venueMatch[1].trim()) {
    return venueMatch[1].trim();
  }

  // Alternate format: 예식장소
  const venueMatch2 = description.match(/예식장소\s*[:：][ \t]*(.+?)(?:\s{2,}|\n|$)/);
  if (venueMatch2 && venueMatch2[1].trim()) {
    return venueMatch2[1].trim();
  }

  // From SUMMARY: time.라우브(x).(D)photographer.VENUE.customer
  const cleanSummary = summary.replace(/^예약취소\./, '');
  const parts = cleanSummary.split('.');
  if (parts.length >= 4) {
    return parts[parts.length - 2].trim();
  }

  return '미정';
}

function extractWeddingTime(description: string, summary: string): string | null {
  // From DESCRIPTION (use [ \t]* to avoid eating newlines)
  const timeMatch = description.match(/예식\s*시간\s*[:：][ \t]*([^\n]+)/);
  if (timeMatch && timeMatch[1].trim()) {
    return timeMatch[1].trim();
  }

  // From SUMMARY: first segment is time
  const cleanSummary = summary.replace(/^예약취소\./, '').replace(/^메이크업샵/, '');
  const parts = cleanSummary.split('.');

  if (parts.length >= 2) {
    const timeStr = parts[0].trim();

    // Format: 1510 → 15:10
    const numMatch = timeStr.match(/^(\d{3,4})$/);
    if (numMatch) {
      const t = numMatch[1];
      if (t.length === 3) return `${t[0]}:${t.slice(1)}`;
      if (t.length === 4) return `${t.slice(0, 2)}:${t.slice(2)}`;
    }

    // Format: 10시 → 10:00
    const hourMatch = timeStr.match(/^(\d{1,2})시$/);
    if (hourMatch) return `${hourMatch[1]}:00`;
  }

  return null;
}

function extractEmail(rawDescription: string): string | null {
  // Extract from mailto: links (before HTML stripping)
  const mailtoMatch = rawDescription.match(/mailto:([^"'\s<>]+)/);
  if (mailtoMatch) return mailtoMatch[1].trim();

  // From plain text
  const emailMatch = rawDescription.match(/(?:E-?\s*mail|이메일)\s*(?:주소)?\s*[:：]\s*([^\s<\n]+@[^\s<\n]+)/i);
  if (emailMatch) return emailMatch[1].trim();

  return null;
}

function extractPartnerCode(description: string): string | null {
  const match = description.match(/짝(?:궁|꿍)\s*코드\s*[:：]\s*([^\n]+)/);
  if (match) {
    const raw = match[1].trim();
    if (!raw || raw === '' || /^[xX없]/.test(raw) || raw === '-') return null;
    // Extract the code part (e.g., "261017 차헌지" or just "없음")
    return raw;
  }
  return null;
}

function extractCustomerNameFromSummary(summary: string): string | null {
  const cleaned = summary.replace(/^예약취소\./, '');
  const parts = cleaned.split('.');
  if (parts.length >= 3) {
    let name = parts[parts.length - 1].trim();
    // Remove common suffixes: mc, m, 님, 님mc, 님m
    name = name.replace(/(?:님)?(?:mc|m)$/i, '').trim();
    if (name) return name;
  }
  return null;
}

// ============================================================
// Balance Parsing
// ============================================================

function extractBalance(description: string): {
  finalBalance: number;
  depositAmount: number;
  travelFee: number;
  eventDiscount: number;
  newYearDiscount: number;
  referralDiscount: number;
  reviewDiscount: number;
} {
  const result = {
    finalBalance: 0,
    depositAmount: 100000,
    travelFee: 0,
    eventDiscount: 0,
    newYearDiscount: 0,
    referralDiscount: 0,
    reviewDiscount: 0,
  };

  // Find balance line: "잔금 XX (breakdown)"
  // Amount can be in 만원 (e.g., 47.3 → 473,000) or 원 (e.g., 330000)
  const lines = description.split('\n');
  for (const line of lines) {
    const balanceMatch = line.match(/잔금\s*([\d.]+)/);
    if (!balanceMatch) continue;

    const num = parseFloat(balanceMatch[1]);
    // If > 1000, assume 원 unit; otherwise 만원 unit
    result.finalBalance = num > 1000 ? Math.round(num) : Math.round(num * 10000);

    // Extract breakdown from parentheses
    const openIdx = line.indexOf('(');
    const closeIdx = line.lastIndexOf(')');
    if (openIdx === -1 || closeIdx <= openIdx) break;

    const breakdown = line.substring(openIdx + 1, closeIdx);
    // Split on comma or ". " (dot+space, avoiding decimals like 3.3)
    const items = breakdown.split(/,\s*|(?<=\d)\.\s+/);

    for (const item of items) {
      const trimmed = item.trim();
      // Extract numeric value (e.g., "-10", "+3.3", "-1")
      const amountMatch = trimmed.match(/([+-]?)\s*([\d.]+)/);
      if (!amountMatch) continue;

      const sign = amountMatch[1] === '+' ? 1 : -1;
      const amount = Math.round(parseFloat(amountMatch[2]) * 10000);

      if (trimmed.includes('예약금')) {
        result.depositAmount = amount;
      } else if (trimmed.includes('출장비')) {
        result.travelFee = amount; // positive value
      } else if (trimmed.includes('짝궁') || trimmed.includes('짝꿍')) {
        result.referralDiscount = amount;
      } else if (
        trimmed.includes('신년') ||
        trimmed.includes('선할인') ||
        trimmed.includes('얼리버드')
      ) {
        result.newYearDiscount = amount;
      } else if (
        trimmed.includes('후기') ||
        trimmed.includes('촬영후기') ||
        trimmed.includes('예약후기')
      ) {
        result.reviewDiscount += amount;
      }
      // 피로연추가, USB추가 등은 정가에 포함된 것으로 adminNote에서 확인
    }

    break; // first balance line only
  }

  return result;
}

// ============================================================
// Filtering
// ============================================================

function isBookingEvent(summary: string): boolean {
  return summary.includes('라우브');
}

function isCancelledEvent(summary: string): boolean {
  return summary.startsWith('예약취소');
}

// ============================================================
// Product Prices (참조용)
// ============================================================

const PRODUCT_PRICES: Record<string, number> = {
  '가성비형': 340000,
  '기본형': 600000,
  '시네마틱형': 950000,
  '야외스냅': 50000,
};

// ============================================================
// Main
// ============================================================

async function main() {
  const isRun = process.argv.includes('--run');
  const icsPath = path.resolve(__dirname, '..', 'tpgks2020@gmail.com.ics');
  const errorLogPath = path.resolve(__dirname, '..', 'import-error.log');

  console.log(`\nICS 파일: ${icsPath}`);
  console.log(`모드: ${isRun ? '마이그레이션 (DB 저장)' : '드라이런 (미리보기)'}\n`);

  // 1. Parse ICS file
  const events = parseICSFile(icsPath);
  console.log(`전체 이벤트 수: ${events.length}`);

  // 2. Filter booking events only (contains '라우브')
  const bookingEvents = events.filter((e) => isBookingEvent(e.summary));
  const nonBookingEvents = events.filter((e) => !isBookingEvent(e.summary));
  console.log(`예약 이벤트 수: ${bookingEvents.length}`);
  console.log(`비예약 이벤트 (건너뛰기): ${nonBookingEvents.length}`);

  if (nonBookingEvents.length > 0) {
    console.log('\n--- 건너뛴 이벤트 ---');
    nonBookingEvents.forEach((e) => {
      console.log(`  [${e.dtstart}] ${e.summary}`);
    });
  }

  // 3. Get products from DB (only for --run mode)
  let products: { id: number; name: string; price: number }[] = [];
  if (isRun) {
    products = await prisma.product.findMany({ where: { isActive: true } });
    console.log(
      `\nDB 상품 목록: ${products.map((p) => `${p.name}(${p.price.toLocaleString()})`).join(', ')}`
    );
  }

  // 4. Parse each booking event
  const parsed: ParsedBooking[] = [];
  const errors: { summary: string; error: string }[] = [];

  for (const event of bookingEvents) {
    try {
      const desc = stripHtml(event.description);
      const isCancelled = isCancelledEvent(event.summary);

      // Extract data from description
      const brideInfo = extractBrideInfo(desc);
      const groomInfo = extractGroomInfo(desc);
      const productType = extractProductType(desc);
      const venue = extractVenue(desc, event.summary);
      const weddingTime = extractWeddingTime(desc, event.summary);
      const email = extractEmail(event.description); // raw HTML for mailto
      const partnerCode = extractPartnerCode(desc);
      const balance = extractBalance(desc);

      // Customer name: prefer bride name, fallback to SUMMARY
      const customerName =
        brideInfo.name || extractCustomerNameFromSummary(event.summary) || '미상';
      const customerPhone = brideInfo.phone || '000-0000-0000';

      // Wedding date from DTSTART (YYYYMMDD)
      const ds = event.dtstart;
      const weddingDate = new Date(
        parseInt(ds.slice(0, 4)),
        parseInt(ds.slice(4, 6)) - 1,
        parseInt(ds.slice(6, 8)),
        12,
        0,
        0
      );

      const listPrice = PRODUCT_PRICES[productType] || 600000;

      // 잔금 0인 경우 체험단으로 분류
      const isExperience = balance.finalBalance === 0;
      const eventDiscount = isExperience
        ? Math.max(0, listPrice - balance.depositAmount)
        : balance.eventDiscount;
      const finalBalance = isExperience ? 0 : balance.finalBalance;

      const noteTag = isExperience ? '[ICS/체험단]' : '[ICS]';
      const adminNote = `${noteTag} ${event.summary}\n\n${desc}`.substring(0, 5000);

      parsed.push({
        weddingDate,
        weddingTime,
        weddingVenue: venue,
        customerName,
        customerPhone,
        customerEmail: email,
        groomName: groomInfo.name,
        groomPhone: groomInfo.phone,
        productType,
        listPrice,
        ...balance,
        eventDiscount,
        finalBalance,
        partnerCode,
        isCancelled,
        adminNote,
        rawSummary: event.summary,
      });
    } catch (err) {
      errors.push({
        summary: event.summary,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 5. Display results
  console.log(`\n파싱 성공: ${parsed.length}건`);
  console.log(`파싱 실패: ${errors.length}건\n`);

  // Console table
  const tableData = parsed.map((p, i) => ({
    '#': i + 1,
    날짜: p.weddingDate.toISOString().slice(0, 10),
    시간: p.weddingTime || '-',
    고객명: p.customerName,
    전화번호: p.customerPhone,
    장소: p.weddingVenue.substring(0, 20),
    상품: p.productType,
    정가: p.listPrice.toLocaleString(),
    잔금: p.finalBalance.toLocaleString(),
    출장비: p.travelFee > 0 ? p.travelFee.toLocaleString() : '-',
    신년할인: p.newYearDiscount > 0 ? p.newYearDiscount.toLocaleString() : '-',
    짝꿍할인: p.referralDiscount > 0 ? p.referralDiscount.toLocaleString() : '-',
    취소: p.isCancelled ? 'Y' : '',
  }));

  console.table(tableData);

  // 6. Deduplication check
  const dupeMap = new Map<string, number>();
  const dupes: string[] = [];
  for (const p of parsed) {
    const key = `${p.weddingDate.toISOString().slice(0, 10)}_${p.customerName}`;
    const count = (dupeMap.get(key) || 0) + 1;
    dupeMap.set(key, count);
    if (count === 2) dupes.push(key);
  }

  if (dupes.length > 0) {
    console.log(`\n중복 감지 (날짜+이름): ${dupes.length}건`);
    dupes.forEach((d) => console.log(`  - ${d}`));
  }

  // 7. Write errors to log
  if (errors.length > 0) {
    const errorLog = errors
      .map((e) => `[PARSE ERROR] ${e.summary}\n  ${e.error}\n`)
      .join('\n');
    fs.writeFileSync(errorLogPath, errorLog, 'utf-8');
    console.log(`\n에러 로그 저장: ${errorLogPath}`);
  }

  // 8. Migration mode
  if (isRun) {
    const isReset = process.argv.includes('--reset');

    if (isReset) {
      console.log('\n=== DB 초기화 (--reset) ===');
      // 관련 테이블 순서대로 삭제 (FK 의존성 고려)
      const deletedReviewSubmissions = await prisma.reviewSubmission.deleteMany({});
      console.log(`  ReviewSubmission 삭제: ${deletedReviewSubmissions.count}건`);

      const deletedPendingChanges = await prisma.pendingChange.deleteMany({});
      console.log(`  PendingChange 삭제: ${deletedPendingChanges.count}건`);

      // Booking 자기참조 FK 해제
      await prisma.booking.updateMany({ data: { referredByBookingId: null } });

      const deletedBookings = await prisma.booking.deleteMany({});
      console.log(`  Booking 삭제: ${deletedBookings.count}건`);

      // Reservation 삭제 (Reply는 onDelete: Cascade로 자동 삭제)
      const deletedReservations = await prisma.reservation.deleteMany({});
      console.log(`  Reservation 삭제: ${deletedReservations.count}건 (Reply 포함)`);

      console.log('  DB 초기화 완료\n');
    }

    console.log('\n마이그레이션 시작...\n');

    let created = 0;
    let skipped = 0;
    let failed = 0;
    const migrationErrors: string[] = [];

    for (const booking of parsed) {
      try {
        // Deduplication: same date + customer name
        const existing = await prisma.booking.findFirst({
          where: {
            weddingDate: booking.weddingDate,
            customerName: booking.customerName,
          },
        });

        if (existing) {
          console.log(`  건너뛰기 (중복): ${booking.customerName} - ${booking.weddingDate.toISOString().slice(0, 10)}`);
          skipped++;
          continue;
        }

        // Find matching product (exclude "기본 상품" — only match "기본형")
        const product = products.find((p) => {
          if (booking.productType === '가성비형')
            return p.name.includes('가성비') || p.name.includes('1인1캠');
          if (booking.productType === '시네마틱형') return p.name.includes('시네마틱');
          if (booking.productType === '기본형')
            return p.name === '기본형' || p.name.includes('1인2캠') || p.name.includes('1인 2캠');
          return false;
        });

        if (!product) {
          migrationErrors.push(
            `상품 매핑 실패: ${booking.productType} (${booking.rawSummary})`
          );
          failed++;
          continue;
        }

        const bookingStatus = booking.isCancelled ? 'CANCELLED' : 'CONFIRMED';

        // 1) Booking 생성
        const newBooking = await prisma.booking.create({
          data: {
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            customerEmail: booking.customerEmail,
            weddingDate: booking.weddingDate,
            weddingVenue: booking.weddingVenue,
            weddingTime: booking.weddingTime,
            productId: product.id,
            listPrice: product.price,
            depositAmount: booking.depositAmount,
            travelFee: booking.travelFee,
            eventDiscount: booking.eventDiscount,
            newYearDiscount: booking.newYearDiscount,
            referralDiscount: booking.referralDiscount,
            reviewDiscount: booking.reviewDiscount,
            finalBalance: booking.finalBalance,
            referredBy: booking.partnerCode,
            status: bookingStatus,
            adminNote: booking.adminNote,
          },
        });

        // 2) Reservation(예약글) 동기화 생성
        try {
          const weddingDateStr = booking.weddingDate.toISOString().slice(0, 10);
          const title = '본식DVD 예약합니다';
          const hashedPassword = await bcrypt.hash('ics-import', 10);
          const encryptedAuthor = encrypt(booking.customerName) ?? booking.customerName;
          const encryptedBrideName = encrypt(booking.customerName) ?? null;
          const encryptedBridePhone = booking.customerPhone !== '000-0000-0000'
            ? (encrypt(booking.customerPhone) ?? null) : null;
          const encryptedGroomName = booking.groomName
            ? (encrypt(booking.groomName) ?? null) : null;
          const encryptedGroomPhone = booking.groomPhone
            ? (encrypt(booking.groomPhone) ?? null) : null;

          const reservation = await prisma.reservation.create({
            data: {
              title,
              author: encryptedAuthor,
              password: hashedPassword,
              content: '본식DVD 예약합니다',
              isPrivate: true,
              status: bookingStatus,
              weddingDate: weddingDateStr,
              weddingTime: booking.weddingTime || null,
              venueName: booking.weddingVenue,
              productType: product.name || null,
              brideName: encryptedBrideName,
              bridePhone: encryptedBridePhone,
              groomName: encryptedGroomName,
              groomPhone: encryptedGroomPhone,
              termsAgreed: true,
              faqRead: true,
              privacyAgreed: true,
              travelFee: booking.travelFee,
              totalAmount: product.price,
              depositAmount: booking.depositAmount,
              discountAmount: booking.eventDiscount + booking.referralDiscount + booking.newYearDiscount + booking.reviewDiscount,
              referralDiscount: booking.referralDiscount,
              reviewDiscount: booking.reviewDiscount,
              finalBalance: booking.finalBalance,
              partnerCode: booking.partnerCode || null,
              referredBy: booking.partnerCode || null,
              bookingId: newBooking.id,
            },
          });

          // Booking에 reservationId 연결
          await prisma.booking.update({
            where: { id: newBooking.id },
            data: { reservationId: reservation.id },
          });
        } catch (syncError) {
          console.error(`  예약글 동기화 오류 (Booking은 생성됨): ${booking.customerName}`, syncError);
        }

        console.log(`  생성: ${booking.customerName} - ${booking.weddingDate.toISOString().slice(0, 10)} (${booking.productType})`);
        created++;
      } catch (err) {
        failed++;
        migrationErrors.push(
          `${booking.rawSummary}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    console.log(`\n--- 마이그레이션 결과 ---`);
    console.log(`  생성: ${created}건`);
    console.log(`  건너뛰기 (중복): ${skipped}건`);
    console.log(`  실패: ${failed}건`);

    if (migrationErrors.length > 0) {
      const existingLog = fs.existsSync(errorLogPath)
        ? fs.readFileSync(errorLogPath, 'utf-8')
        : '';
      const newLog =
        existingLog +
        '\n\n=== Migration Errors ===\n' +
        migrationErrors.join('\n');
      fs.writeFileSync(errorLogPath, newLog, 'utf-8');
      console.log(`에러 로그 업데이트: ${errorLogPath}`);
    }
  } else {
    console.log(
      '\n실제 마이그레이션을 실행하려면: npx tsx scripts/import-ics.ts --run'
    );
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('스크립트 실행 오류:', e);
  await prisma.$disconnect();
  process.exit(1);
});
