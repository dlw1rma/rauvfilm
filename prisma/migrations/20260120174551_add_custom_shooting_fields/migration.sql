/*
  Warnings:

  - You are about to drop the column `discountAmount` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `referralCode` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `referredBy` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `referredCount` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reviewLink` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "discountAmount",
DROP COLUMN "referralCode",
DROP COLUMN "referredBy",
DROP COLUMN "referredCount",
DROP COLUMN "reviewLink",
DROP COLUMN "totalAmount",
ADD COLUMN     "customContent" TEXT,
ADD COLUMN     "customEditStyle" TEXT,
ADD COLUMN     "customEffect" TEXT,
ADD COLUMN     "customLength" TEXT,
ADD COLUMN     "customMusic" TEXT,
ADD COLUMN     "customShootingRequest" BOOLEAN DEFAULT false,
ADD COLUMN     "customSpecialRequest" TEXT,
ADD COLUMN     "customStyle" TEXT;
