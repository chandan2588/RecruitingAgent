export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
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

async function getMyApplications(userId: string): Promise<ApplicationWithDetails[]> {
  // First find or create the candidate record for this user
  let candidate = await prisma.candidate.findFirst({
    where: { clerkUserId: userId },
  });

  if (!candidate) {
    // No applications yet
    return [];
  }

  return prisma.application.findMany({
    where: { candidateId: candidate.id },
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

export default async function PortalApplicationsPage() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return (
      <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
        <p className="text-red-600">Please sign in to view your applications.</p>
      </div>
    );
  }

  const applications = await getMyApplications(userId);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <Link
          href="/portal"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Portal
        </Link>
      </div>

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
            You haven't applied to any jobs yet.
          </p>
          <Link
            href="/portal/jobs"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Open Positions
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
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
