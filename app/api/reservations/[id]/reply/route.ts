import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeParseInt, sanitizeString } from "@/lib/validation";

// 답변 등록/수정 (관리자만 가능)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }
    const { content } = await request.json();
    const sanitizedContent = sanitizeString(content, 10000);

    if (!sanitizedContent) {
      return NextResponse.json(
        { error: "답변 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // 예약 존재 여부 확인
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { reply: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    let reply;
    if (reservation.reply) {
      // 기존 답변 수정
      reply = await prisma.reply.update({
        where: { reservationId },
        data: { content },
      });
    } else {
      // 짝궁코드 생성 (YYYYMMDD + 계약자성함)
      let referralCode: string | null = null;
      if (reservation.weddingDate && reservation.author) {
        try {
          // weddingDate를 YYYYMMDD 형식으로 변환
          let dateStr: string;
          if (typeof reservation.weddingDate === 'string') {
            // "2025-05-20" 형식 처리
            dateStr = reservation.weddingDate.replace(/-/g, '').substring(0, 8);
            if (dateStr.length !== 8) {
              const date = new Date(reservation.weddingDate);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dateStr = `${year}${month}${day}`;
              } else {
                dateStr = '';
              }
            }
          } else {
            dateStr = '';
          }

          if (dateStr) {
            // 이름에서 공백 제거
            const cleanName = reservation.author.replace(/\s/g, '');
            referralCode = `${dateStr}${cleanName}`;

            // 중복 체크
            let counter = 1;
            let finalCode = referralCode;
            while (await prisma.reservation.findUnique({ where: { referralCode: finalCode } })) {
              finalCode = `${referralCode}${counter}`;
              counter++;
            }
            referralCode = finalCode;
          }
        } catch (e) {
          console.error("Error generating referralCode:", e);
        }
      }

      // 새 답변 등록 + 예약 상태를 CONFIRMED로 변경 + 짝궁코드 생성
      [reply] = await prisma.$transaction([
        prisma.reply.create({
          data: {
            content: sanitizedContent,
            reservationId,
          },
        }),
        prisma.reservation.update({
          where: { id: reservationId },
          data: {
            status: "CONFIRMED",
            referralCode: referralCode,
          },
        }),
      ]);
    }

    return NextResponse.json(reply);
  } catch (error) {
    console.error("Reply creation error:", error);
    return NextResponse.json(
      { error: "답변 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 답변 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservationId = safeParseInt(id, 0, 1, 2147483647);
    if (reservationId === 0) {
      return NextResponse.json(
        { error: "잘못된 예약 ID입니다." },
        { status: 400 }
      );
    }

    await prisma.reply.delete({
      where: { reservationId },
    });

    return NextResponse.json({ message: "답변이 삭제되었습니다." });
  } catch (error) {
    console.error("Reply deletion error:", error);
    return NextResponse.json(
      { error: "답변 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
