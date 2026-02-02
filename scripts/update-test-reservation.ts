/**
 * 테스트용 예약 데이터 업데이트 스크립트
 * 손세한 01002580258 예약을 완료 처리하고 잔금을 할인 전 가격 기준으로 재계산
 * 
 * 사용법:
 *   npx tsx scripts/update-test-reservation.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateTestReservation() {
  try {
    const phoneNumber = "01002580258";
    const authorName = "손세한";

    // 기존 예약 찾기
    const reservation = await prisma.reservation.findFirst({
      where: {
        author: authorName,
        OR: [
          { bridePhone: phoneNumber },
          { groomPhone: phoneNumber },
        ],
      },
    });

    if (!reservation) {
      console.error(`❌ 예약을 찾을 수 없습니다: ${authorName} ${phoneNumber}`);
      process.exit(1);
    }

    // 기본형 상품 가격 (할인 전)
    const originalPrice = 600000; // 기본형 할인 전: 600,000원
    const depositAmount = 100000; // 예약금: 100,000원
    const finalBalance = originalPrice - depositAmount; // 잔금: 500,000원

    // 테스트용 예식 날짜 설정 (없으면 오늘 날짜로 설정)
    const weddingDate = reservation.weddingDate || new Date().toISOString().split('T')[0];

    // 짝궁코드 생성 (weddingDate가 있으면 생성, 기존 코드가 있어도 새 형식으로 재생성)
    let referralCode: string | null = null;
    if (weddingDate && reservation.author) {
      try {
        // weddingDate를 YYYYMMDD 형식으로 변환
        let dateStr: string;
        if (typeof weddingDate === 'string') {
          dateStr = weddingDate.replace(/-/g, '').substring(0, 8);
          if (dateStr.length !== 8) {
            const date = new Date(weddingDate);
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
          const cleanName = reservation.author.replace(/\s/g, '');
          referralCode = `${yy}${mmdd} ${cleanName}`;

          // 중복 체크 - 중복이 있어도 형식 유지 (숫자 붙이지 않음)
          // 같은 날짜, 같은 이름이면 같은 코드 사용
        }
      } catch (e) {
        console.error("Error generating referralCode:", e);
      }
    }

    // 예약 업데이트
    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CONFIRMED", // 예약 완료 처리
        totalAmount: originalPrice, // 할인 전 가격으로 설정
        depositAmount: depositAmount,
        finalBalance: finalBalance, // 할인 전 가격 기준 잔금
        referralCode: referralCode || undefined, // 짝궁코드 생성
        weddingDate: weddingDate, // 예식 날짜 설정
      },
    });

    console.log("\n✅ 예약이 업데이트되었습니다!\n");
    console.log("📋 업데이트된 예약 정보:");
    console.log(`   ID: ${updated.id}`);
    console.log(`   계약자: ${updated.author}`);
    console.log(`   전화번호: ${phoneNumber}`);
    console.log(`   상태: ${updated.status} (예약 완료)`);
    console.log(`   상품: ${updated.productType}`);
    console.log(`   정가(할인 전): ${originalPrice.toLocaleString()}원`);
    console.log(`   예약금: ${depositAmount.toLocaleString()}원`);
    console.log(`   잔금: ${finalBalance.toLocaleString()}원`);
    if (updated.referralCode) {
      console.log(`   짝궁코드: ${updated.referralCode}`);
    } else {
      console.log(`   짝궁코드: (weddingDate가 없어 생성되지 않음)`);
    }
    console.log("\n🔗 잔금 확인 링크:");
    console.log(`   /reservation/${updated.id}/balance?name=${authorName}&phone=${phoneNumber}`);
    console.log(`   또는: /api/reservations/${updated.id}/balance?name=${authorName}&phone=${phoneNumber}\n`);
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateTestReservation();
