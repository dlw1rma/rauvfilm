import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";

// 관리자 대시보드 통계 조회
export async function GET(request: NextRequest) {
  // 인증 확인
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const [
      totalReservations,
      upcomingReservations,
      totalContacts,
      unreadContacts,
      totalPortfolios,
      adminReviews,
      approvedSubmissions,
      pendingReviewSubmissions,
    ] = await Promise.all([
      prisma.reservation.count(),
      // 예식일이 아직 지나지 않은 예약 수
      prisma.reservation.count({
        where: {
          weddingDate: {
            gte: new Date().toISOString().slice(0, 10),
          },
        },
      }),
      prisma.contact.count(),
      prisma.contact.count({
        where: { isRead: false },
      }),
      prisma.portfolio.count(),
      prisma.review.count(),
      prisma.reviewSubmission.count({
        where: {
          status: {
            in: ['AUTO_APPROVED', 'APPROVED'],
          },
        },
      }),
      prisma.reviewSubmission.count({
        where: {
          status: {
            in: ['PENDING', 'MANUAL_REVIEW'],
          },
        },
      }),
    ]);

    const totalReviews = adminReviews + approvedSubmissions;

    return NextResponse.json({
      reservations: {
        total: totalReservations,
        upcoming: upcomingReservations,
      },
      contacts: {
        total: totalContacts,
        unread: unreadContacts,
      },
      portfolios: totalPortfolios,
      reviews: totalReviews,
      reviewSubmissions: {
        pending: pendingReviewSubmissions,
      },
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "통계 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
