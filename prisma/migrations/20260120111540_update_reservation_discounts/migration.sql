/*
  Warnings:

  - You are about to drop the column `discountPreWedding` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `discountReview1` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `discountReview2` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `discountReview3` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `discountSnap` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "discountPreWedding",
DROP COLUMN "discountReview1",
DROP COLUMN "discountReview2",
DROP COLUMN "discountReview3",
DROP COLUMN "discountSnap",
ADD COLUMN     "discountReviewBlog" BOOLEAN DEFAULT false,
ALTER COLUMN "discountNewYear" SET DEFAULT true;
