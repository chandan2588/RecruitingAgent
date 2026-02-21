export interface Question {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'select'
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  rows?: number
}

export const screeningQuestions: Question[] = [
  {
    key: 'yearsExperience',
    label: 'How many years of professional software development experience do you have?',
    type: 'number',
    placeholder: 'e.g. 5',
    required: true,
  },
  {
    key: 'reactExperience',
    label: 'How many years of React/Next.js experience do you have?',
    type: 'number',
    placeholder: 'e.g. 3',
    required: true,
  },
  {
    key: 'currentRole',
    label: 'What is your current role?',
    type: 'text',
    placeholder: 'e.g. Senior Frontend Developer',
    required: true,
  },
  {
    key: 'systemDesign',
    label: 'Describe a system you designed or architected. What were the key challenges and how did you address them?',
    type: 'textarea',
    placeholder: 'Provide details about your approach, trade-offs, and results...',
    required: true,
    rows: 4,
  },
  {
    key: 'availability',
    label: 'When are you available to start?',
    type: 'select',
    required: true,
    options: [
      { value: 'immediate', label: 'Immediately' },
      { value: '2weeks', label: 'Within 2 weeks' },
      { value: '1month', label: 'Within 1 month' },
      { value: '2months', label: 'Within 2 months' },
      { value: '3months', label: '3+ months' },
    ],
  },
  {
    key: 'noticePeriod',
    label: 'What is your current notice period?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'No notice period / Immediately' },
      { value: '1week', label: '1 week' },
      { value: '2weeks', label: '2 weeks' },
      { value: '1month', label: '1 month' },
      { value: '2months', label: '2 months' },
      { value: '3months', label: '3+ months' },
    ],
  },
  {
    key: 'preferredWork',
    label: 'What is your preferred work arrangement?',
    type: 'select',
    required: true,
    options: [
      { value: 'remote', label: 'Fully remote' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'onsite', label: 'On-site' },
    ],
  },
  {
    key: 'salaryExpectation',
    label: 'What are your salary expectations (annual, USD)?',
    type: 'text',
    placeholder: 'e.g. $120,000 - $150,000',
    required: false,
  },
]

// Scoring keywords for system design quality
const systemDesignKeywords = [
  'scalability',
  'scalable',
  'performance',
  'caching',
  'cache',
  'database',
  'db',
  'microservices',
  'api',
  'load balancing',
  'queue',
  'async',
  'event-driven',
  'redis',
  'postgres',
  'mongodb',
  'architecture',
  'patterns',
  'security',
  'monitoring',
  'testing',
  'ci/cd',
  'docker',
  'kubernetes',
  'cloud',
  'aws',
  'azure',
  'gcp',
]

export function calculateScreeningScore(answers: Record<string, string>): number {
  let score = 0

  // Years of experience (0-30 points)
  const yearsExp = parseInt(answers.yearsExperience || '0', 10)
  if (yearsExp >= 8) score += 30
  else if (yearsExp >= 5) score += 25
  else if (yearsExp >= 3) score += 20
  else if (yearsExp >= 1) score += 10
  else score += 5

  // React/Next experience (0-30 points)
  const reactExp = parseInt(answers.reactExperience || '0', 10)
  if (reactExp >= 5) score += 30
  else if (reactExp >= 3) score += 25
  else if (reactExp >= 2) score += 20
  else if (reactExp >= 1) score += 10
  else score += 0

  // System design answer quality (0-20 points)
  const systemDesignAnswer = (answers.systemDesign || '').toLowerCase()
  const keywordMatches = systemDesignKeywords.filter(kw => 
    systemDesignAnswer.includes(kw.toLowerCase())
  ).length
  
  if (keywordMatches >= 6) score += 20
  else if (keywordMatches >= 4) score += 15
  else if (keywordMatches >= 2) score += 10
  else if (systemDesignAnswer.length > 50) score += 5
  else score += 0

  // Availability/Notice period (0-20 points)
  const availability = answers.availability || ''
  const noticePeriod = answers.noticePeriod || ''
  
  const availabilityScore = {
    'immediate': 10,
    '2weeks': 8,
    '1month': 6,
    '2months': 3,
    '3months': 1,
  }[availability] || 0
  
  const noticeScore = {
    'none': 10,
    '1week': 8,
    '2weeks': 6,
    '1month': 4,
    '2months': 2,
    '3months': 0,
  }[noticePeriod] || 0
  
  score += Math.min(20, availabilityScore + noticeScore)

  return Math.min(100, Math.max(0, score))
}
