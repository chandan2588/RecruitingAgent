import { test, expect, Page } from "@playwright/test";

/**
 * Generate unique candidate email to avoid conflicts
 */
function generateUniqueEmail(): string {
  return `candidate-${Date.now()}@e2e-test.com`;
}

/**
 * Helper to wait for navigation and page load
 */
async function waitForPageLoad(
  page: Page,
  urlPattern: RegExp | string
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
}

/**
 * Smoke tests for Recruiting Agent
 * Covers core recruiter and candidate flows
 */
test.describe("Smoke Tests", () => {
  /**
   * Test: Dashboard Jobs page loads successfully
   * Verifies that authenticated admin can access and view jobs
   */
  test("Dashboard Jobs loads", async ({ page }) => {
    // Navigate to dashboard jobs
    await page.goto("/dashboard/jobs");
    await waitForPageLoad(page, "/dashboard/jobs");

    // Assert Jobs heading is visible
    await expect(
      page.getByRole("heading", { name: /Jobs/i, level: 1 })
    ).toBeVisible();

    // Assert the jobs table or "No jobs" message is visible
    const jobsTable = page.locator("table");
    const noJobsMessage = page.getByText(
      /No jobs found|Create your first job/i
    );

    await expect(jobsTable.or(noJobsMessage)).toBeVisible();

    // Assert New Job button is present
    await expect(
      page.getByRole("link", { name: /\+ New Job|New Job/i })
    ).toBeVisible();
  });

  /**
   * Test: Candidate can apply for a job and is redirected to portal
   * Tests the full candidate application flow from job listing to portal
   */
  test("Candidate apply redirects to portal my-applications", async ({
    page,
  }) => {
    const jobId = process.env.E2E_JOB_ID;

    if (!jobId) {
      throw new Error(
        "E2E_JOB_ID environment variable must be set. " +
          "Run 'npm run test:e2e:seed' first to create a test job, " +
          "or ensure CI sets it from the seed script output."
      );
    }

    const uniqueEmail = generateUniqueEmail();
    const candidateName = `E2E Test Candidate ${Date.now()}`;
    const candidatePhone = `+1-555-${Math.floor(Math.random() * 9000) + 1000}`;
    const candidateLocation = "Test City, TC";

    // Step 1: Navigate to job application page
    await page.goto(`/apply/${jobId}`);
    await waitForPageLoad(page, `/apply/${jobId}`);

    // Verify job details page loaded
    await expect(
      page.getByRole("heading", { name: /Apply for|Interested in this role/i })
    ).toBeVisible();

    // Step 2: Click Apply Now button
    await page.getByRole("link", { name: /Apply Now/i }).click();

    // Step 3: Fill candidate details (Step 1 of application)
    await waitForPageLoad(page, `/apply/${jobId}/start`);

    await page.fill('input[name="fullName"]', candidateName);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="phone"]', candidatePhone);
    await page.fill('input[name="location"]', candidateLocation);

    // Continue to screening questions
    await page.getByRole("button", { name: /Continue/i }).click();

    // Step 4: Fill screening questions (Step 2 of application)
    await waitForPageLoad(page, `/apply/${jobId}/screen`);

    // Fill in screening answers based on actual question keys from lib/questions.ts
    const yearsInput = page.locator('input[name="yearsExperience"]').first();
    if (await yearsInput.isVisible().catch(() => false)) {
      await yearsInput.fill("5");
    }

    const reactInput = page.locator('input[name="reactExperience"]').first();
    if (await reactInput.isVisible().catch(() => false)) {
      await reactInput.fill("3");
    }

    const currentRoleInput = page.locator('input[name="currentRole"]').first();
    if (await currentRoleInput.isVisible().catch(() => false)) {
      await currentRoleInput.fill("Senior Developer");
    }

    const systemDesignInput = page
      .locator('textarea[name="systemDesign"]')
      .first();
    if (await systemDesignInput.isVisible().catch(() => false)) {
      await systemDesignInput.fill(
        "Designed a scalable microservices architecture with Redis caching and PostgreSQL database. Implemented load balancing and monitoring with AWS CloudWatch."
      );
    }

    const availabilitySelect = page
      .locator('select[name="availability"]')
      .first();
    if (await availabilitySelect.isVisible().catch(() => false)) {
      await availabilitySelect.selectOption("2weeks");
    }

    const noticeSelect = page.locator('select[name="noticePeriod"]').first();
    if (await noticeSelect.isVisible().catch(() => false)) {
      await noticeSelect.selectOption("2weeks");
    }

    const preferredWorkSelect = page
      .locator('select[name="preferredWork"]')
      .first();
    if (await preferredWorkSelect.isVisible().catch(() => false)) {
      await preferredWorkSelect.selectOption("remote");
    }

    // Submit application
    await page.getByRole("button", { name: /Submit Application|Submit/i }).click();

    // Step 5: Verify redirect to /portal/my-applications
    await waitForPageLoad(page, /portal\/my-applications/);

    // Check for success banner or My Applications heading
    const successBanner = page.getByText(
      /Application Submitted|Already Applied/i
    );
    const myApplicationsHeading = page.getByRole("heading", {
      name: /My Applications/i,
    });

    await expect(successBanner.or(myApplicationsHeading)).toBeVisible();

    // Verify the application is listed (cookie should be set automatically)
    await expect(
      page.getByText(candidateName).or(page.getByText(uniqueEmail))
    ).toBeVisible();
  });

  /**
   * Test: Recruiter can update application stage and notes
   * Verifies that recruiters can manage candidate applications
   */
  test("Recruiter can update stage + notes in application detail", async ({
    page,
  }) => {
    // Step 1: Navigate to applications list
    await page.goto("/dashboard/applications");
    await waitForPageLoad(page, "/dashboard/applications");

    // Assert Applications page loaded
    await expect(
      page.getByRole("heading", { name: /Applications/i, level: 1 })
    ).toBeVisible();

    // Step 2: Click first "View" link to open application detail
    const viewButton = page.getByRole("link", { name: /View/i }).first();
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    // Step 3: Wait for application detail page
    await page.waitForURL(/\/dashboard\/applications\/.+/, { timeout: 30000 });
    await page.waitForLoadState("networkidle");

    // Assert Application Details heading
    await expect(
      page.getByRole("heading", { name: /Application Details/i })
    ).toBeVisible();

    // Step 4: Change stage
    const newStage = "SHORTLISTED";
    const stageSelect = page.locator('select[name="stage"]');
    await expect(stageSelect).toBeVisible();

    await stageSelect.selectOption(newStage);
    await page.getByRole("button", { name: /Save Stage/i }).click();

    // Wait for page to reload/update
    await page.waitForTimeout(2000);

    // Verify stage badge updated
    await expect(page.locator("text=" + newStage).first()).toBeVisible();

    // Step 5: Update notes
    const uniqueNote = `E2E test note ${Date.now()}: Candidate looks promising`;
    const notesTextarea = page.locator('textarea[name="notes"]');
    await expect(notesTextarea).toBeVisible();

    await notesTextarea.fill(uniqueNote);
    await page.getByRole("button", { name: /Save Notes/i }).click();

    // Wait for save to complete (check for success message or button state)
    await expect(
      page.getByText(/Notes saved successfully|Saved/i)
    ).toBeVisible({ timeout: 10000 });

    // Step 6: Refresh page and verify persistence
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify stage persisted
    await expect(page.locator("text=" + newStage).first()).toBeVisible();

    // Verify notes persisted
    await expect(page.locator('textarea[name="notes"]')).toHaveValue(
      uniqueNote
    );
  });
});
