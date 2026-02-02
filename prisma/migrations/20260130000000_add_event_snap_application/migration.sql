-- CreateTable EventSnapApplication (야외스냅/프리웨딩 신청, 예약글과 별도)
CREATE TABLE IF NOT EXISTS "EventSnapApplication" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER,
    "type" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "shootLocation" TEXT,
    "shootDate" TEXT,
    "shootTime" TEXT,
    "shootConcept" TEXT,
    "specialNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSnapApplication_pkey" PRIMARY KEY ("id")
);
