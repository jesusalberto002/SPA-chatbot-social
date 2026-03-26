/*
  Warnings:

  - The primary key for the `CommentReaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostReaction` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "CommentReaction" DROP CONSTRAINT "CommentReaction_pkey",
ADD CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("userId", "commentId");

-- AlterTable
ALTER TABLE "PostReaction" DROP CONSTRAINT "PostReaction_pkey",
ADD CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("userId", "postId");
