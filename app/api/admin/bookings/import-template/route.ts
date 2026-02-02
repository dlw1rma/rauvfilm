/**
 * 엑셀 이관 양식 템플릿 다운로드
 * GET /api/admin/bookings/import-template
 * - 인증 필요, .xlsx 파일 반환
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
}

const TEMPLATE_HEADERS = [
  '계약자/이름',
  '신부 이름',
  '신부 전화',
  '신랑 이름',
  '신랑 전화',
  '예식일/날짜',
  '예식 시간',
  '예식장/장소',
  '층/홀',
  '상품 종류',
  '현금영수증 전화',
  '예약금 입금자명',
  '상품 받을 이메일',
  '짝궁 코드',
  '초대인원',
  '특이사항'
];
const EXAMPLE_ROW = [
  '홍길동',
  '홍길순',
  '010-1234-5678',
  '홍길동',
  '010-5678-1234',
  '2025-06-15',
  '14:00',
  '그랜드볼룸',
  '3층',
  '기본형',
  '010-1234-5678',
  '홍길동',
  'example@email.com',
  '',
  '100',
  ''
];

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, EXAMPLE_ROW]);
    XLSX.utils.book_append_sheet(wb, ws, '예약 이관');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="rauvfilm-booking-import-template.xlsx"',
      },
    });
  } catch (error) {
    console.error('템플릿 생성 오류:', error);
    return NextResponse.json(
      { error: '템플릿 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
