/**
 * 개인정보 자동 파기 Cron API
 * GET /api/cron/anonymize
 *
 * Vercel Cron 또는 외부 Cron 서비스에서 호출
 * 매일 새벽 3시에 실행 권장
 *
 * vercel.json 설정 예시:
 * {
 *   "crons": [{
 *     "path": "/api/cron/anonymize",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { anonymizeOldBookings, getAnonymizeStats } from '@/lib/cron/anonymize';

// Cron 시크릿 키 검증 (보안)
function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // CRON_SECRET이 설정되지 않은 경우 (개발 환경)
  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET이 설정되지 않았습니다.');
    return true; // 개발 환경에서는 허용
  }

  // Vercel Cron은 Authorization 헤더로 검증
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // 쿼리 파라미터로도 검증 가능 (외부 Cron 서비스용)
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') === cronSecret) {
    return true;
  }

  return false;
}

/**
 * 개인정보 파기 실행
 */
export async function GET(request: NextRequest) {
  // 인증 검증
  if (!validateCronSecret(request)) {
    console.error('[Cron] 인증 실패');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('[Cron] 개인정보 파기 작업 시작...');

  try {
    // 파기 실행
    const result = await anonymizeOldBookings();

    // 통계 조회
    const stats = await getAnonymizeStats();

    console.log('[Cron] 개인정보 파기 작업 완료');

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `${result.anonymizedCount}건의 개인정보가 마스킹되었습니다.`
        : '일부 오류가 발생했습니다.',
      result: {
        anonymizedCount: result.anonymizedCount,
        processedIds: result.processedIds,
        errors: result.errors,
      },
      stats: {
        totalAnonymized: stats.totalAnonymized,
        pendingAnonymization: stats.pendingAnonymization,
        lastAnonymizedAt: stats.lastAnonymizedAt,
      },
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] 파기 작업 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        executedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
