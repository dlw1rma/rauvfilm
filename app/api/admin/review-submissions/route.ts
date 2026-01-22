/**
 * 관리자 - 후기 제출 목록 API
 * GET /api/admin/review-submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getPlatformName } from '@/lib/reviewVerification';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return !!adminSession?.value;
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    // 상태 필터
    if (status && status !== 'all') {
      where.status = status;
    }

    const [reviews, total] = await Promise.all([
      prisma.reviewSubmission.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              customerName: true,
              customerPhone: true,
              weddingDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reviewSubmission.count({ where }),
    ]);

    // 상태별 통계
    const stats = await prisma.reviewSubmission.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = stats.reduce(
      (acc, s) => {
        acc[s.status] = s._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const statusLabels: Record<string, string> = {
      PENDING: '검토 대기',
      AUTO_APPROVED: '자동 승인',
      MANUAL_REVIEW: '수동 검토 필요',
      APPROVED: '승인됨',
      REJECTED: '거절됨',
    };

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewUrl: r.reviewUrl,
        platform: r.platform,
        platformName: getPlatformName(r.platform),
        status: r.status,
        statusLabel: statusLabels[r.status] || r.status,
        autoVerified: r.autoVerified,
        titleValid: r.titleValid,
        contentValid: r.contentValid,
        characterCount: r.characterCount,
        rejectReason: r.rejectReason,
        verifiedAt: r.verifiedAt,
        verifiedBy: r.verifiedBy,
        createdAt: r.createdAt,
        booking: {
          id: r.booking.id,
          customerName: r.booking.customerName,
          customerPhone: r.booking.customerPhone,
          weddingDate: r.booking.weddingDate,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
    });
  } catch (error) {
    console.error('후기 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '후기 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
