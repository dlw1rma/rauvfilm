/*
  Warnings:

  - You are about to drop the column `discountInfo` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `shootTimePlace` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "discountInfo",
DROP COLUMN "shootTimePlace",
ADD COLUMN     "discountCouple" BOOLEAN DEFAULT false,
ADD COLUMN     "discountNewYear" BOOLEAN DEFAULT false,
ADD COLUMN     "discountPreWedding" BOOLEAN DEFAULT false,
ADD COLUMN     "discountReview" BOOLEAN DEFAULT false,
ADD COLUMN     "discountReview1" BOOLEAN DEFAULT false,
ADD COLUMN     "discountReview2" BOOLEAN DEFAULT false,
ADD COLUMN     "discountReview3" BOOLEAN DEFAULT false,
ADD COLUMN     "discountSnap" BOOLEAN DEFAULT false,
ADD COLUMN     "eventType" TEXT,
ADD COLUMN     "shootLocation" TEXT,
ADD COLUMN     "shootTime" TEXT,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "weddingDate" SET DATA TYPE TEXT,
ALTER COLUMN "isPrivate" SET DEFAULT true,
ALTER COLUMN "shootDate" SET DATA TYPE TEXT;
