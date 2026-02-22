-- AlterTable
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_clerkUserId_idx" ON "User"("clerkUserId");
