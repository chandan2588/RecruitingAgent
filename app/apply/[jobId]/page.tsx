export const dynamic = 'force-dynamic'

import { getJobForApply } from '@/lib/actions/apply'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const job = await getJobForApply(jobId)

  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <span className="text-sm text-gray-600 font-medium">{job.tenant.name}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {job.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {job.isRemote && (
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                Remote
              </span>
            )}
            {job.location && (
              <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
                📍 {job.location}
              </span>
            )}
          </div>

          {job.description && (
            <div className="mb-8">
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interested in this role?</h2>
            <p className="text-gray-600 mb-6">
              Apply now and complete a quick screening. It only takes 5-10 minutes.
            </p>
            <Link
              href={`/apply/${jobId}/start`}
              className="block w-full bg-blue-600 text-white text-center font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Posted by {job.createdBy.name || 'Recruiter'}
        </p>
      </div>
    </div>
  )
}
