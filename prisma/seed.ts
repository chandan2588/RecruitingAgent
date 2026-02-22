import { prisma } from "@/lib/prisma";
import { ApplicationStage } from "@prisma/client";

async function main() {
  // Find the tenant with clerkOrgId (the one linked to your Admin org)
  const tenant = await prisma.tenant.findFirst({
    where: { clerkOrgId: { not: null } }
  });
  
  if (!tenant) {
    console.log("No tenant with clerkOrgId found.");
    return;
  }

  console.log(`Seeding data for tenant: ${tenant.name} (${tenant.id})`);
  console.log(`Clerk Org ID: ${tenant.clerkOrgId}`);

  // Create sample users
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@example.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@example.com",
      name: "Admin User",
    },
  });

  console.log("Created user:", user.name);

  // Create sample jobs
  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { id: tenant.id + ":job1" },
      update: {},
      create: {
        id: tenant.id + ":job1",
        tenantId: tenant.id,
        createdById: user.id,
        title: "Senior Software Engineer",
        description: "We are looking for a senior software engineer with 5+ years of experience in React and Node.js.",
        location: "San Francisco, CA",
        isRemote: true,
      },
    }),
    prisma.job.upsert({
      where: { id: tenant.id + ":job2" },
      update: {},
      create: {
        id: tenant.id + ":job2",
        tenantId: tenant.id,
        createdById: user.id,
        title: "Product Manager",
        description: "Seeking an experienced product manager to lead our product team.",
        location: "New York, NY",
        isRemote: false,
      },
    }),
    prisma.job.upsert({
      where: { id: tenant.id + ":job3" },
      update: {},
      create: {
        id: tenant.id + ":job3",
        tenantId: tenant.id,
        createdById: user.id,
        title: "UX Designer",
        description: "Join our design team to create beautiful user experiences.",
        location: "Remote",
        isRemote: true,
      },
    }),
  ]);

  console.log(`Created ${jobs.length} jobs`);

  // Create sample candidates
  const candidates = await Promise.all([
    prisma.candidate.upsert({
      where: { id: tenant.id + ":cand1" },
      update: {},
      create: {
        id: tenant.id + ":cand1",
        tenantId: tenant.id,
        fullName: "John Smith",
        email: "john.smith@example.com",
        phone: "+1-555-0001",
        location: "San Francisco, CA",
      },
    }),
    prisma.candidate.upsert({
      where: { id: tenant.id + ":cand2" },
      update: {},
      create: {
        id: tenant.id + ":cand2",
        tenantId: tenant.id,
        fullName: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1-555-0002",
        location: "New York, NY",
      },
    }),
    prisma.candidate.upsert({
      where: { id: tenant.id + ":cand3" },
      update: {},
      create: {
        id: tenant.id + ":cand3",
        tenantId: tenant.id,
        fullName: "Michael Chen",
        email: "mchen@example.com",
        phone: "+1-555-0003",
        location: "Seattle, WA",
      },
    }),
    prisma.candidate.upsert({
      where: { id: tenant.id + ":cand4" },
      update: {},
      create: {
        id: tenant.id + ":cand4",
        tenantId: tenant.id,
        fullName: "Emily Davis",
        email: "emily.davis@example.com",
        phone: "+1-555-0004",
        location: "Austin, TX",
      },
    }),
    prisma.candidate.upsert({
      where: { id: tenant.id + ":cand5" },
      update: {},
      create: {
        id: tenant.id + ":cand5",
        tenantId: tenant.id,
        fullName: "David Wilson",
        email: "dwilson@example.com",
        phone: "+1-555-0005",
        location: "Chicago, IL",
      },
    }),
  ]);

  console.log(`Created ${candidates.length} candidates`);

  // Create sample applications with different stages and scores
  const applications = await Promise.all([
    prisma.application.upsert({
      where: { id: tenant.id + ":app1" },
      update: {},
      create: {
        id: tenant.id + ":app1",
        tenantId: tenant.id,
        jobId: jobs[0].id,
        candidateId: candidates[0].id,
        stage: ApplicationStage.HIRED,
        score: 95,
        notes: "Excellent candidate, strong technical skills and great culture fit.",
      },
    }),
    prisma.application.upsert({
      where: { id: tenant.id + ":app2" },
      update: {},
      create: {
        id: tenant.id + ":app2",
        tenantId: tenant.id,
        jobId: jobs[0].id,
        candidateId: candidates[1].id,
        stage: ApplicationStage.INTERVIEWED,
        score: 82,
        notes: "Good technical skills, needs improvement in system design.",
      },
    }),
    prisma.application.upsert({
      where: { id: tenant.id + ":app3" },
      update: {},
      create: {
        id: tenant.id + ":app3",
        tenantId: tenant.id,
        jobId: jobs[1].id,
        candidateId: candidates[2].id,
        stage: ApplicationStage.SHORTLISTED,
        score: 78,
      },
    }),
    prisma.application.upsert({
      where: { id: tenant.id + ":app4" },
      update: {},
      create: {
        id: tenant.id + ":app4",
        tenantId: tenant.id,
        jobId: jobs[1].id,
        candidateId: candidates[3].id,
        stage: ApplicationStage.SCREENED,
        score: 65,
      },
    }),
    prisma.application.upsert({
      where: { id: tenant.id + ":app5" },
      update: {},
      create: {
        id: tenant.id + ":app5",
        tenantId: tenant.id,
        jobId: jobs[2].id,
        candidateId: candidates[4].id,
        stage: ApplicationStage.NEW,
        score: 0,
      },
    }),
    prisma.application.upsert({
      where: { id: tenant.id + ":app6" },
      update: {},
      create: {
        id: tenant.id + ":app6",
        tenantId: tenant.id,
        jobId: jobs[0].id,
        candidateId: candidates[3].id,
        stage: ApplicationStage.REJECTED,
        score: 45,
        notes: "Not enough experience for senior role.",
      },
    }),
  ]);

  console.log(`Created ${applications.length} applications`);

  // Create some interview slots for the first job
  const interviewSlots = await Promise.all([
    prisma.interviewSlot.create({
      data: {
        jobId: jobs[0].id,
        startsAt: new Date(Date.now() + 86400000), // Tomorrow
        endsAt: new Date(Date.now() + 86400000 + 3600000), // 1 hour slot
        isBooked: false,
      },
    }),
    prisma.interviewSlot.create({
      data: {
        jobId: jobs[0].id,
        startsAt: new Date(Date.now() + 172800000), // Day after tomorrow
        endsAt: new Date(Date.now() + 172800000 + 3600000),
        isBooked: false,
      },
    }),
  ]);

  console.log(`Created ${interviewSlots.length} interview slots`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\nSample data summary:");
  console.log(`- Jobs: ${jobs.length}`);
  console.log(`- Candidates: ${candidates.length}`);
  console.log(`- Applications: ${applications.length}`);
  console.log(`- Interview Slots: ${interviewSlots.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
