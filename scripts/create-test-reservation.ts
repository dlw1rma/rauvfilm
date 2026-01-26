/**
 * 테스트용 예약 데이터 생성 스크립트
 * 
 * 사용법:
 *   npx tsx scripts/create-test-reservation.ts
 * 
 * 또는:
 *   npm run dev (서버 실행 후)
 *   node --loader ts-node/esm scripts/create-test-reservation.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestReservation() {
  try {
    // 전화번호를 비밀번호로 사용 (bcrypt 해시)
    const phoneNumber = "01002580258";
    const hashedPassword = await bcrypt.hash(phoneNumber, 10);

    // 기본형 상품 가격
    const productPrice = 500000; // 기본형: 500,000원
    const depositAmount = 100000; // 예약금: 100,000원
    const finalBalance = productPrice - depositAmount; // 잔금: 400,000원

    // 테스트용 예약 데이터 생성
    const reservation = await prisma.reservation.create({
      data: {
        title: "본식DVD 예약합니다",
        content: "테스트용 예약입니다.",
        author: "손세한", // 계약자
        password: hashedPassword,
        isPrivate: true,
        status: "PENDING",
        
        // 계약자 정보 (전화번호를 bridePhone에 설정)
        bridePhone: phoneNumber,
        groomPhone: phoneNumber, // 인증을 위해 둘 다 설정
        
        // 상품 정보
        productType: "기본형",
        totalAmount: productPrice,
        depositAmount: depositAmount,
        finalBalance: finalBalance,
        
        // 기본 정보
        brideName: "손세한",
        groomName: "손세한",
        termsAgreed: true,
        faqRead: true,
        privacyAgreed: true,
      },
    });

    console.log("\n✅ 테스트용 예약이 생성되었습니다!\n");
    console.log("📋 예약 정보:");
    console.log(`   ID: ${reservation.id}`);
    console.log(`   계약자: ${reservation.author}`);
    console.log(`   전화번호: ${phoneNumber}`);
    console.log(`   상품: ${reservation.productType}`);
    console.log(`   정가: ${productPrice.toLocaleString()}원`);
    console.log(`   예약금: ${depositAmount.toLocaleString()}원`);
    console.log(`   잔금: ${finalBalance.toLocaleString()}원`);
    console.log("\n🔗 잔금 확인 링크:");
    console.log(`   /reservation/${reservation.id}/balance?name=손세한&phone=${phoneNumber}`);
    console.log(`   또는: /api/reservations/${reservation.id}/balance?name=손세한&phone=${phoneNumber}\n`);
    
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReservation();
