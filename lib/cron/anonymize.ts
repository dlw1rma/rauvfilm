/**
 * 개인정보 5년 자동 파기 시스템
 *
 * 파기 규칙:
 * - 기준일: createdAt (계약일/예약 생성일)
 * - 5년 경과 시 자동 마스킹 처리
 *
 * 파기 대상 (마스킹):
 * - 신랑/신부 이름 (author, brideName, groomName)
 * - 전화번호 (bridePhone, groomPhone, receiptPhone)
 * - 배송주소 (deliveryAddress)
 * - 예식일정 관련 정보 (weddingDate, weddingTime, venueName, venueFloor 등)
 * - 짝궁코드 (referralCode) - null 처리
 *
 * 보존 대상:
 * - 후기 링크 (reviewLink) - 영구 보존
 * - 기타 예약 정보 (상품 종류, 할인 정보 등)
 */

import { prisma } from '../prisma';

export interface AnonymizeResult {
  success: boolean;
  anonymizedCount: number;
  errors: string[];
  processedIds: number[];
}

/**
 * 5년 경과된 예약의 개인정보 마스킹 처리
 */
export async function anonymizeOldBookings(): Promise<AnonymizeResult> {
  const result: AnonymizeResult = {
    success: true,
    anonymizedCount: 0,
    errors: [],
    processedIds: [],
  };

  try {
    // 5년 전 날짜 계산
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    // 파기 대상 조회
    // - 영상 업로드일이 5년 이상 경과
    // - 아직 마스킹되지 않은 예약
    const bookingsToAnonymize = await prisma.booking.findMany({
      where: {
        videoUploadedAt: {
          lte: fiveYearsAgo,
          not: null,
        },
        isAnonymized: false,
      },
      select: {
        id: true,
        customerName: true,
        videoUploadedAt: true,
      },
    });

    if (bookingsToAnonymize.length > 0) {
      console.log(`[Anonymize] 파기 대상 Booking: ${bookingsToAnonymize.length}건`);

      // 각 예약에 대해 마스킹 처리
      for (const booking of bookingsToAnonymize) {
        try {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              customerName: '***',
              customerPhone: '***-****-****',
              customerEmail: '***@***.***',
              isAnonymized: true,
              anonymizedAt: new Date(),
              // 관리자 메모에 원본 정보 기록 (선택적)
              adminNote: `[자동 파기] ${new Date().toISOString()} - 개인정보 보호법에 따라 5년 경과 후 자동 마스킹 처리됨`,
            },
          });

          result.anonymizedCount++;
          result.processedIds.push(booking.id);
          console.log(`[Anonymize] Booking #${booking.id} 마스킹 완료`);
        } catch (error) {
          const errorMessage = `예약 #${booking.id} 마스킹 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
          result.errors.push(errorMessage);
          console.error(`[Anonymize] ${errorMessage}`);
        }
      }
    }

    // Reservation 모델 파기 처리
    // createdAt 기준으로 5년 경과된 것 처리
    // 파기 대상: 신랑/신부 이름, 전화번호, 배송주소, 예식일정 관련 정보만
    const reservationsToAnonymize = await prisma.reservation.findMany({
      where: {
        createdAt: {
          lte: fiveYearsAgo,
        },
      },
      select: {
        id: true,
        // 파기 대상 필드
        author: true,
        brideName: true,
        groomName: true,
        bridePhone: true,
        groomPhone: true,
        receiptPhone: true,
        deliveryAddress: true,
        weddingDate: true,
        weddingTime: true,
        venueName: true,
        venueFloor: true,
        // 보존 대상 필드 (확인용)
        reviewLink: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (reservationsToAnonymize.length > 0) {
      console.log(`[Anonymize] 파기 대상 Reservation: ${reservationsToAnonymize.length}건`);

      for (const reservation of reservationsToAnonymize) {
        try {
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
              // 신랑/신부 이름 마스킹
              author: '***',
              brideName: '***',
              groomName: '***',
              // 전화번호 마스킹
              bridePhone: '***-****-****',
              groomPhone: '***-****-****',
              receiptPhone: '***-****-****',
              // 배송주소 마스킹
              deliveryAddress: null,
              // 예식일정 관련 정보 마스킹
              weddingDate: null,
              weddingTime: null,
              venueName: null,
              venueFloor: null,
              // 짝궁코드 파기
              referralCode: null,
              // 보존 대상은 그대로 유지 (reviewLink 등)
            },
          });

          result.anonymizedCount++;
          result.processedIds.push(reservation.id);
          console.log(`[Anonymize] Reservation #${reservation.id} 마스킹 완료`);
        } catch (error) {
          const errorMessage = `예약 #${reservation.id} 마스킹 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
          result.errors.push(errorMessage);
          console.error(`[Anonymize] ${errorMessage}`);
        }
      }
    }

    console.log(`[Anonymize] 완료: ${result.anonymizedCount}건 처리됨`);

    if (result.errors.length > 0) {
      result.success = false;
    }

    return result;
  } catch (error) {
    const errorMessage = `파기 프로세스 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
    console.error(`[Anonymize] ${errorMessage}`);
    result.success = false;
    result.errors.push(errorMessage);
    return result;
  }
}

/**
 * 파기 예정 예약 목록 조회 (미리보기)
 * 관리자가 파기 전 확인용
 */
export async function getUpcomingAnonymizations(daysAhead: number = 30): Promise<{
  count: number;
  bookings: Array<{
    id: number;
    customerName: string;
    videoUploadedAt: Date;
    daysUntilAnonymize: number;
  }>;
}> {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() - 5);
  targetDate.setDate(targetDate.getDate() + daysAhead);

  const bookings = await prisma.booking.findMany({
    where: {
      videoUploadedAt: {
        gt: fiveYearsAgo,
        lte: targetDate,
        not: null,
      },
      isAnonymized: false,
    },
    select: {
      id: true,
      customerName: true,
      videoUploadedAt: true,
    },
    orderBy: {
      videoUploadedAt: 'asc',
    },
  });

  return {
    count: bookings.length,
    bookings: bookings.map((b) => {
      const anonymizeDate = new Date(b.videoUploadedAt!);
      anonymizeDate.setFullYear(anonymizeDate.getFullYear() + 5);
      const daysUntil = Math.ceil(
        (anonymizeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: b.id,
        customerName: b.customerName,
        videoUploadedAt: b.videoUploadedAt!,
        daysUntilAnonymize: daysUntil,
      };
    }),
  };
}

/**
 * 파기 통계 조회
 */
export async function getAnonymizeStats(): Promise<{
  totalAnonymized: number;
  pendingAnonymization: number;
  lastAnonymizedAt: Date | null;
}> {
  const [anonymizedCount, pendingCount, lastAnonymized] = await Promise.all([
    prisma.booking.count({
      where: { isAnonymized: true },
    }),
    prisma.booking.count({
      where: {
        videoUploadedAt: {
          lte: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
          not: null,
        },
        isAnonymized: false,
      },
    }),
    prisma.booking.findFirst({
      where: { isAnonymized: true },
      orderBy: { anonymizedAt: 'desc' },
      select: { anonymizedAt: true },
    }),
  ]);

  return {
    totalAnonymized: anonymizedCount,
    pendingAnonymization: pendingCount,
    lastAnonymizedAt: lastAnonymized?.anonymizedAt || null,
  };
}
