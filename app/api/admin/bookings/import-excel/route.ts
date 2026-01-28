/**
 * 이전 사이트 계약자 엑셀 이관
 * POST /api/admin/bookings/import-excel
 * FormData: file (.xlsx / .xls)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
}

const NAME_KEYS = ['계약자', '이름', '성함', '고객명', 'customerName'];
const PHONE_KEYS = ['전화', '연락처', '휴대폰', '전화번호', 'customerPhone'];
const DATE_KEYS = ['예식일', '날짜', 'weddingDate'];
const VENUE_KEYS = ['예식장', '장소', 'weddingVenue'];

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
    const nameCol = findCol(header, NAME_KEYS);
    const phoneCol = findCol(header, PHONE_KEYS);
    const dateCol = findCol(header, DATE_KEYS);
    const venueCol = findCol(header, VENUE_KEYS);

    if (nameCol < 0 || phoneCol < 0 || dateCol < 0 || venueCol < 0) {
      return NextResponse.json(
        { error: '엑셀 1행에 "계약자/이름", "전화/연락처", "예식일/날짜", "예식장/장소" 중 하나 이상이 포함되어야 합니다.' },
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
      const customerName = String(row[nameCol] ?? '').trim();
      const customerPhone = normalizePhone(row[phoneCol]);
      const weddingDate = parseDate(row[dateCol]);
      const weddingVenue = String(row[venueCol] ?? '').trim();

      if (!customerName || !customerPhone || !weddingVenue) {
        skipped.push({ row: r + 1, reason: '이름/전화/예식장 중 누락' });
        continue;
      }
      if (!weddingDate) {
        skipped.push({ row: r + 1, reason: '예식일 형식 오류' });
        continue;
      }

      try {
        const b = await prisma.booking.create({
          data: {
            customerName,
            customerPhone,
            weddingDate,
            weddingVenue,
            productId: defaultProduct.id,
            listPrice: defaultProduct.price,
            eventDiscount: 0,
            finalBalance: defaultProduct.price - 100000,
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
