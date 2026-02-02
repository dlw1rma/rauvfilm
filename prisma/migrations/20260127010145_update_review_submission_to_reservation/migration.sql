-- AlterTable: ReviewSubmission의 bookingId를 reservationId로 변경
-- 1. 기존 외래키 제약 조건 제거
ALTER TABLE "ReviewSubmission" DROP CONSTRAINT IF EXISTS "ReviewSubmission_bookingId_fkey";

-- 2. bookingId 컬럼을 reservationId로 변경
ALTER TABLE "ReviewSubmission" RENAME COLUMN "bookingId" TO "reservationId";

-- 3. 새로운 외래키 제약 조건 추가 (Reservation 참조)
ALTER TABLE "ReviewSubmission" ADD CONSTRAINT "ReviewSubmission_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
