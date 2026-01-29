import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeParseInt, sanitizeString } from "@/lib/validation";
import { decrypt } from "@/lib/encryption";

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

    // 예약 존재 여부 확인 (SMS 발송 시 reservation.overseasResident이면 솔라피 문자 미발송)
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
          // 개인정보 복호화
          const decryptedAuthor = decrypt(reservation.author);
          if (!decryptedAuthor) {
            throw new Error("계약자 이름을 복호화할 수 없습니다.");
          }
          
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
            // YYMMDD 형식으로 변환 (앞의 20 제거)
            const yy = dateStr.slice(2, 4);
            const mmdd = dateStr.slice(4, 8);
            // 이름에서 공백 제거
            const cleanName = decryptedAuthor.replace(/\s/g, '');
            referralCode = `${yy}${mmdd} ${cleanName}`;

            // 중복 체크 - 중복이 있어도 형식 유지 (숫자 붙이지 않음)
            // 같은 날짜, 같은 이름이면 같은 코드 사용
          }
        } catch (e) {
          console.error("Error generating referralCode:", e);
        }
      }

      // 새 답변 등록 + 예약 상태를 CONFIRMED로 변경 + 짝궁코드 생성
      // 예약이 CONFIRMED 상태로 변경될 때 짝꿍 할인 적용
      const wasPending = reservation.status === "PENDING";
      
      // 트랜잭션으로 처리
      const [updatedReply, updatedReservation] = await prisma.$transaction([
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

      // 예약관리(Booking) 동기화 업데이트
      if (reservation.bookingId) {
        try {
          await prisma.booking.update({
            where: { id: reservation.bookingId },
            data: {
              status: 'CONFIRMED',
              partnerCode: referralCode || undefined,
            },
          });
        } catch (syncError) {
          console.error('예약관리 동기화 업데이트 오류 (계속 진행):', syncError);
        }
      }

      // 예약이 PENDING에서 CONFIRMED로 변경되고, referredBy(partnerCode)가 있으면 짝꿍 할인 적용
      if (wasPending && reservation.referredBy) {
        try {
          // 추천인 코드 확인 (CONFIRMED 상태인 예약만)
          const referrer = await prisma.reservation.findUnique({
            where: { referralCode: reservation.referredBy.trim() },
            select: { id: true, status: true, weddingDate: true },
          });

          if (referrer && referrer.status === "CONFIRMED") {
            // 추천인에게 할인 적용 (예식일 지난 코드는 추천인 쪽 할인만 미적용, 신규 고객 할인은 유지)
            const referrerWeddingPassed = (() => {
              if (!referrer.weddingDate) return false;
              try {
                let wd: Date;
                if (typeof referrer.weddingDate === "string") {
                  const ds = referrer.weddingDate.replace(/-/g, "").substring(0, 8);
                  if (ds.length !== 8) return false;
                  wd = new Date(parseInt(ds.slice(0, 4), 10), parseInt(ds.slice(4, 6), 10) - 1, parseInt(ds.slice(6, 8), 10));
                } else {
                  wd = new Date(referrer.weddingDate);
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                wd.setHours(0, 0, 0, 0);
                return wd < today;
              } catch {
                return false;
              }
            })();
            if (!referrerWeddingPassed) {
              await prisma.reservation.update({
                where: { id: referrer.id },
                data: {
                  referredCount: { increment: 1 },
                  discountAmount: { increment: 10000 },
                  referralDiscount: { increment: 10000 },
                },
              });
            }

            // 신규 예약자 짝꿍 할인: 생성 시 이미 1만원 적용된 경우 중복 적용하지 않음
            const alreadyHasReferral = (reservation.referralDiscount ?? 0) >= 10000;
            if (!alreadyHasReferral) {
              const currentDiscountAmount = reservation.discountAmount || 0;
              const newFinalBalance = Math.max(0, (reservation.totalAmount || 0) - (reservation.depositAmount || 100000) - currentDiscountAmount - 10000);
              await prisma.reservation.update({
                where: { id: reservationId },
                data: {
                  referralDiscount: 10000,
                  discountAmount: currentDiscountAmount + 10000,
                  finalBalance: newFinalBalance,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error applying referral discount:", error);
          // 할인 적용 실패해도 답변 등록은 성공 처리
        }
      }

      reply = updatedReply;

      // 예약확정문자 발송: 기본적으로 관리자가 답변(확정) 등록 시 고객에게 발송.
      // 해외거주(overseasResident)인 경우 전화번호가 없으므로 문자 미발송.
      if (!reservation.overseasResident) {
        // TODO: 솔라피 등 SMS API 연동 시 여기서 예약확정 문자 발송
        // 복호화된 전화번호(decrypt(reservation.bridePhone) 또는 groomPhone)로 발송
      }
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
