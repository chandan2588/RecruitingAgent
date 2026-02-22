"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { screeningQuestions, calculateScreeningScore } from "@/lib/questions";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export interface CandidateInput {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
}

/**
 * Cookie name for candidate session
 * Stores { tenantId, candidateId } as JSON
 */
const CANDIDATE_SESSION_COOKIE = "candidate_session";

/**
 * Set candidate session cookie
 * Used to identify candidate in portal
 */
async function setCandidateSessionCookie(
  tenantId: string,
  candidateId: string
): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({ tenantId, candidateId });

  cookieStore.set(CANDIDATE_SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function getJobForApply(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      tenant: {
        select: { name: true },
      },
      createdBy: {
        select: { name: true },
      },
    },
  });
  return job;
}

export async function submitApplication(
  jobId: string,
  candidateInput: CandidateInput,
  answers: Record<string, string>
) {
  // Get current user if signed in
  const session = await auth();
  const clerkUserId = session.userId;

  // Get job to find tenant
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const tenantId = job.tenantId;

  // Validate: at least email or phone required
  const email = candidateInput.email?.trim() || null;
  const phone = candidateInput.phone?.trim() || null;

  if (!email && !phone) {
    throw new Error("Either email or phone is required");
  }

  // Upsert candidate by (tenantId, email) or (tenantId, phone)
  let candidate;

  // Try to find existing candidate
  if (email) {
    candidate = await prisma.candidate.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email,
        },
      },
    });
  }

  if (!candidate && phone) {
    candidate = await prisma.candidate.findUnique({
      where: {
        tenantId_phone: {
          tenantId,
          phone,
        },
      },
    });
  }

  if (candidate) {
    // Update existing candidate
    candidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        fullName: candidateInput.fullName,
        email: email || candidate.email,
        phone: phone || candidate.phone,
        location: candidateInput.location || candidate.location,
        // Only set clerkUserId if not already set and user is signed in
        ...(clerkUserId && !candidate.clerkUserId ? { clerkUserId } : {}),
      },
    });
  } else {
    // Create new candidate
    candidate = await prisma.candidate.create({
      data: {
        fullName: candidateInput.fullName,
        email,
        phone,
        location: candidateInput.location || null,
        tenantId,
        clerkUserId,
      },
    });
  }

  // Check if already applied - set cookie and redirect to portal
  const existingApplication = await prisma.application.findFirst({
    where: {
      jobId,
      candidateId: candidate.id,
    },
  });

  if (existingApplication) {
    // Set session cookie so portal can load applications
    await setCandidateSessionCookie(tenantId, candidate.id);
    // Redirect to portal with already_applied status
    redirect("/portal/my-applications?status=already_applied");
  }

  // Calculate screening score
  const score = calculateScreeningScore(answers);

  // Create application
  await prisma.application.create({
    data: {
      tenantId,
      jobId,
      candidateId: candidate.id,
      stage: "NEW",
      score,
    },
  });

  // Store answers
  const answerData = screeningQuestions
    .filter((q) => answers[q.key])
    .map((q) => ({
      applicationId: candidate.id,
      questionKey: q.key,
      answerText: answers[q.key],
    }));

  if (answerData.length > 0) {
    await prisma.answer.createMany({
      data: answerData,
    });
  }

  // Set session cookie and redirect to portal
  await setCandidateSessionCookie(tenantId, candidate.id);
  redirect("/portal/my-applications?status=applied");
}

/**
 * Get candidate session from cookie
 * Returns null if no valid session
 */
export async function getCandidateSession(): Promise<{
  tenantId: string;
  candidateId: string;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CANDIDATE_SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value) as {
      tenantId: string;
      candidateId: string;
    };
    return session;
  } catch {
    return null;
  }
}

/**
 * Lookup candidate by email and set session cookie
 * Used by portal when candidate doesn't have a cookie
 */
export async function lookupCandidateByEmail(
  email: string
): Promise<{ tenantId: string; candidateId: string } | null> {
  // Find candidate by email across all tenants
  // Since email is unique per tenant, we need to handle multiple results
  const candidates = await prisma.candidate.findMany({
    where: { email },
    take: 1,
    orderBy: { createdAt: "desc" },
  });

  if (candidates.length === 0) {
    return null;
  }

  const candidate = candidates[0];

  // Set session cookie
  await setCandidateSessionCookie(candidate.tenantId, candidate.id);

  return { tenantId: candidate.tenantId, candidateId: candidate.id };
}

/**
 * Clear candidate session cookie
 */
export async function clearCandidateSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CANDIDATE_SESSION_COOKIE);
}
