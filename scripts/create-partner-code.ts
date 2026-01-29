/**
 * 짝궁코드 "271225 손세한" 임의 생성 스크립트 (기본형, 예약확정)
 * 사용법: npm run create-partner-code (.env 로드 후 실행)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encrypt } from "../lib/encryption";

const prisma = new PrismaClient();

const PARTNER_CODE = "271225 손세한";
const CUSTOMER_NAME = "손세한";
const WEDDING_DATE = "2027-12-25";
const PHONE = "01002580258";

async function main() {
  try {
    const existing = await prisma.reservation.findFirst({
      where: { referralCode: PARTNER_CODE },
    });

    if (existing) {
      console.log("짝궁코드가 이미 존재합니다:", PARTNER_CODE, "예약 ID:", existing.id);
      return;
    }

    const hashedPassword = await bcrypt.hash(PHONE, 10);
    const productPrice = 600000;
    const depositAmount = 100000;
    const finalBalance = productPrice - depositAmount;

    const reservation = await prisma.reservation.create({
      data: {
        title: "본식DVD 예약합니다",
        content: "짝궁코드 테스트용 예약",
        author: encrypt(CUSTOMER_NAME) ?? CUSTOMER_NAME,
        password: hashedPassword,
        isPrivate: true,
        status: "CONFIRMED",
        referralCode: PARTNER_CODE,
        brideName: encrypt(CUSTOMER_NAME) || null,
        bridePhone: encrypt(PHONE) || null,
        groomName: encrypt(CUSTOMER_NAME) || null,
        groomPhone: encrypt(PHONE) || null,
        productType: "기본형",
        weddingDate: WEDDING_DATE,
        venueName: "테스트 예식장",
        totalAmount: productPrice,
        depositAmount,
        finalBalance,
        termsAgreed: true,
        faqRead: true,
        privacyAgreed: true,
      },
    });

    console.log("짝궁코드 생성 완료:", PARTNER_CODE, "예약 ID:", reservation.id);
  } catch (error) {
    console.error("오류:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
