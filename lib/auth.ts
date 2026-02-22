import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export interface UserAndTenant {
  user: {
    id: string;
    tenantId: string;
    clerkUserId: string;
    email: string;
    name: string | null;
  };
  tenantId: string;
  tenantName: string;
}

export async function getCurrentUserAndTenant(): Promise<UserAndTenant> {
  const session = await auth();
  const clerkUserId = session.userId;

  if (!clerkUserId) {
    throw new Error("Unauthorized - no clerk user id");
  }

  // Try to find existing user by clerkUserId
  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId },
    include: { tenant: true },
  });

  if (existingUser) {
    return {
      user: {
        id: existingUser.id,
        tenantId: existingUser.tenantId,
        clerkUserId: existingUser.clerkUserId,
        email: existingUser.email,
        name: existingUser.name,
      },
      tenantId: existingUser.tenantId,
      tenantName: existingUser.tenant.name,
    };
  }

  // Get user details from Clerk
  const clerkUser = await fetch(
    `https://api.clerk.com/v1/users/${clerkUserId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }
  ).then((res) => res.json());

  const email =
    clerkUser.email_addresses?.[0]?.email_address || "unknown@example.com";
  const name = clerkUser.first_name
    ? `${clerkUser.first_name} ${clerkUser.last_name || ""}`.trim()
    : email.split("@")[0];
  const tenantName = email.split("@")[1]
    ? `${email.split("@")[1].split(".")[0]} Workspace`
    : "My Workspace";

  // Create tenant and user in transaction
  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: tenantName,
      },
    });

    const newUser = await tx.user.create({
      data: {
        clerkUserId,
        email,
        name,
        tenantId: tenant.id,
      },
    });

    return { user: newUser, tenant };
  });

  return {
    user: {
      id: result.user.id,
      tenantId: result.user.tenantId,
      clerkUserId: result.user.clerkUserId,
      email: result.user.email,
      name: result.user.name,
    },
    tenantId: result.user.tenantId,
    tenantName: result.tenant.name,
  };
}
