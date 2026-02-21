import { getJobForApply } from '@/lib/actions/apply'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function DonePage({
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
      <div className="max-w-xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-white rounded-lg shadow-sm border p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          <p className="text-gray-600 mb-2">
            Thank you for applying to the{' '}
            <span className="font-medium text-gray-900">{job.title}</span> position at{' '}
            {job.tenant.name}.
          </p>

          <p className="text-gray-600 mb-8">
            We&apos;ve received your application and will review it shortly. You&apos;ll hear back from us within 5 business days.
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
          <a href={`mailto:${job.createdBy.name || 'support'}@example.com`} className="text-blue-600">
            support
          </a>
        </p>
      </div>
    </div>
  )
}
