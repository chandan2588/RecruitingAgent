import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getFirstTenant() {
  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  return tenant
}

async function getFirstUser(tenantId: string) {
  const user = await prisma.user.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  })
  return user
}

async function createJob(formData: FormData) {
  'use server'
  
  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  
  if (!tenant) {
    throw new Error('No tenant found')
  }
  
  const user = await prisma.user.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'asc' },
  })
  
  if (!user) {
    throw new Error('No user found')
  }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const isRemote = formData.get('isRemote') === 'on'
  
  if (!title.trim()) {
    throw new Error('Title is required')
  }
  
  const job = await prisma.job.create({
    data: {
      title,
      description: description || null,
      location: location || null,
      isRemote,
      tenantId: tenant.id,
      createdById: user.id,
    },
  })
  
  redirect('/dashboard/jobs')
}

export default async function NewJobPage() {
  const tenant = await getFirstTenant()
  const user = tenant ? await getFirstUser(tenant.id) : null
  
  if (!tenant || !user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">New Job</h1>
        <p className="text-gray-600">
          {!tenant ? 'No tenant found.' : 'No user found.'} Please run the seed script first.
        </p>
      </div>
    )
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/jobs" className="text-blue-600 hover:text-blue-800">
          ← Back to Jobs
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Create New Job</h1>
      
      <form action={createJob} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Senior Frontend Engineer"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. San Francisco, CA"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRemote"
            name="isRemote"
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isRemote" className="ml-2 text-sm font-medium text-gray-700">
            Remote position
          </label>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Job description..."
          />
        </div>
        
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Job
          </button>
          <Link
            href="/dashboard/jobs"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
