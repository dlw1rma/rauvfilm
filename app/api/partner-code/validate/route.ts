/**
 * 짝꿍 코드 유효성 검사 API
 * GET /api/partner-code/validate?code=250122홍길동
 */

import { NextRequest, NextResponse } from 'next/server';
import { validatePartnerCode } from '@/lib/partnerCode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { valid: false, error: '짝꿍 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await validatePartnerCode(code);

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        error: result.error,
      });
    }

    // 유효한 경우 (민감 정보 제외)
    return NextResponse.json({
      valid: true,
      message: '유효한 짝꿍 코드입니다. 양쪽 모두 1만원 할인이 적용됩니다!',
      // 추천인 이름 마스킹
      referrerName: result.booking!.customerName.length > 2
        ? result.booking!.customerName[0] + '*' + result.booking!.customerName.slice(2)
        : result.booking!.customerName[0] + '*',
    });
  } catch (error) {
    console.error('짝꿍 코드 검증 오류:', error);
    return NextResponse.json(
      { valid: false, error: '짝꿍 코드 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
