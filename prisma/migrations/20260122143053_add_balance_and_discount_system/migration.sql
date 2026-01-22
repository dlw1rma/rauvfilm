/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DEPOSIT_PAID', 'COMPLETED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewPlatform" AS ENUM ('NAVER_BLOG', 'NAVER_CAFE', 'INSTAGRAM', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'AUTO_APPROVED', 'MANUAL_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "balancePaidAt" TIMESTAMP(3),
ADD COLUMN     "depositAmount" INTEGER DEFAULT 100000,
ADD COLUMN     "depositPaidAt" TIMESTAMP(3),
ADD COLUMN     "discountAmount" INTEGER DEFAULT 0,
ADD COLUMN     "finalBalance" INTEGER DEFAULT 0,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referralDiscount" INTEGER DEFAULT 0,
ADD COLUMN     "referredBy" TEXT,
ADD COLUMN     "referredCount" INTEGER DEFAULT 0,
ADD COLUMN     "reviewDiscount" INTEGER DEFAULT 0,
ADD COLUMN     "reviewLink" TEXT,
ADD COLUMN     "totalAmount" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountEvent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "weddingVenue" TEXT NOT NULL,
    "weddingTime" TEXT,
    "productId" INTEGER NOT NULL,
    "listPrice" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL DEFAULT 100000,
    "depositPaidAt" TIMESTAMP(3),
    "discountEventId" INTEGER,
    "eventDiscount" INTEGER NOT NULL DEFAULT 0,
    "referralDiscount" INTEGER NOT NULL DEFAULT 0,
    "referredBy" TEXT,
    "reviewDiscount" INTEGER NOT NULL DEFAULT 0,
    "finalBalance" INTEGER NOT NULL DEFAULT 0,
    "balancePaidAt" TIMESTAMP(3),
    "partnerCode" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "videoUrl" TEXT,
    "contractUrl" TEXT,
    "videoUploadedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAnonymized" BOOLEAN NOT NULL DEFAULT false,
    "anonymizedAt" TIMESTAMP(3),
    "referredByBookingId" INTEGER,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSubmission" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "reviewUrl" TEXT NOT NULL,
    "platform" "ReviewPlatform" NOT NULL,
    "autoVerified" BOOLEAN NOT NULL DEFAULT false,
    "titleValid" BOOLEAN,
    "contentValid" BOOLEAN,
    "characterCount" INTEGER,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_partnerCode_key" ON "Booking"("partnerCode");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_referralCode_key" ON "Reservation"("referralCode");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_discountEventId_fkey" FOREIGN KEY ("discountEventId") REFERENCES "DiscountEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_referredByBookingId_fkey" FOREIGN KEY ("referredByBookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSubmission" ADD CONSTRAINT "ReviewSubmission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
