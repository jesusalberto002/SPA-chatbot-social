/*
  Warnings:

  - You are about to drop the `UserSuspension` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSuspension" DROP CONSTRAINT "UserSuspension_userId_fkey";

-- DropTable
DROP TABLE "UserSuspension";

-- CreateTable
CREATE TABLE "UserCommunitySuspension" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "UserSuspensionStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCommunitySuspension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCommunitySuspension_userId_key" ON "UserCommunitySuspension"("userId");

-- AddForeignKey
ALTER TABLE "UserCommunitySuspension" ADD CONSTRAINT "UserCommunitySuspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
