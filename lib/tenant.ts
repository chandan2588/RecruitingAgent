import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  clerkOrgId: string;
}

/**
 * Gets the tenant ID from the active Clerk organization.
 * If no active org, redirects to organization selection.
 * If tenant doesn't exist for the org, creates one.
 */
export async function getTenantIdFromActiveOrg(): Promise<TenantContext> {
  const session = await auth();
  
  // Check if user is signed in
  if (!session.userId) {
    throw new Error("Unauthorized - not signed in");
  }

  // Get active organization ID
  const orgId = session.orgId;

  if (!orgId) {
    // Redirect to organization selection page
    redirect("/select-org");
  }

  // Try to find existing tenant by clerkOrgId
  let tenant = await prisma.tenant.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!tenant) {
    // Fetch org details from Clerk
    const orgResponse = await fetch(`https://api.clerk.com/v1/organizations/${orgId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    let orgName = "My Organization";
    
    if (orgResponse.ok) {
      const orgData = await orgResponse.json();
      orgName = orgData.name || orgName;
    }

    // Create tenant for this organization
    tenant = await prisma.tenant.create({
      data: {
        clerkOrgId: orgId,
        name: orgName,
      },
    });
  }

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    clerkOrgId: orgId,
  };
}

/**
 * Gets the current user's role in the active organization
 */
export async function getCurrentOrgRole(): Promise<string | null> {
  const session = await auth();
  return session.orgRole || null;
}

/**
 * Checks if current user is an org admin
 */
export async function isOrgAdmin(): Promise<boolean> {
  const role = await getCurrentOrgRole();
  return role === "org:admin";
}
