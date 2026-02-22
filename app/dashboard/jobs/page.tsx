export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserAndTenant } from "@/lib/auth";

interface JobWithCreatedBy {
  id: string;
  title: string;
  location: string | null;
  isRemote: boolean;
  createdAt: Date;
  createdBy: {
    name: string | null;
    email: string;
  };
}

async function getJobs(tenantId: string): Promise<JobWithCreatedBy[]> {
  try {
    const jobs = await prisma.job.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export default async function JobsPage() {
  const { tenantId } = await getCurrentUserAndTenant();
  const jobs = await getJobs(tenantId);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <Link
          href="/dashboard/jobs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
        >
          + New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No jobs found.</p>
          <Link
            href="/dashboard/jobs/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first job →
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">
                  Title
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Location
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Remote
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Created By
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job: JobWithCreatedBy) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{job.title}</td>
                  <td className="p-4 text-gray-700">
                    {job.location || "-"}
                  </td>
                  <td className="p-4">
                    {job.isRemote ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                        Remote
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">
                        On-site
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-700">
                    {job.createdBy?.name || job.createdBy?.email}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
