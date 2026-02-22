'use server'

import { prisma } from '@/lib/prisma'
import { screeningQuestions, calculateScreeningScore } from '@/lib/questions'
import { redirect } from 'next/navigation'

export interface CandidateInput {
  fullName: string
  email: string
  phone?: string
  location?: string
}

export async function getJobForApply(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      tenant: {
        select: { name: true },
      },
      createdBy: {
        select: { name: true },
      },
    },
  })
  return job
}

export async function submitApplication(
  jobId: string,
  candidateInput: CandidateInput,
  answers: Record<string, string>
) {
  // Get job to find tenant
  const job = await prisma.job.findUnique({
    where: { id: jobId },
  })

  if (!job) {
    throw new Error('Job not found')
  }

  const tenantId = job.tenantId

  // Validate: at least email or phone required
  const email = candidateInput.email?.trim() || null
  const phone = candidateInput.phone?.trim() || null

  if (!email && !phone) {
    throw new Error('Either email or phone is required')
  }

  // Upsert candidate by (tenantId, email) or (tenantId, phone)
  let candidate

  // Try to find existing candidate
  if (email) {
    candidate = await prisma.candidate.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email,
        },
      },
    })
  }

  if (!candidate && phone) {
    candidate = await prisma.candidate.findUnique({
      where: {
        tenantId_phone: {
          tenantId,
          phone,
        },
      },
    })
  }

  if (candidate) {
    // Update existing candidate
    candidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        fullName: candidateInput.fullName,
        email: email || candidate.email,
        phone: phone || candidate.phone,
        location: candidateInput.location || candidate.location,
      },
    })
  } else {
    // Create new candidate
    candidate = await prisma.candidate.create({
      data: {
        fullName: candidateInput.fullName,
        email,
        phone,
        location: candidateInput.location || null,
        tenantId,
      },
    })
  }

  // Check if already applied - redirect instead of throwing error
  const existingApplication = await prisma.application.findFirst({
    where: {
      jobId,
      candidateId: candidate.id,
    },
  })

  if (existingApplication) {
    // Redirect to done page with already_applied status
    redirect(`/apply/${jobId}/done?status=already_applied`)
  }

  // Calculate screening score
  const score = calculateScreeningScore(answers)

  // Create application
  const application = await prisma.application.create({
    data: {
      tenantId,
      jobId,
      candidateId: candidate.id,
      stage: 'NEW',
      score,
    },
  })

  // Store answers
  const answerData = screeningQuestions
    .filter(q => answers[q.key])
    .map(q => ({
      applicationId: application.id,
      questionKey: q.key,
      answerText: answers[q.key],
    }))

  if (answerData.length > 0) {
    await prisma.answer.createMany({
      data: answerData,
    })
  }

  return { applicationId: application.id, score }
}

export async function redirectToDone(jobId: string) {
  redirect(`/apply/${jobId}/done`)
}
