/**
 * 마이페이지 - 내 예약글 목록 조회 API
 * GET /api/mypage/reservations
 */

import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 현재 로그인된 예약 정보 가져오기
    const currentReservation = await prisma.reservation.findUnique({
      where: { id: session.reservationId },
      select: {
        author: true,
        brideName: true,
        bridePhone: true,
        groomName: true,
        groomPhone: true,
      },
    });

    if (!currentReservation) {
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 복호화하여 검색 조건 생성
    const decryptedAuthor = decrypt(currentReservation.author) || '';
    const decryptedBrideName = decrypt(currentReservation.brideName) || '';
    const decryptedGroomName = decrypt(currentReservation.groomName) || '';
    const decryptedBridePhone = decrypt(currentReservation.bridePhone) || '';
    const decryptedGroomPhone = decrypt(currentReservation.groomPhone) || '';

    // 전화번호 정규화 (하이픈 제거)
    const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');
    const normalizedBridePhone = normalizePhone(decryptedBridePhone);
    const normalizedGroomPhone = normalizePhone(decryptedGroomPhone);

    // 모든 예약 조회 (암호화되어 있으므로 모든 예약을 가져와서 필터링)
    const allReservations = await prisma.reservation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // 최근 100개만 조회
    });

    // 복호화 후 필터링 (같은 이름과 전화번호로 작성한 예약)
    const myReservations = allReservations
      .map((reservation) => {
        const rAuthor = decrypt(reservation.author) || '';
        const rBrideName = decrypt(reservation.brideName) || '';
        const rGroomName = decrypt(reservation.groomName) || '';
        const rBridePhone = decrypt(reservation.bridePhone) || '';
        const rGroomPhone = decrypt(reservation.groomPhone) || '';

        const rNormalizedBridePhone = normalizePhone(rBridePhone);
        const rNormalizedGroomPhone = normalizePhone(rGroomPhone);

        // 계약자 이름 + 전화번호 매칭
        const authorMatch = rAuthor === decryptedAuthor && 
          (rNormalizedBridePhone === normalizedBridePhone || 
           rNormalizedGroomPhone === normalizedGroomPhone ||
           rNormalizedBridePhone === normalizedGroomPhone ||
           rNormalizedGroomPhone === normalizedBridePhone);

        // 신부 이름 + 전화번호 매칭
        const brideMatch = rBrideName === decryptedBrideName && 
          rNormalizedBridePhone === normalizedBridePhone;

        // 신랑 이름 + 전화번호 매칭
        const groomMatch = rGroomName === decryptedGroomName && 
          rNormalizedGroomPhone === normalizedGroomPhone;

        if (authorMatch || brideMatch || groomMatch) {
          return reservation;
        }
        return null;
      })
      .filter((r) => r !== null);

    // 예약 상태 한글 변환
    const statusLabels: Record<string, string> = {
      PENDING: '예약 대기',
      CONFIRMED: '예약 확정',
      COMPLETED: '촬영 완료',
      DELIVERED: '영상 전달 완료',
      CANCELLED: '취소됨',
    };

    const reservationIds = myReservations.map((r) => r.id);
    const eventSnapByReservation = await prisma.eventSnapApplication.findMany({
      where: { reservationId: { in: reservationIds } },
      orderBy: { createdAt: "desc" },
    });
    const eventSnapMap = new Map<number, typeof eventSnapByReservation>();
    for (const app of eventSnapByReservation) {
      if (app.reservationId == null) continue;
      if (!eventSnapMap.has(app.reservationId)) {
        eventSnapMap.set(app.reservationId, []);
      }
      eventSnapMap.get(app.reservationId)!.push(app);
    }

    return NextResponse.json({
      reservations: myReservations.map((reservation) => ({
        id: reservation.id,
        title: reservation.title,
        weddingDate: reservation.weddingDate,
        venueName: reservation.venueName,
        productType: reservation.productType,
        status: reservation.status,
        statusLabel: statusLabels[reservation.status || 'PENDING'] || '예약 대기',
        createdAt: reservation.createdAt,
        hasReply: false,
        eventSnapApplications: eventSnapMap.get(reservation.id) ?? [],
      })),
    });
  } catch (error) {
    console.error('예약 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '예약 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
