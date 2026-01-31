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
    // 따옴표가 포함될 수 있으므로 제거
    const apiKey = (process.env.SOLAPI_API_KEY || '').replace(/^["']|["']$/g, '');
    const apiSecret = (process.env.SOLAPI_API_SECRET || '').replace(/^["']|["']$/g, '');

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'SOLAPI API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const messageService = new SolapiMessageService(apiKey, apiSecret);
    const result = await messageService.getKakaoAlimtalkTemplates();
    const templates = result.templateList ?? [];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('템플릿 목록 조회 오류:', error);
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `템플릿 목록을 불러오는데 실패했습니다: ${message}` },
      { status: 500 },
    );
  }
}
