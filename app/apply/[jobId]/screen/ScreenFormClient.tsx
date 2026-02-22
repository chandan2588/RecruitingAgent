'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitApplication, type CandidateInput } from '@/lib/actions/apply'
import type { Question } from '@/lib/questions'

interface ScreenFormClientProps {
  jobId: string
  jobTitle: string
  questions: Question[]
}

export function ScreenFormClient({ jobId, jobTitle, questions }: ScreenFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [candidateData, setCandidateData] = useState<CandidateInput | null>(null)

  useEffect(() => {
    // Retrieve candidate data from sessionStorage
    const stored = sessionStorage.getItem(`apply-${jobId}-candidate`)
    if (!stored) {
      // Redirect back to start if no candidate data
      router.push(`/apply/${jobId}/start`)
      return
    }
    setCandidateData(JSON.parse(stored))
  }, [jobId, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!candidateData) {
      setError('Session expired. Please start over.')
      setIsSubmitting(false)
      return
    }

    // Collect answers
    const formData = new FormData(e.currentTarget)
    const answers: Record<string, string> = {}
    
    questions.forEach(q => {
      const value = formData.get(q.key)
      if (value) {
        answers[q.key] = value as string
      }
    })

    // Validate required questions
    const missingRequired = questions
      .filter(q => q.required && !answers[q.key])
      .map(q => q.label)

    if (missingRequired.length > 0) {
      setError(`Please answer all required questions: ${missingRequired.join(', ')}`)
      setIsSubmitting(false)
      return
    }

    try {
      await submitApplication(jobId, candidateData, answers)
      // Clear session storage - redirect is handled by submitApplication
      sessionStorage.removeItem(`apply-${jobId}-candidate`)
      // Note: submitApplication handles the redirect to /portal/my-applications
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!candidateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href={`/apply/${jobId}/start`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <span className="text-sm text-gray-600 font-medium">Step 2 of 2</span>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
              Screening Questions
            </h1>
            <p className="text-gray-600 mt-2">
              Help us understand your experience better for the {jobTitle} position.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question) => (
              <div key={question.key}>
                <label
                  htmlFor={question.key}
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'textarea' && (
                  <textarea
                    id={question.key}
                    name={question.key}
                    rows={question.rows || 4}
                    required={question.required}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={question.placeholder}
                  />
                )}

                {question.type === 'text' && (
                  <input
                    type="text"
                    id={question.key}
                    name={question.key}
                    required={question.required}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={question.placeholder}
                  />
                )}

                {question.type === 'number' && (
                  <input
                    type="number"
                    id={question.key}
                    name={question.key}
                    min={0}
                    max={50}
                    required={question.required}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={question.placeholder}
                  />
                )}

                {question.type === 'select' && question.options && (
                  <select
                    id={question.key}
                    name={question.key}
                    required={question.required}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
