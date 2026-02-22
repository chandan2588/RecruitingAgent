-- AlterTable: Add clerkOrgId to Tenant
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "clerkOrgId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_clerkOrgId_key" ON "Tenant"("clerkOrgId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Tenant_clerkOrgId_idx" ON "Tenant"("clerkOrgId");
