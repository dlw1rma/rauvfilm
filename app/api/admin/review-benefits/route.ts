/**
 * 관리자 - 제공사항 조회 API
 * GET /api/admin/review-benefits
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';

    // 모든 예약 조회 (후기 작성 여부와 관계없이)
    let whereClause: any = {};
    let searchDate: string | null = null;
    let searchName: string | null = null;

    // 검색 쿼리 파싱: "YYMMDD 이름" 또는 "YYYYMMDD 이름" 형식
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      
      // "YYMMDD 이름" 또는 "YYYYMMDD 이름" 형식 파싱
      const dateNamePattern = /^(\d{6}|\d{8})\s+(.+)$/;
      const dateNameMatch = query.match(dateNamePattern);
      
      if (dateNameMatch) {
        // 날짜와 이름 분리
        let dateStr = dateNameMatch[1];
        searchName = dateNameMatch[2].trim();
        
        // YYMMDD 형식을 YYYYMMDD로 변환
        if (dateStr.length === 6) {
          const year = parseInt(dateStr.slice(0, 2));
          const fullYear = year < 50 ? 2000 + year : 1900 + year;
          dateStr = `${fullYear}${dateStr.slice(2)}`;
        }
        
        // YYYY-MM-DD 형식으로 변환
        searchDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        whereClause.weddingDate = {
          contains: searchDate,
        };
      } else {
        // 날짜만 있는지 확인
        const datePattern = /^(\d{4}[-.\/]?\d{2}[-.\/]?\d{2})|(\d{6})$/;
        const dateMatch = query.match(datePattern);
        
        if (dateMatch) {
          let dateStr = dateMatch[0].replace(/[-.\/]/g, '');
          if (dateStr.length === 6) {
            const year = parseInt(dateStr.slice(0, 2));
            const fullYear = year < 50 ? 2000 + year : 1900 + year;
            dateStr = `${fullYear}${dateStr.slice(2)}`;
          }
          searchDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
          whereClause.weddingDate = {
            contains: searchDate,
          };
        } else {
          // 이름만 검색
          searchName = query;
        }
      }
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      select: {
        id: true,
        author: true,
        brideName: true,
        groomName: true,
        weddingDate: true,
        reviewDiscount: true,
        customSpecialRequest: true,
        specialNotes: true,
        customShootingRequest: true,
        customStyle: true,
        customEditStyle: true,
        customMusic: true,
        customLength: true,
        customEffect: true,
        customContent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 각 예약의 후기 작성 횟수 조회 및 필터링
    const reservationsWithCounts = await Promise.all(
      reservations.map(async (reservation) => {
        const reviewCount = await prisma.reviewSubmission.count({
          where: {
            reservationId: reservation.id,
            status: {
              in: ['PENDING', 'AUTO_APPROVED', 'MANUAL_REVIEW', 'APPROVED'],
            },
          },
        });

        const decryptedAuthor = decrypt(reservation.author) || '알 수 없음';
        const decryptedBrideName = decrypt(reservation.brideName) || '';
        const decryptedGroomName = decrypt(reservation.groomName) || '';
        
        // 이름으로 필터링 (신부, 신랑, 계약자 이름 모두 확인)
        if (searchName) {
          const query = searchName.toLowerCase();
          const authorMatch = decryptedAuthor.toLowerCase().includes(query);
          const brideMatch = decryptedBrideName.toLowerCase().includes(query);
          const groomMatch = decryptedGroomName.toLowerCase().includes(query);
          
          if (!authorMatch && !brideMatch && !groomMatch) {
            return null;
          }
        }

        return {
          id: reservation.id,
          author: decryptedAuthor,
          brideName: decryptedBrideName,
          groomName: decryptedGroomName,
          weddingDate: reservation.weddingDate,
          reviewCount,
          reviewDiscount: reservation.reviewDiscount || 0,
          customSpecialRequest: reservation.customSpecialRequest,
          specialNotes: reservation.specialNotes,
          customShootingRequest: reservation.customShootingRequest || false,
          customStyle: reservation.customStyle,
          customEditStyle: reservation.customEditStyle,
          customMusic: reservation.customMusic,
          customLength: reservation.customLength,
          customEffect: reservation.customEffect,
          customContent: reservation.customContent,
        };
      })
    );

    // null 값 제거
    const filteredReservations = reservationsWithCounts.filter((r) => r !== null);

    return NextResponse.json({
      reservations: filteredReservations,
    });
  } catch (error) {
    console.error('제공사항 조회 오류:', error);
    return NextResponse.json(
      { error: '제공사항 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
