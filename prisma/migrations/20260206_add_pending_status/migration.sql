-- Add PENDING status to BookingStatus enum
-- 예약 생성 시 PENDING 상태로 시작, 관리자 승인 후 CONFIRMED로 변경

-- 1. 새로운 enum 타입 생성 (PENDING 추가)
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'DEPOSIT_COMPLETED', 'DELIVERED', 'CANCELLED');

-- 2. 기본값 제거
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;

-- 3. 컬럼 타입 변경 (기존 데이터는 유지)
ALTER TABLE "Booking"
  ALTER COLUMN "status" TYPE "BookingStatus_new"
  USING ("status"::text::"BookingStatus_new");

-- 4. 기존 enum 삭제 및 이름 변경
DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";

-- 5. 새 기본값 설정 (PENDING)
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"BookingStatus";

-- 6. Reservation 테이블의 기본값 변경 (String 타입)
-- 기존 CONFIRMED 데이터는 그대로 유지 (이미 확정된 예약)
-- 새로 생성되는 예약만 PENDING으로 시작
