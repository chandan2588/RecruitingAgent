import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { ApplicationStage } from '@prisma/client'

// Use the DATABASE_URL from env (Neon or local)
let connectionString = process.env.DATABASE_URL || ''
if (connectionString.startsWith('prisma+postgres://')) {
  connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // Create 1 Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Corporation',
    },
  })
  console.log(`Created tenant: ${tenant.name} (${tenant.id})`)

  // Create 1 User
  const user = await prisma.user.create({
    data: {
      clerkUserId: 'seed_user_001',
      email: 'recruiter@acme.com',
      name: 'Jane Recruiter',
      tenantId: tenant.id,
    },
  })
  console.log(`Created user: ${user.name} (${user.email})`)

  // Create 3 Jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Frontend Engineer',
        description: 'Looking for an experienced React developer with TypeScript expertise.',
        tenantId: tenant.id,
        createdById: user.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Backend Developer (Node.js)',
        description: 'Build scalable APIs and services using Node.js and PostgreSQL.',
        tenantId: tenant.id,
        createdById: user.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Full Stack Engineer',
        description: 'Work across the entire stack - React frontend and Node.js backend.',
        tenantId: tenant.id,
        createdById: user.id,
      },
    }),
  ])
  console.log(`Created ${jobs.length} jobs`)

  // Create 5 Candidates
  const candidatesData = [
    { fullName: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101' },
    { fullName: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-0102' },
    { fullName: 'Carol Davis', email: 'carol@example.com', phone: '+1-555-0103' },
    { fullName: 'David Wilson', email: 'david@example.com', phone: '+1-555-0104' },
    { fullName: 'Eve Brown', email: 'eve@example.com', phone: '+1-555-0105' },
  ]

  const candidates: { id: string; fullName: string | null; email: string | null }[] = []
  for (const data of candidatesData) {
    const candidate = await prisma.candidate.create({
      data: {
        ...data,
        tenantId: tenant.id,
      },
    })
    candidates.push(candidate)
    console.log(`Created candidate: ${candidate.fullName} (${candidate.email})`)
  }

  // Create Applications for each candidate
  const stages = [
    ApplicationStage.NEW,
    ApplicationStage.SCREENED,
    ApplicationStage.SHORTLISTED,
    ApplicationStage.SCHEDULED,
    ApplicationStage.INTERVIEWED,
  ]

  const applications: { id: string; candidateId: string; jobId: string }[] = []
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    // Each candidate applies to 1-2 random jobs
    const numApplications = Math.floor(Math.random() * 2) + 1
    const shuffledJobs = [...jobs].sort(() => Math.random() - 0.5)
    
    for (let j = 0; j < numApplications; j++) {
      const job = shuffledJobs[j]
      const stage = stages[i]
      const score = stage !== ApplicationStage.NEW 
        ? Math.floor(Math.random() * 40) + 60 // Score between 60-99
        : 0

      const application = await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId: job.id,
          tenantId: tenant.id,
          stage,
          score,
        },
      })
      applications.push(application)
      console.log(`Created application: ${candidate.fullName} -> ${job.title} (${stage})`)

      // Add some answers for screened+ applications
      if (stage !== ApplicationStage.NEW) {
        await prisma.answer.createMany({
          data: [
            {
              applicationId: application.id,
              questionKey: 'experience',
              answerText: `I have ${Math.floor(Math.random() * 8) + 2} years of experience working with modern web technologies.`,
            },
            {
              applicationId: application.id,
              questionKey: 'motivation',
              answerText: 'I am excited about the opportunity to contribute to a growing team and work on challenging problems.',
            },
          ],
        })
        console.log(`  -> Added 2 answers`)
      }
    }
  }

  // Create some InterviewSlots
  const now = new Date()
  await Promise.all([
    prisma.interviewSlot.create({
      data: {
        jobId: jobs[0].id,
        startsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endsAt: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      },
    }),
    prisma.interviewSlot.create({
      data: {
        jobId: jobs[0].id,
        startsAt: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Day after tomorrow
        endsAt: new Date(now.getTime() + 49 * 60 * 60 * 1000),
        isBooked: true,
      },
    }),
    prisma.interviewSlot.create({
      data: {
        jobId: jobs[1].id,
        startsAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        endsAt: new Date(now.getTime() + 73 * 60 * 60 * 1000),
      },
    }),
  ])
  console.log(`Created 3 interview slots`)

  console.log('\nSeeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
