import { getJobForApply } from '@/lib/actions/apply'
import { screeningQuestions } from '@/lib/questions'
import { notFound } from 'next/navigation'
import { ScreenFormClient } from './ScreenFormClient'

export default async function ScreenPage({
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
    <ScreenFormClient
      jobId={jobId}
      jobTitle={job.title}
      questions={screeningQuestions}
    />
  )
}
