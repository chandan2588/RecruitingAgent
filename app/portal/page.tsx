export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function PortalHomePage() {
  const session = await auth();
  const userId = session.userId;

  // Get counts for the candidate
  const [openJobsCount, myApplicationsCount] = await Promise.all([
    prisma.job.count(),
    prisma.application.count({
      where: {
        candidate: {
          clerkUserId: userId,
        },
      },
    }),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Candidate Portal</h1>
        <p className="text-gray-600 mt-2">
          Welcome! Browse open positions and track your applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/portal/jobs"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Open Positions</h2>
              <p className="text-gray-600 mt-1">
                Browse {openJobsCount} available job openings
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/portal/my-applications"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
              <p className="text-gray-600 mt-1">
                Track your {myApplicationsCount} job application(s)
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">1</div>
            <h4 className="font-medium text-gray-900">Browse Jobs</h4>
            <p className="text-sm text-gray-600">Explore open positions that match your skills</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">2</div>
            <h4 className="font-medium text-gray-900">Apply</h4>
            <p className="text-sm text-gray-600">Submit your application with relevant details</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">3</div>
            <h4 className="font-medium text-gray-900">Track Progress</h4>
            <p className="text-sm text-gray-600">Monitor your application status in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
