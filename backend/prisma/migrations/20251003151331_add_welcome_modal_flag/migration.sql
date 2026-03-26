/*
  Warnings:

  - You are about to drop the column `isNewUser` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isNewUser",
ADD COLUMN     "hasSeenWelcomeModal" BOOLEAN NOT NULL DEFAULT false;
