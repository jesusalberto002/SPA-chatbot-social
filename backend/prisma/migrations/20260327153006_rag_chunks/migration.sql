CREATE EXTENSION IF NOT EXISTS vector;
-- CreateTable
CREATE TABLE "Chunks" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chunks_source_idx" ON "Chunks"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Chunks_source_chunkIndex_key" ON "Chunks"("source", "chunkIndex");
