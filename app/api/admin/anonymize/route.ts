/**
 * 관리자 - 개인정보 파기 관리 API
 * GET /api/admin/anonymize - 파기 통계 및 예정 목록
 * POST /api/admin/anonymize - 수동 파기 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  anonymizeOldBookings,
  getAnonymizeStats,
  getUpcomingAnonymizations,
} from '@/lib/cron/anonymize';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return !!adminSession?.value;
}

/**
 * 파기 통계 및 예정 목록 조회
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');

    const [stats, upcoming] = await Promise.all([
      getAnonymizeStats(),
      getUpcomingAnonymizations(daysAhead),
    ]);

    return NextResponse.json({
      stats: {
        totalAnonymized: stats.totalAnonymized,
        pendingAnonymization: stats.pendingAnonymization,
        lastAnonymizedAt: stats.lastAnonymizedAt,
      },
      upcoming: {
        count: upcoming.count,
        daysAhead,
        bookings: upcoming.bookings.map((b) => ({
          id: b.id,
          customerName: b.customerName,
          videoUploadedAt: b.videoUploadedAt,
          daysUntilAnonymize: b.daysUntilAnonymize,
        })),
      },
    });
  } catch (error) {
    console.error('파기 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 수동 파기 실행
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    console.log('[Admin] 수동 개인정보 파기 실행');

    const result = await anonymizeOldBookings();
    const stats = await getAnonymizeStats();

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
      },
    });
  } catch (error) {
    console.error('수동 파기 실행 오류:', error);
    return NextResponse.json(
      { error: '파기 실행 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
