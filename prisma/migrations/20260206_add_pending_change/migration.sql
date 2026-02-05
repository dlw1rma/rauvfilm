-- CreateEnum
CREATE TYPE "PendingChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PendingChange" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "changes" TEXT NOT NULL,
    "status" "PendingChangeStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingChange_reservationId_idx" ON "PendingChange"("reservationId");
CREATE INDEX "PendingChange_status_idx" ON "PendingChange"("status");
