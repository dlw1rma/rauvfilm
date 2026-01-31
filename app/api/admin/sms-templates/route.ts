/**
 * 관리자 - 솔라피 카카오 알림톡 템플릿 목록 조회
 * GET /api/admin/sms-templates
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';
import { SolapiMessageService } from 'solapi';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const apiKey = process.env.SOLAPI_API_KEY || '';
    const apiSecret = process.env.SOLAPI_API_SECRET || '';

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'SOLAPI API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const messageService = new SolapiMessageService(apiKey, apiSecret);
    const result = await messageService.getKakaoAlimtalkTemplates();
    const templates = result.templateList ?? [];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('템플릿 목록 조회 오류:', error);
    return NextResponse.json({ error: '템플릿 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
