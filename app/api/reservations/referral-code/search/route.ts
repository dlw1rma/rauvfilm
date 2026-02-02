/**
 * Reservation용 짝꿍 코드 검색 API
 * GET /api/reservations/referral-code/search?q=260126
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 30, 60 * 1000); // 1분에 30회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: '검색어를 2자 이상 입력해주세요.' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim();

    // 오늘 날짜 문자열 (YYYY-MM-DD) - 예식일이 지난 짝꿍코드는 검색에서 제외
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Reservation에서 CONFIRMED, referralCode 있음, 예식일 >= 오늘 인 것만 검색
    const reservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        referralCode: {
          not: null,
          contains: searchTerm,
        },
        weddingDate: {
          not: null,
          gte: todayStr, // 예식일이 오늘 이후인 것만 (문자열 비교로 YYYY-MM-DD)
        },
      },
      select: {
        referralCode: true,
        author: true,
        weddingDate: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // 결과 포맷팅 (이름 마스킹)
    const results = reservations
      .filter((reservation) => !!reservation.weddingDate)
      .map((reservation) => {
        // 개인정보 복호화 후 마스킹
        const decryptedAuthor = decrypt(reservation.author) || '';
        return {
          code: reservation.referralCode,
          author: decryptedAuthor.length > 2
            ? decryptedAuthor[0] + '*' + decryptedAuthor.slice(2)
            : decryptedAuthor[0] + '*',
          weddingDate: reservation.weddingDate,
        };
      });

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('짝꿍 코드 검색 오류:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
