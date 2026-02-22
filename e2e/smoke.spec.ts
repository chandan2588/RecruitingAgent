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
async function waitForPageLoad(page: Page, urlPattern: RegExp | string): Promise<void> {
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
    const noJobsMessage = page.getByText(/No jobs found|Create your first job/i);

    await expect(jobsTable.or(noJobsMessage)).toBeVisible();

    // Assert New Job button is present
    await expect(
      page.getByRole("link", { name: /\+ New Job|New Job/i })
    ).toBeVisible();
  });

  /**
   * Test: Candidate can apply for a job
   * Tests the full candidate application flow from job listing to submission
   */
  test("Candidate apply redirects to portal", async ({ page }) => {
    const jobId = process.env.E2E_JOB_ID;

    if (!jobId) {
      throw new Error("E2E_JOB_ID environment variable must be set");
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

    // Fill in screening answers (adjust selectors based on your actual form)
    // These are common screening questions - adjust as needed
    const experienceInput = page.locator('input[name="experience"], textarea[name="experience"]').first();
    if (await experienceInput.isVisible().catch(() => false)) {
      await experienceInput.fill("5+ years of relevant experience");
    }

    const reactInput = page.locator('input[name="react_experience"], textarea[name="react_experience"]').first();
    if (await reactInput.isVisible().catch(() => false)) {
      await reactInput.fill("3 years working with React and Next.js");
    }

    const systemDesignInput = page.locator('input[name="system_design"], textarea[name="system_design"]').first();
    if (await systemDesignInput.isVisible().catch(() => false)) {
      await systemDesignInput.fill("Experience designing scalable systems");
    }

    const availabilityInput = page.locator('input[name="availability"], textarea[name="availability"]').first();
    if (await availabilityInput.isVisible().catch(() => false)) {
      await availabilityInput.fill("2 weeks notice");
    }

    // Submit application
    await page.getByRole("button", { name: /Submit Application|Submit/i }).click();

    // Step 5: Verify submission success
    await waitForPageLoad(page, /apply\/.*\/done|portal/);

    // Check for success message or redirect to portal
    const successMessage = page.getByText(
      /Application submitted|Thank you|Success|Your application/i
    );
    const portalHeading = page.getByRole("heading", { name: /Candidate Portal|My Applications/i });

    await expect(successMessage.or(portalHeading)).toBeVisible();

    // Verify application appears in portal (if signed in)
    if (process.env.E2E_CANDIDATE_EMAIL) {
      await page.goto("/portal/applications");
      await waitForPageLoad(page, "/portal/applications");

      await expect(
        page.getByText(candidateName).or(page.getByText(uniqueEmail))
      ).toBeVisible();
    }
  });

  /**
   * Test: Recruiter can update application stage and notes
   * Verifies that recruiters can manage candidate applications
   */
  test("Recruiter can update stage + notes in application detail", async ({ page }) => {
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
    await expect(
      page.locator("text=" + newStage).first()
    ).toBeVisible();

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
    await expect(
      page.locator("text=" + newStage).first()
    ).toBeVisible();

    // Verify notes persisted
    await expect(
      page.locator('textarea[name="notes"]')
    ).toHaveValue(uniqueNote);
  });
});
