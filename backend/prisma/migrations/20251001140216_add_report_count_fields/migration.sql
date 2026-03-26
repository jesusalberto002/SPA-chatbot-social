-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0;
