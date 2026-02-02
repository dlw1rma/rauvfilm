-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "discountAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" TEXT,
ADD COLUMN     "referredCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewLink" TEXT,
ADD COLUMN     "totalAmount" INTEGER;
