import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getFirstTenant() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  return tenant
}

interface JobWithCreatedBy {
  id: string
  title: string
  location: string | null
  isRemote: boolean
  createdBy: {
    name: string | null
    email: string
  }
}

async function getJobs(tenantId: string): Promise<JobWithCreatedBy[]> {
  const jobs = await prisma.job.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
    },
  })
  return jobs as JobWithCreatedBy[]
}

export default async function JobsPage() {
  const tenant = await getFirstTenant()
  
  if (!tenant) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Jobs</h1>
        <p className="text-gray-600">No tenant found. Please create a tenant first.</p>
      </div>
    )
  }
  
  const jobs = await getJobs(tenant.id)
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link
          href="/dashboard/jobs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Job
        </Link>
      </div>
      
      {jobs.length === 0 ? (
        <p className="text-gray-600">No jobs found. Create your first job!</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Title</th>
                <th className="text-left p-4 font-medium text-gray-700">Location</th>
                <th className="text-left p-4 font-medium text-gray-700">Remote</th>
                <th className="text-left p-4 font-medium text-gray-700">Created By</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{job.title}</td>
                  <td className="p-4 text-gray-600">{job.location || '-'}</td>
                  <td className="p-4">
                    {job.isRemote ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Remote
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        On-site
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{job.createdBy.name || job.createdBy.email}</td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="text-blue-600 hover:text-blue-800"
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
  )
}
