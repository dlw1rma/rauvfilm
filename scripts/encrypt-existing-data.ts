/**
 * 기존 예약 데이터의 개인정보를 암호화하는 마이그레이션 스크립트
 * 
 * 사용법:
 * npx tsx scripts/encrypt-existing-data.ts
 */

import { prisma } from '../lib/prisma';
import { encrypt } from '../lib/encryption';

async function encryptExistingData() {
  try {
    console.log('🔐 기존 예약 데이터 암호화 시작...');

    // 모든 예약 조회
    const reservations = await prisma.reservation.findMany({
      select: {
        id: true,
        author: true,
        brideName: true,
        groomName: true,
        bridePhone: true,
        groomPhone: true,
        receiptPhone: true,
        productEmail: true,
        deliveryAddress: true,
      },
    });

    console.log(`📊 총 ${reservations.length}개의 예약을 처리합니다.`);

    let encryptedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const reservation of reservations) {
      try {
        // 이미 암호화된 데이터인지 확인 (':' 문자가 있으면 암호화된 것으로 간주)
        const isAlreadyEncrypted = (field: string | null | undefined): boolean => {
          if (!field) return false;
          return field.includes(':') && field.split(':').length === 3;
        };

        // 암호화가 필요한 필드만 업데이트 (encrypt가 null이면 제외해 Prisma 타입 만족)
        const updateData: Record<string, string> = {};
        if (reservation.author && !isAlreadyEncrypted(reservation.author)) {
          const enc = encrypt(reservation.author);
          if (enc != null) updateData.author = enc;
        }
        if (reservation.brideName && !isAlreadyEncrypted(reservation.brideName)) {
          const enc = encrypt(reservation.brideName);
          if (enc != null) updateData.brideName = enc;
        }
        if (reservation.groomName && !isAlreadyEncrypted(reservation.groomName)) {
          const enc = encrypt(reservation.groomName);
          if (enc != null) updateData.groomName = enc;
        }
        if (reservation.bridePhone && !isAlreadyEncrypted(reservation.bridePhone)) {
          const enc = encrypt(reservation.bridePhone);
          if (enc != null) updateData.bridePhone = enc;
        }
        if (reservation.groomPhone && !isAlreadyEncrypted(reservation.groomPhone)) {
          const enc = encrypt(reservation.groomPhone);
          if (enc != null) updateData.groomPhone = enc;
        }
        if (reservation.receiptPhone && !isAlreadyEncrypted(reservation.receiptPhone)) {
          const enc = encrypt(reservation.receiptPhone);
          if (enc != null) updateData.receiptPhone = enc;
        }
        if (reservation.productEmail && !isAlreadyEncrypted(reservation.productEmail)) {
          const enc = encrypt(reservation.productEmail);
          if (enc != null) updateData.productEmail = enc;
        }
        if (reservation.deliveryAddress && !isAlreadyEncrypted(reservation.deliveryAddress)) {
          const enc = encrypt(reservation.deliveryAddress);
          if (enc != null) updateData.deliveryAddress = enc;
        }

        // 업데이트할 필드가 있으면 업데이트
        if (Object.keys(updateData).length > 0) {
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: updateData,
          });
          encryptedCount++;
          console.log(`✅ 예약 #${reservation.id} 암호화 완료`);
        } else {
          skippedCount++;
          console.log(`⏭️  예약 #${reservation.id} 이미 암호화됨 또는 필드 없음`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ 예약 #${reservation.id} 암호화 실패:`, error);
      }
    }

    console.log('\n📈 암호화 완료:');
    console.log(`   ✅ 암호화된 예약: ${encryptedCount}개`);
    console.log(`   ⏭️  건너뛴 예약: ${skippedCount}개`);
    console.log(`   ❌ 오류 발생: ${errorCount}개`);
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

encryptExistingData();
