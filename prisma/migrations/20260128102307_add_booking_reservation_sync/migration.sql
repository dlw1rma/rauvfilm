-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "reservationId" INTEGER;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "bookingId" INTEGER;
