/**
 * 짝궁코드 뒤 1 제거 스크립트
 * 기존에 중복 체크로 인해 붙은 숫자를 제거하고 순수한 형식으로 변경
 * 
 * 사용법:
 *   npx tsx scripts/fix-referral-codes.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixReferralCodes() {
  try {
    console.log("🔍 짝궁코드 뒤 숫자 제거 작업 시작...\n");

    // 숫자가 붙은 짝궁코드 찾기 (예: "260126 손세한1", "260126 손세한2")
    const reservations = await prisma.reservation.findMany({
      where: {
        referralCode: {
          not: null,
        },
      },
      select: {
        id: true,
        referralCode: true,
        author: true,
        weddingDate: true,
      },
    });

    let fixedCount = 0;
    const errors: string[] = [];

    for (const reservation of reservations) {
      if (!reservation.referralCode) continue;

      // 숫자가 끝에 붙은 패턴 찾기 (예: "260126 손세한1")
      const match = reservation.referralCode.match(/^(.+?)(\d+)$/);
      if (!match) continue;

      const baseCode = match[1].trim(); // "260126 손세한"
      const numberSuffix = match[2]; // "1"

      console.log(`📝 발견: ${reservation.referralCode} → ${baseCode} (숫자 ${numberSuffix} 제거)`);

      // 같은 baseCode를 가진 다른 예약이 있는지 확인
      const existingWithBaseCode = await prisma.reservation.findFirst({
        where: {
          referralCode: baseCode,
          id: { not: reservation.id },
        },
      });

      if (existingWithBaseCode) {
        console.log(`   ⚠️  경고: ${baseCode}는 이미 다른 예약에서 사용 중입니다. 건너뜁니다.`);
        errors.push(`예약 #${reservation.id}: ${reservation.referralCode} - ${baseCode}가 이미 사용 중`);
        continue;
      }

      try {
        // 숫자 제거하여 업데이트
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: {
            referralCode: baseCode,
          },
        });

        fixedCount++;
        console.log(`   ✅ 수정 완료: ${reservation.referralCode} → ${baseCode}`);
      } catch (error) {
        const errorMsg = `예약 #${reservation.id} 수정 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
        console.error(`   ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`\n✅ 작업 완료!`);
    console.log(`   수정된 예약: ${fixedCount}건`);
    if (errors.length > 0) {
      console.log(`   오류: ${errors.length}건`);
      errors.forEach((err) => console.log(`     - ${err}`));
    }
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixReferralCodes();
