import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";
import { safeParseInt, sanitizeString } from "@/lib/validation";
import { decrypt } from "@/lib/encryption";

// GET: 관리자용 예약 목록 조회 (검색 기능 포함)
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { searchParams } = new URL(request.url);
    const page = safeParseInt(searchParams.get("page"), 1, 1, 1000);
    const limit = safeParseInt(searchParams.get("limit"), 50, 1, 100);
    const skip = (page - 1) * limit;
    
    // 검색 파라미터
    const searchDate = searchParams.get("date"); // YYMMDD 형식
    const searchName = sanitizeString(searchParams.get("name"), 50); // 신부 또는 신랑 이름

    // Prisma where 조건 구성
    const where: any = {};

    // 날짜 검색 (YYMMDD 형식)
    if (searchDate && searchDate.length === 6) {
      // YYMMDD를 YYYY-MM-DD 형식으로 변환
      const year = "20" + searchDate.substring(0, 2);
      const month = searchDate.substring(2, 4);
      const day = searchDate.substring(4, 6);
      const dateStr = `${year}-${month}-${day}`;
      
      // weddingDate 필드가 해당 날짜를 포함하는지 검색
      where.weddingDate = {
        contains: dateStr,
      };
    }

    // 이름 검색은 암호화되어 있어서 복호화 후 필터링 필요
    // where 조건에는 추가하지 않고 나중에 필터링

    // 이름 검색이 있는 경우 모든 데이터를 가져와서 필터링 (암호화 때문)
    const shouldFetchAll = searchName && searchName.length >= 2;
    
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: "desc" },
        skip: shouldFetchAll ? 0 : skip,
        take: shouldFetchAll ? undefined : limit,
        select: {
          id: true,
          title: true,
          author: true,
          isPrivate: true,
          createdAt: true,
          weddingDate: true,
          brideName: true,
          groomName: true,
          reply: {
            select: { id: true },
          },
        },
      }),
      prisma.reservation.count(Object.keys(where).length > 0 ? { where } : undefined),
    ]);

    // 복호화 및 필터링 (이름 검색의 경우)
    let formattedReservations = reservations.map((r) => ({
      id: r.id,
      title: r.title,
      author: decrypt(r.author) || '',
      isPrivate: r.isPrivate,
      createdAt: r.createdAt,
      weddingDate: r.weddingDate,
      brideName: decrypt(r.brideName) || '',
      groomName: decrypt(r.groomName) || '',
      hasReply: !!r.reply,
    }));

    // 이름 검색이 있는 경우 복호화 후 필터링
    if (searchName && searchName.length >= 2) {
      const lowerSearchName = searchName.toLowerCase();
      formattedReservations = formattedReservations.filter(
        (r) =>
          r.brideName.toLowerCase().includes(lowerSearchName) ||
          r.groomName.toLowerCase().includes(lowerSearchName)
      );
    }

    // 이름 검색 후 페이징 적용
    const finalReservations = shouldFetchAll 
      ? formattedReservations.slice(skip, skip + limit)
      : formattedReservations;
    const finalTotal = shouldFetchAll ? formattedReservations.length : total;

    return NextResponse.json({
      reservations: finalReservations,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "예약 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
