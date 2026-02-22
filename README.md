# Recruiting Agent

A modern recruiting platform built with Next.js, Prisma, and Clerk authentication. Features separate portals for recruiters (dashboard) and candidates (application portal).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Testing**: Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Clerk account

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## E2E Testing with Playwright

### Installation

Playwright is already included in dev dependencies. To install browsers:

```bash
npx playwright install chromium
```

### Test Scripts

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all E2E tests (headless) |
| `npm run test:e2e:ui` | Open Playwright UI for debugging |
| `npm run test:e2e:report` | View HTML test report |

### Required Environment Variables for E2E

Create a `.env.local` or set these environment variables:

```env
# Required for all tests
E2E_ADMIN_EMAIL=your-admin@example.com
E2E_ADMIN_PASSWORD=your-admin-password
E2E_JOB_ID=seed-job-001  # A job ID that exists for candidate apply tests

# Optional - override base URL
E2E_BASE_URL=http://localhost:3000  # Defaults to localhost if not set
```

### Running Tests Locally

**Option 1: Against local dev server (auto-starts)**

```bash
# Ensure dev dependencies are installed
npm install

# Run tests (starts dev server automatically)
npm run test:e2e
```

**Option 2: Against deployed URL**

```bash
# Set your deployed URL
export E2E_BASE_URL=https://your-app.vercel.app

# Run tests against deployed app
npm run test:e2e
```

**Option 3: With UI for debugging**

```bash
npm run test:e2e:ui
```

### Test Coverage

The E2E suite covers:

1. **Dashboard Jobs** - Verifies recruiter can view jobs list
2. **Candidate Apply Flow** - Full application submission flow
3. **Application Management** - Recruiter can update stage and notes

### Authentication Setup

Tests use Clerk's storage state for authentication:
- `e2e/auth.setup.ts` - Logs in admin user before tests
- Saves auth state to `e2e/.auth/admin.json`
- Subsequent tests reuse this state for dashboard access

The auth file is gitignored and generated fresh each test run.

## CI/CD with GitHub Actions

### Setting Up GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `E2E_BASE_URL` | URL to test against (e.g., Vercel preview or production) |
| `E2E_ADMIN_EMAIL` | Admin user email for Clerk login |
| `E2E_ADMIN_PASSWORD` | Admin user password |
| `E2E_JOB_ID` | Job ID for candidate apply tests |

### CI Workflow

The E2E workflow (`.github/workflows/e2e.yml`) runs on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Manual dispatch with optional base URL override

**Test Strategy:**
1. Install Node.js 20 and dependencies
2. Install Playwright browsers
3. Run E2E tests against specified URL
4. Upload HTML report and test results as artifacts
5. Comment on PR if tests fail

### Running Against Vercel Preview

For PRs, you can run tests against the Vercel preview URL:

1. Add the preview URL to `E2E_BASE_URL` secret, OR
2. Use workflow dispatch with the preview URL

```bash
# Example using GitHub CLI
gh workflow run e2e.yml -f base_url=https://your-preview-url.vercel.app
```

### Artifacts

On test completion:
- **playwright-report/** - HTML test report
- **test-results/** - Screenshots, videos, traces (on failure)

Access artifacts in GitHub Actions → Run → Artifacts.

## Project Structure

```
├── app/
│   ├── (routes)
│   ├── api/              # API routes
│   ├── dashboard/        # Recruiter dashboard
│   ├── portal/           # Candidate portal
│   └── apply/            # Application flow
├── e2e/                  # Playwright tests
│   ├── .auth/            # Auth state (gitignored)
│   ├── auth.setup.ts     # Auth setup
│   └── smoke.spec.ts     # Main test suite
├── lib/
│   ├── actions/          # Server actions
│   ├── prisma.ts         # Database client
│   └── questions.ts      # Screening questions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Sample data
└── playwright.config.ts  # Playwright config
```

## Features

### Recruiter Dashboard (`/dashboard`)
- Manage job postings
- Review and track applications
- Update candidate stages and notes
- Organization management

### Candidate Portal (`/portal`)
- Browse open positions
- Submit applications with screening questions
- Track application status

### Application Flow
1. Candidate browses jobs at `/portal/jobs`
2. Clicks "Apply" and fills details
3. Completes screening questions
4. Application saved with scoring
5. Recruiter reviews in dashboard

## Deployment

### Vercel

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy on push to main

### Database

Prisma migrations run automatically on deploy:

```bash
npx prisma migrate deploy
```

## License

MIT
