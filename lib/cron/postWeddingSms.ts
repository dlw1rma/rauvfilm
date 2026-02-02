import { prisma } from "@/lib/prisma";
import { sendKakaoAlimtalk } from "@/lib/solapi";

interface SendResult {
  success: boolean;
  sentCount: number;
  errors: string[];
  processedIds: number[];
}

/**
 * 예식 다음 날 카카오 알림톡 자동 발송
 * - weddingDate가 어제인 Booking 중, 연결된 Reservation의 postWeddingSmsSentAt이 null인 건 대상
 * - SmsTemplateConfig의 "post_wedding" 템플릿 사용
 */
export async function sendPostWeddingSms(): Promise<SendResult> {
  const result: SendResult = {
    success: true,
    sentCount: 0,
    errors: [],
    processedIds: [],
  };

  // 템플릿 설정 조회
  const templateConfig = await prisma.smsTemplateConfig.findUnique({
    where: { type: "post_wedding" },
  });

  if (!templateConfig) {
    result.errors.push("예식 후 안내용 알림톡 템플릿이 지정되지 않았습니다. 관리자 페이지에서 템플릿을 지정해주세요.");
    result.success = false;
    return result;
  }

  // 어제 날짜 (KST 기준)
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const yesterday = new Date(kstNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(Date.UTC(
    yesterday.getUTCFullYear(),
    yesterday.getUTCMonth(),
    yesterday.getUTCDate(),
    0, 0, 0, 0
  ));
  const yesterdayEnd = new Date(Date.UTC(
    yesterday.getUTCFullYear(),
    yesterday.getUTCMonth(),
    yesterday.getUTCDate(),
    23, 59, 59, 999
  ));

  // 발송 대상 조회: Booking 테이블 (weddingDate가 어제)
  const targets = await prisma.booking.findMany({
    where: {
      weddingDate: {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      },
      isAnonymized: false,
      status: {
        notIn: ["CANCELLED"],
      },
    },
  });

  for (const booking of targets) {
    try {
      // Reservation 연결 확인 및 발송 여부 체크
      let reservation = null;
      if (booking.reservationId) {
        reservation = await prisma.reservation.findUnique({
          where: { id: booking.reservationId },
          select: { id: true, postWeddingSmsSentAt: true, overseasResident: true },
        });
      }

      // 이미 발송된 경우 건너뜀
      if (reservation?.postWeddingSmsSentAt) {
        continue;
      }

      // 해외 거주자는 미발송
      if (reservation?.overseasResident) {
        continue;
      }

      const phone = booking.customerPhone;
      if (!phone) {
        result.errors.push(`Booking #${booking.id}: 전화번호 없음`);
        continue;
      }

      // 변수 치환
      const weddingDateStr = booking.weddingDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // 카카오 알림톡 발송
      await sendKakaoAlimtalk(
        phone,
        templateConfig.templateId,
        templateConfig.channelId,
        {
          "#{고객명}": booking.customerName,
          "#{예식일}": weddingDateStr,
        },
      );

      // 발송 기록
      if (reservation) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { postWeddingSmsSentAt: new Date() },
        });
      }

      result.sentCount++;
      result.processedIds.push(booking.id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "알 수 없는 오류";
      result.errors.push(`Booking #${booking.id}: ${msg}`);
      result.success = false;
    }
  }

  return result;
}
