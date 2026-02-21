export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
  })
  return job
}

async function updateJob(formData: FormData) {
  'use server'
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const isRemote = formData.get('isRemote') === 'on'
  
  if (!title.trim()) {
    throw new Error('Title is required')
  }
  
  await prisma.job.update({
    where: { id },
    data: {
      title,
      description: description || null,
      location: location || null,
      isRemote,
    },
  })
  
  redirect('/dashboard/jobs')
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getJob(id)
  
  if (!job) {
    notFound()
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/jobs" className="text-blue-600 hover:text-blue-800">
          ← Back to Jobs
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      
      <form action={updateJob} className="space-y-4">
        <input type="hidden" name="id" value={job.id} />
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={job.title}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            defaultValue={job.location || ''}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. San Francisco, CA"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRemote"
            name="isRemote"
            defaultChecked={job.isRemote}
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
            defaultValue={job.description || ''}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Job description..."
          />
        </div>
        
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
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
