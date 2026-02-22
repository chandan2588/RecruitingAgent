export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ApplicationStage } from '@prisma/client'

interface ApplicationsPageProps {
  searchParams: Promise<{
    jobId?: string
    stage?: string
    minScore?: string
  }>
}

async function getApplications(
  tenantId: string,
  filters: {
    jobId?: string
    stage?: string
    minScore?: number
  }
) {
  const where: any = { tenantId }
  
  if (filters.jobId) {
    where.jobId = filters.jobId
  }
  
  if (filters.stage) {
    where.stage = filters.stage
  }
  
  if (filters.minScore !== undefined) {
    where.score = { gte: filters.minScore }
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      candidate: {
        select: { id: true, fullName: true, email: true },
      },
      job: {
        select: { id: true, title: true },
      },
    },
  })

  return applications
}

async function getJobs(tenantId: string) {
  return prisma.job.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true },
  })
}

async function getFirstTenant() {
  return prisma.tenant.findFirst({
    orderBy: { createdAt: 'asc' },
  })
}

function getStageBadgeColor(stage: ApplicationStage) {
  const colors: Record<ApplicationStage, string> = {
    NEW: 'bg-gray-100 text-gray-800',
    SCREENED: 'bg-blue-100 text-blue-800',
    SHORTLISTED: 'bg-purple-100 text-purple-800',
    SCHEDULED: 'bg-yellow-100 text-yellow-800',
    INTERVIEWED: 'bg-orange-100 text-orange-800',
    OFFERED: 'bg-pink-100 text-pink-800',
    HIRED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    DROPPED: 'bg-gray-100 text-gray-600',
  }
  return colors[stage] || 'bg-gray-100 text-gray-800'
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const tenant = await getFirstTenant()
  
  if (!tenant) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Applications</h1>
        <p className="text-gray-600">No tenant found. Please run the seed script.</p>
      </div>
    )
  }

  const params = await searchParams
  const filters = {
    jobId: params.jobId,
    stage: params.stage,
    minScore: params.minScore ? parseInt(params.minScore, 10) : undefined,
  }

  const [applications, jobs] = await Promise.all([
    getApplications(tenant.id, filters),
    getJobs(tenant.id),
  ])

  const stages = Object.values(ApplicationStage)

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <form className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
            <select
              name="jobId"
              defaultValue={filters.jobId || ''}
              className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              name="stage"
              defaultValue={filters.stage || ''}
              className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
            <select
              name="minScore"
              defaultValue={filters.minScore?.toString() || ''}
              className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Score</option>
              <option value="80">80+ (Excellent)</option>
              <option value="60">60+ (Good)</option>
              <option value="40">40+ (Fair)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
            >
              Filter
            </button>
            <Link
              href="/dashboard/applications"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {applications.length === 0 ? (
        <p className="text-gray-600">No applications found matching your criteria.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Candidate</th>
                <th className="text-left p-4 font-medium text-gray-900">Job</th>
                <th className="text-left p-4 font-medium text-gray-900">Stage</th>
                <th className="text-left p-4 font-medium text-gray-900">Score</th>
                <th className="text-left p-4 font-medium text-gray-900">Applied</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                      {app.candidate.fullName || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">{app.candidate.email}</div>
                  </td>
                  <td className="p-4 text-gray-700">{app.job.title}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStageBadgeColor(app.stage)}`}>
                      {app.stage}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getScoreColor(app.score)}`}>
                      {app.score}/100
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
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
