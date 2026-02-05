/**
 * 관리자 - 알림톡 템플릿 설정 조회/저장
 * GET /api/admin/sms-templates/config - 현재 설정 조회
 * PUT /api/admin/sms-templates/config - 템플릿 매핑 저장
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/api';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const configs = await prisma.smsTemplateConfig.findMany();
    const configMap: Record<string, { templateId: string; channelId: string }> = {};
    for (const c of configs) {
      configMap[c.type] = { templateId: c.templateId, channelId: c.channelId };
    }
    return NextResponse.json({ config: configMap });
  } catch (error) {
    console.error('템플릿 설정 조회 오류:', error);
    return NextResponse.json({ error: '설정을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, templateId, channelId } = body;

    if (!type || !templateId || !channelId) {
      return NextResponse.json({ error: 'type, templateId, channelId는 필수입니다.' }, { status: 400 });
    }

    if (!['contract', 'video', 'post_wedding'].includes(type)) {
      return NextResponse.json({ error: 'type은 contract, video, post_wedding만 가능합니다.' }, { status: 400 });
    }

    const config = await prisma.smsTemplateConfig.upsert({
      where: { type },
      update: { templateId, channelId },
      create: { type, templateId, channelId },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('템플릿 설정 저장 오류:', error);
    return NextResponse.json({ error: '설정 저장에 실패했습니다.' }, { status: 500 });
  }
}
