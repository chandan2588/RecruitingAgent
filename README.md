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
| `npm run test:e2e:seed` | Create a fresh E2E test job |

### Required Environment Variables for E2E

Create a `.env.local` or set these environment variables:

```env
# Required for all tests
E2E_ADMIN_EMAIL=your-admin@example.com
E2E_ADMIN_PASSWORD=your-admin-password

# Required for dynamic job creation (CI and local)
DATABASE_URL="postgresql://..."  # Direct Neon URL for Prisma
E2E_CLERK_ORG_ID=org_xxx          # Your Clerk organization ID
E2E_CLERK_USER_ID=user_xxx       # Your Clerk user ID

# Optional - override base URL
E2E_BASE_URL=http://localhost:3000  # Defaults to localhost if not set
```

### Finding Clerk IDs

To get your `E2E_CLERK_ORG_ID` and `E2E_CLERK_USER_ID`:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Organization ID: Organizations → Select org → copy ID from URL or settings
3. User ID: Users → Select your test user → copy User ID

### Running Tests Locally

**Option 1: Full flow with dynamic job creation**

```bash
# 1. Set required environment variables
export DATABASE_URL="postgresql://..."
export E2E_CLERK_ORG_ID="org_your_org_id"
export E2E_CLERK_USER_ID="user_your_user_id"
export E2E_ADMIN_EMAIL="admin@example.com"
export E2E_ADMIN_PASSWORD="password"

# 2. Create a test job (outputs JSON with jobId)
npm run test:e2e:seed
# Output: {"jobId":"e2e-job-1234567890","tenantId":"...","userId":"..."}

# 3. Run tests with the generated job ID
export E2E_JOB_ID="e2e-job-1234567890"
npm run test:e2e
```

**Option 2: Using the seed output directly**

```bash
# Create job and capture ID
export E2E_JOB_ID=$(npm run test:e2e:seed 2>/dev/null | tail -1 | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).jobId)")

# Run tests
npm run test:e2e
```

**Option 3: Against deployed URL**

```bash
export E2E_BASE_URL=https://your-app.vercel.app
export DATABASE_URL="postgresql://..."
export E2E_CLERK_ORG_ID="org_..."
export E2E_CLERK_USER_ID="user_..."
export E2E_ADMIN_EMAIL="..."
export E2E_ADMIN_PASSWORD="..."

# Create job in production database
export E2E_JOB_ID=$(npm run test:e2e:seed 2>/dev/null | tail -1 | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).jobId)")

# Run tests against deployed app
npm run test:e2e
```

**Option 4: With UI for debugging**

```bash
export E2E_JOB_ID=$(npm run test:e2e:seed 2>/dev/null | tail -1 | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).jobId)")
npm run test:e2e:ui
```

### Test Coverage

The E2E suite covers:

1. **Dashboard Jobs** - Verifies recruiter can view jobs list
2. **Candidate Apply Flow** - Full application submission flow using dynamically created job
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
| `DATABASE_URL` | Direct Neon PostgreSQL connection string |
| `E2E_CLERK_ORG_ID` | Clerk organization ID for E2E test tenant |
| `E2E_CLERK_USER_ID` | Clerk user ID for E2E test admin |
| `E2E_BASE_URL` | URL to test against (e.g., Vercel preview or production) |
| `E2E_ADMIN_EMAIL` | Admin user email for Clerk login |
| `E2E_ADMIN_PASSWORD` | Admin user password |

### How CI Works

The E2E workflow (`.github/workflows/e2e.yml`) runs on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Manual dispatch with optional base URL override

**Test Strategy:**
1. Install Node.js 20 and dependencies
2. Install Playwright browsers
3. **Seed E2E data**: Run `e2e/helpers/seed.ts` which:
   - Creates/updates Tenant with `E2E_CLERK_ORG_ID`
   - Creates/updates User with `E2E_CLERK_USER_ID`
   - Creates a new Job with unique timestamp
   - Exports jobId to `E2E_JOB_ID` env variable
4. Run E2E tests using the dynamically created job
5. Upload HTML report and test results as artifacts
6. Comment on PR if tests fail

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

## E2E Test Data Management

### Seed Script (`e2e/helpers/seed.ts`)

The seed script creates deterministic test data:

```typescript
// Upserts Tenant
{ clerkOrgId: process.env.E2E_CLERK_ORG_ID, name: "E2E Organization" }

// Upserts User  
{ clerkUserId: process.env.E2E_CLERK_USER_ID, email: process.env.E2E_ADMIN_EMAIL, name: "E2E Admin" }

// Creates Job
{ id: `e2e-job-${timestamp}`, title: `E2E Senior Software Engineer ${timestamp}`, ... }
```

Output (JSON to stdout):
```json
{"jobId":"e2e-job-1234567890","tenantId":"...","userId":"..."}
```

### Cleanup (Optional)

Jobs are tagged with "E2E" prefix for easy identification. To clean up old test jobs:

```sql
-- Example: Delete jobs older than 7 days
DELETE FROM "Job" WHERE title LIKE 'E2E%' AND "createdAt" < NOW() - INTERVAL '7 days';
```

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
│   ├── helpers/          # Test utilities
│   │   └── seed.ts       # Dynamic test data creation
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
