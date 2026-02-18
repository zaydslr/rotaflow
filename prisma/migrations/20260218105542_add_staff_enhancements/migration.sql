/*
  Warnings:

  - You are about to drop the column `endTime` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "nightShifts" INTEGER DEFAULT 0,
ADD COLUMN     "rating" INTEGER DEFAULT 1,
ADD COLUMN     "totalHoursThisMonth" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "weekendShifts" INTEGER DEFAULT 0;
