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
      pendingReservations,
      totalContacts,
      unreadContacts,
      totalPortfolios,
      totalReviews,
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({
        where: { reply: null },
      }),
      prisma.contact.count(),
      prisma.contact.count({
        where: { isRead: false },
      }),
      prisma.portfolio.count(),
      prisma.review.count(),
    ]);

    return NextResponse.json({
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
      },
      contacts: {
        total: totalContacts,
        unread: unreadContacts,
      },
      portfolios: totalPortfolios,
      reviews: totalReviews,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "통계 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
