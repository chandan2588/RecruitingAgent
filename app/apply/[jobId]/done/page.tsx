export const dynamic = 'force-dynamic'

import { getJobForApply } from '@/lib/actions/apply'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function DonePage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { jobId } = await params
  const { status } = await searchParams
  const job = await getJobForApply(jobId)

  if (!job) {
    notFound()
  }

  const isAlreadyApplied = status === 'already_applied'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <div className={`w-16 h-16 ${isAlreadyApplied ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {isAlreadyApplied ? (
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {isAlreadyApplied ? 'Already Applied!' : 'Application Submitted!'}
          </h1>

          <p className="text-gray-700 mb-2">
            {isAlreadyApplied ? (
              <>You have already applied to the <span className="font-semibold text-gray-900">{job.title}</span> position.</>
            ) : (
              <>Thank you for applying to the <span className="font-semibold text-gray-900">{job.title}</span> position at {job.tenant.name}.</>
            )}
          </p>

          <p className="text-gray-600 mb-8">
            {isAlreadyApplied 
              ? "We've recorded your previous application and will be in touch soon."
              : "We've received your application and will review it shortly. You'll hear back from us within 5 business days."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/apply/${jobId}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View job posting again →
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Need help? Contact{' '}
          <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
            support
          </a>
        </p>
      </div>
    </div>
  )
}
