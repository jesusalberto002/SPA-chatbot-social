-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isRecoveryEmailVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "recoveryEmail" TEXT,
ADD COLUMN     "recoveryEmailVerificationCode" TEXT,
ADD COLUMN     "recoveryEmailVerificationCodeExpiresAt" TIMESTAMP(3);
