'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface StartFormClientProps {
  jobId: string
  jobTitle: string
}

export function StartFormClient({ jobId, jobTitle }: StartFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const location = formData.get('location') as string

    // Client-side validation
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!email.trim() && !phone.trim()) {
      newErrors.email = 'Either email or phone is required'
      newErrors.phone = 'Either email or phone is required'
    }
    if (email.trim() && !email.includes('@')) {
      newErrors.email = 'Please enter a valid email'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    // Store candidate data in sessionStorage for next step
    const candidateData = { fullName, email, phone, location }
    sessionStorage.setItem(`apply-${jobId}-candidate`, JSON.stringify(candidateData))

    // Navigate to screening questions
    router.push(`/apply/${jobId}/screen`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <Link
            href={`/apply/${jobId}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to job
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          <div className="mb-6">
            <span className="text-sm text-gray-500">Step 1 of 2</span>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
              Apply for {jobTitle}
            </h1>
            <p className="text-gray-600 mt-2">
              Tell us about yourself. We need at least your email or phone number.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 555 123 4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Please wait...' : 'Continue'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              At least one of email or phone is required.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
