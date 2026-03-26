/*
  Warnings:

  - Added the required column `adminId` to the `UserCommunitySuspension` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCommunitySuspension" ADD COLUMN     "adminId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserCommunitySuspension" ADD CONSTRAINT "UserCommunitySuspension_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
