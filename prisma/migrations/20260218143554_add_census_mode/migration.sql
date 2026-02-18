-- CreateEnum
CREATE TYPE "DemandType" AS ENUM ('FIXED', 'CENSUS');

-- AlterTable
ALTER TABLE "BedAssignment" ADD COLUMN     "procedureId" TEXT;

-- AlterTable
ALTER TABLE "ShiftPattern" ADD COLUMN     "demandType" "DemandType" NOT NULL DEFAULT 'FIXED';

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultAcuity" INTEGER NOT NULL DEFAULT 2,
    "defaultDuration" INTEGER NOT NULL DEFAULT 3,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedAssignment" ADD CONSTRAINT "BedAssignment_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
