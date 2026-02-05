-- AlterEnum: BookingStatus 간소화
-- 기존 6단계 (PENDING, CONFIRMED, DEPOSIT_PAID, COMPLETED, DELIVERED, CANCELLED)
-- 신규 4단계 (CONFIRMED, DEPOSIT_COMPLETED, DELIVERED, CANCELLED)

-- 1. Reservation 모델의 상태 업데이트 (String 타입이므로 먼저 처리)
UPDATE "Reservation" SET "status" = 'CONFIRMED' WHERE "status" = 'PENDING';
UPDATE "Reservation" SET "status" = 'DEPOSIT_COMPLETED' WHERE "status" = 'DEPOSIT_PAID';
UPDATE "Reservation" SET "status" = 'DELIVERED' WHERE "status" = 'COMPLETED';

-- 2. 새로운 enum 타입 생성 (먼저!)
CREATE TYPE "BookingStatus_new" AS ENUM ('CONFIRMED', 'DEPOSIT_COMPLETED', 'DELIVERED', 'CANCELLED');

-- 3. 기본값 제거 (ALTER 전 필수)
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;

-- 4. 컬럼 타입 변경 (CASE로 값 매핑)
ALTER TABLE "Booking"
  ALTER COLUMN "status" TYPE "BookingStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'CONFIRMED'
      WHEN 'DEPOSIT_PAID' THEN 'DEPOSIT_COMPLETED'
      WHEN 'COMPLETED' THEN 'DELIVERED'
      ELSE "status"::text
    END
  )::"BookingStatus_new";

-- 5. 기존 enum 삭제 및 이름 변경
DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";

-- 6. 기본값 재설정
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED'::"BookingStatus";
