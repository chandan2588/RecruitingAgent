/**
 * E2E Database Seeding Helper
 * 
 * Creates deterministic test data for E2E tests:
 * - Tenant with clerkOrgId
 * - User with clerkUserId
 * - Job for candidate apply tests
 * 
 * Outputs JSON to stdout: {"jobId":"...","tenantId":"...","userId":"..."}
 */

import { prisma } from "@/lib/prisma";

interface SeedResult {
  jobId: string;
  tenantId: string;
  userId: string;
}

async function seed(): Promise<SeedResult> {
  const clerkOrgId = process.env.E2E_CLERK_ORG_ID;
  const clerkUserId = process.env.E2E_CLERK_USER_ID;
  const adminEmail = process.env.E2E_ADMIN_EMAIL;

  if (!clerkOrgId) {
    throw new Error("E2E_CLERK_ORG_ID environment variable is required");
  }
  if (!clerkUserId) {
    throw new Error("E2E_CLERK_USER_ID environment variable is required");
  }
  if (!adminEmail) {
    throw new Error("E2E_ADMIN_EMAIL environment variable is required");
  }

  // Upsert Tenant
  const tenant = await prisma.tenant.upsert({
    where: { clerkOrgId },
    update: {},
    create: {
      clerkOrgId,
      name: "E2E Organization",
    },
  });

  // Upsert User
  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {},
    create: {
      clerkUserId,
      email: adminEmail,
      name: "E2E Admin",
      tenantId: tenant.id,
    },
  });

  // Create a unique Job with timestamp
  const timestamp = Date.now();
  const jobId = `e2e-job-${timestamp}`;
  const job = await prisma.job.create({
    data: {
      id: jobId,
      tenantId: tenant.id,
      createdById: user.id,
      title: `E2E Senior Software Engineer ${timestamp}`,
      description: "This is an E2E test job posting. Created automatically for Playwright testing.",
      location: "Remote",
      isRemote: true,
    },
  });

  return {
    jobId: job.id,
    tenantId: tenant.id,
    userId: user.id,
  };
}

async function main(): Promise<void> {
  try {
    const result = await seed();
    // Output only JSON to stdout
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
