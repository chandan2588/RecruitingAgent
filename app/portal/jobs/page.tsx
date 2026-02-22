export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface JobWithCount {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  isRemote: boolean;
  createdAt: Date;
  _count: {
    applications: number;
  };
}

async function getOpenJobs(): Promise<JobWithCount[]> {
  return prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });
}

export default async function PortalJobsPage() {
  const jobs = await getOpenJobs();

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
        <Link
          href="/portal"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Portal
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No open positions at the moment.</p>
          <p className="text-gray-500 mt-2">Check back later for new opportunities!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.location && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <svg
                          className="w-3 h-3 mr-1"
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
                        {job.location}
                      </span>
                    )}
                    {job.isRemote && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                          />
                        </svg>
                        Remote
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {job._count.applications} applicant(s)
                    </span>
                  </div>
                  {job.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {job.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/apply/${job.id}`}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
