export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getTenantForOrg(clerkOrgId: string | null) {
  if (!clerkOrgId) return null;
  
  let tenant = await prisma.tenant.findUnique({
    where: { clerkOrgId },
  });

  if (!tenant) {
    // Create tenant for this org
    tenant = await prisma.tenant.create({
      data: {
        clerkOrgId,
        name: "My Organization",
      },
    });
  }

  return tenant;
}

export default async function DashboardHomePage() {
  const session = await auth();
  
  // This shouldn't happen due to middleware, but handle it
  if (!session.userId) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to access the dashboard.</p>
        <Link href="/sign-in" className="text-blue-600">Sign In</Link>
      </div>
    );
  }

  if (!session.orgId) {
    return (
      <div className="p-8 text-center">
        <p>Please select an organization.</p>
        <Link href="/select-org" className="text-blue-600">Select Organization</Link>
      </div>
    );
  }

  const tenant = await getTenantForOrg(session.orgId);

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <p>Error loading organization. Please try again.</p>
        <Link href="/select-org" className="text-blue-600">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Organization: <span className="font-medium text-gray-900">{tenant.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/jobs"
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
              <h2 className="text-xl font-semibold text-gray-900">Jobs</h2>
              <p className="text-gray-600 mt-1">
                Manage job postings and create new positions
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/applications"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Applications
              </h2>
              <p className="text-gray-600 mt-1">
                Review candidates and manage hiring pipeline
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quick Start
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Create a new job posting to start receiving applications
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Review applications and update candidate stages
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Invite team members to collaborate
          </li>
        </ul>
      </div>
    </div>
  );
}
