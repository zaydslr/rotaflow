-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "requiredRole" "UserRole" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "targetRating" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
ADD COLUMN     "unfairnessWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "ShiftPattern" ADD COLUMN     "requiredRole" "UserRole" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "targetRating" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
ADD COLUMN     "unfairnessWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "totalBurden" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StaffBurden" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "burdenValue" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffBurden_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StaffBurden" ADD CONSTRAINT "StaffBurden_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffBurden" ADD CONSTRAINT "StaffBurden_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
