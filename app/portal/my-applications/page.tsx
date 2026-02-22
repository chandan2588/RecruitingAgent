export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getCandidateSession,
  lookupCandidateByEmail,
} from "@/lib/actions/apply";
import { ApplicationStage } from "@prisma/client";

interface ApplicationWithDetails {
  id: string;
  stage: ApplicationStage;
  score: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    location: string | null;
    isRemote: boolean;
  };
}

interface PageProps {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
}

async function getCandidateApplications(
  tenantId: string,
  candidateId: string
): Promise<ApplicationWithDetails[]> {
  return prisma.application.findMany({
    where: {
      tenantId,
      candidateId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: { id: true, title: true, location: true, isRemote: true },
      },
    },
  });
}

function getStageBadgeColor(stage: ApplicationStage): string {
  const colors: Record<ApplicationStage, string> = {
    NEW: "bg-gray-100 text-gray-800",
    SCREENED: "bg-blue-100 text-blue-800",
    SHORTLISTED: "bg-purple-100 text-purple-800",
    SCHEDULED: "bg-yellow-100 text-yellow-800",
    INTERVIEWED: "bg-orange-100 text-orange-800",
    OFFERED: "bg-pink-100 text-pink-800",
    HIRED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    DROPPED: "bg-gray-100 text-gray-600",
  };
  return colors[stage] || "bg-gray-100 text-gray-800";
}

function getStageDescription(stage: ApplicationStage): string {
  const descriptions: Record<ApplicationStage, string> = {
    NEW: "Application received",
    SCREENED: "Under initial review",
    SHORTLISTED: "Selected for next round",
    SCHEDULED: "Interview scheduled",
    INTERVIEWED: "Interview completed",
    OFFERED: "Offer extended",
    HIRED: "Congratulations! You're hired",
    REJECTED: "Not selected for this role",
    DROPPED: "Application withdrawn",
  };
  return descriptions[stage];
}

function StatusBanner({ status }: { status: string }) {
  if (status === "applied") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <h3 className="font-medium text-green-900">Application Submitted!</h3>
            <p className="text-sm text-green-700">
              Your application has been received. You can track its status below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "already_applied") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-medium text-yellow-900">Already Applied</h3>
            <p className="text-sm text-yellow-700">
              You have already applied to this position. Your application status is shown below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

async function handleEmailLookup(formData: FormData): Promise<void> {
  "use server";

  const email = formData.get("email") as string;

  if (!email?.trim()) {
    redirect("/portal/my-applications?error=email_required");
  }

  const session = await lookupCandidateByEmail(email.trim());

  if (!session) {
    redirect("/portal/my-applications?error=candidate_not_found");
  }

  redirect("/portal/my-applications");
}

export default async function MyApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status;
  const error = params.error;

  // Try to get candidate session from cookie
  const session = await getCandidateSession();

  // No session - show email lookup form
  if (!session) {
    return (
      <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">
            View and track your job applications
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Enter Your Email
            </h2>
            <p className="text-gray-600 mt-2">
              Enter the email address you used when applying to view your applications.
            </p>
          </div>

          {error === "email_required" && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">Please enter your email address.</p>
            </div>
          )}

          {error === "candidate_not_found" && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">
                No applications found for that email. Please check your email address or{" "}
                <Link href="/portal/jobs" className="underline">
                  browse open positions
                </Link>
                .
              </p>
            </div>
          )}

          <form action={handleEmailLookup} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Applications
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/portal/jobs"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Browse Open Positions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Have session - fetch and display applications
  const applications = await getCandidateApplications(
    session.tenantId,
    session.candidateId
  );

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your job applications
          </p>
        </div>
        <Link
          href="/portal"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Portal
        </Link>
      </div>

      {/* Status Banner */}
      {status && <StatusBanner status={status} />}

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No applications yet
          </h3>
          <p className="mt-2 text-gray-500">
            You haven&apos;t applied to any jobs yet.
          </p>
          <Link
            href="/portal/jobs"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Open Positions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: ApplicationWithDetails) => (
            <div
              key={app.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {app.job.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {app.job.location && (
                      <span className="inline-flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {app.job.location}
                        {app.job.isRemote && (
                          <span className="ml-2 text-green-600">(Remote)</span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColor(
                          app.stage
                        )}`}
                      >
                        {app.stage}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getStageDescription(app.stage)}
                      </span>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Note:</span> {app.notes}
                      </p>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-400">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                    {app.updatedAt > app.createdAt &&
                      ` • Last updated ${new Date(
                        app.updatedAt
                      ).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/portal/jobs`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Job
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
