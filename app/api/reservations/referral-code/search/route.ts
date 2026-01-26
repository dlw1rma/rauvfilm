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

    // Reservation에서 CONFIRMED 상태이고 referralCode가 있는 것만 검색
    // 예식 날짜가 지나지 않은 것만 검색
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reservations = await prisma.reservation.findMany({
      where: {
        status: 'CONFIRMED',
        referralCode: {
          not: null,
          contains: searchTerm,
        },
      },
      select: {
        referralCode: true,
        author: true,
        weddingDate: true,
      },
      take: 10, // 최대 10개 결과
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 결과 포맷팅 (이름 마스킹) 및 예식 날짜 필터링
    const results = reservations
      .filter((reservation) => {
        // 예식 날짜가 없으면 제외 (예식일이 없으면 사용 불가)
        if (!reservation.weddingDate) return false;
        
        try {
          let weddingDate: Date;
          if (typeof reservation.weddingDate === 'string') {
            const dateStr = reservation.weddingDate.replace(/-/g, '').substring(0, 8);
            if (dateStr.length === 8) {
              const year = parseInt(dateStr.slice(0, 4));
              const month = parseInt(dateStr.slice(4, 6)) - 1;
              const day = parseInt(dateStr.slice(6, 8));
              weddingDate = new Date(year, month, day);
            } else {
              return false; // 날짜 형식이 올바르지 않으면 제외
            }
          } else {
            weddingDate = new Date(reservation.weddingDate);
          }
          
          weddingDate.setHours(0, 0, 0, 0);
          return weddingDate >= today; // 오늘 이후 날짜만 포함
        } catch {
          return false; // 파싱 실패 시 제외
        }
      })
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
