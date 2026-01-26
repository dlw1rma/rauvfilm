/**
 * Reservation용 짝꿍 코드 검증 API
 * GET /api/reservations/referral-code/validate?code=260126 손세한
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting 적용
    const rateLimitResponse = rateLimit(request, 20, 60 * 1000); // 1분에 20회
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || code.trim() === '') {
      return NextResponse.json(
        { valid: false, error: '짝꿍 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim();

    // Reservation에서 CONFIRMED 상태인 코드만 검색
    const reservation = await prisma.reservation.findUnique({
      where: { referralCode: trimmedCode },
      select: {
        id: true,
        author: true,
        status: true,
        weddingDate: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({
        valid: false,
        error: '짝궁코드가 존재하지 않습니다.',
      });
    }

    if (reservation.status !== 'CONFIRMED') {
      return NextResponse.json({
        valid: false,
        error: '예약이 확정되지 않은 코드입니다.',
      });
    }

    // 예식 날짜 확인 - 예식 날짜가 없거나 지났으면 만료
    if (!reservation.weddingDate) {
      return NextResponse.json({
        valid: false,
        error: '예식 날짜가 등록되지 않은 코드입니다.',
      });
    }

    try {
      let weddingDate: Date;
      if (typeof reservation.weddingDate === 'string') {
        // "2025-05-20" 형식 처리
        const dateStr = reservation.weddingDate.replace(/-/g, '').substring(0, 8);
        if (dateStr.length === 8) {
          const year = parseInt(dateStr.slice(0, 4));
          const month = parseInt(dateStr.slice(4, 6)) - 1;
          const day = parseInt(dateStr.slice(6, 8));
          weddingDate = new Date(year, month, day);
        } else {
          return NextResponse.json({
            valid: false,
            error: '예식 날짜 형식이 올바르지 않습니다.',
          });
        }
      } else {
        weddingDate = new Date(reservation.weddingDate);
      }

      // 오늘 날짜 (시간 제외)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      weddingDate.setHours(0, 0, 0, 0);

      // 예식 날짜가 지났으면 만료
      if (weddingDate < today) {
        return NextResponse.json({
          valid: false,
          error: '이 짝궁코드는 예식 날짜가 지나 사용할 수 없습니다.',
        });
      }
    } catch (error) {
      console.error('예식 날짜 파싱 오류:', error);
      return NextResponse.json({
        valid: false,
        error: '예식 날짜를 확인할 수 없습니다.',
      });
    }

    // 유효한 경우 (민감 정보 제외)
    // 개인정보 복호화 후 마스킹
    const decryptedAuthor = decrypt(reservation.author) || '';
    return NextResponse.json({
      valid: true,
      message: '유효한 짝꿍 코드입니다. 양쪽 모두 1만원 할인이 적용됩니다!',
      // 추천인 이름 마스킹
      referrerName: decryptedAuthor.length > 2
        ? decryptedAuthor[0] + '*' + decryptedAuthor.slice(2)
        : decryptedAuthor[0] + '*',
    });
  } catch (error) {
    console.error('짝꿍 코드 검증 오류:', error);
    return NextResponse.json(
      { valid: false, error: '짝꿍 코드 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
