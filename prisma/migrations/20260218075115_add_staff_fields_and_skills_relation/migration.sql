/*
  Warnings:

  - You are about to drop the `_SkillToStaff` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SkillToStaff" DROP CONSTRAINT "_SkillToStaff_A_fkey";

-- DropForeignKey
ALTER TABLE "_SkillToStaff" DROP CONSTRAINT "_SkillToStaff_B_fkey";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "email" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STAFF';

-- DropTable
DROP TABLE "_SkillToStaff";

-- CreateTable
CREATE TABLE "SkillToStaff" (
    "staffId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "SkillToStaff_pkey" PRIMARY KEY ("staffId","skillId")
);

-- AddForeignKey
ALTER TABLE "SkillToStaff" ADD CONSTRAINT "SkillToStaff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillToStaff" ADD CONSTRAINT "SkillToStaff_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
