import { getJobForApply } from '@/lib/actions/apply'
import { notFound } from 'next/navigation'
import { StartFormClient } from './StartFormClient'

export default async function StartPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const job = await getJobForApply(jobId)

  if (!job) {
    notFound()
  }

  return <StartFormClient jobId={jobId} jobTitle={job.title} />
}
