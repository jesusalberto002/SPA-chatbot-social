-- CreateTable
CREATE TABLE "UserTagProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tags" "Tags"[] DEFAULT ARRAY[]::"Tags"[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTagProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTagProfile_userId_key" ON "UserTagProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserTagProfile" ADD CONSTRAINT "UserTagProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
