-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "overseasResident" BOOLEAN DEFAULT false;
