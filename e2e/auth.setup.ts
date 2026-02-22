import { test as setup, expect } from "@playwright/test";
import * as path from "path";

const authFile = path.join(__dirname, ".auth", "admin.json");

/**
 * Authentication setup for E2E tests
 * Logs into Clerk using admin credentials and saves storage state
 */
setup("authenticate as admin", async ({ page }) => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set for authentication setup"
    );
  }

  // Navigate to sign in page
  await page.goto("/sign-in");

  // Wait for Clerk's sign-in form to load
  // Clerk uses shadow DOM, so we need to handle it carefully
  await page.waitForSelector("input[name=identifier]", { timeout: 10000 });

  // Fill in email
  await page.fill('input[name="identifier"]', adminEmail);

  // Click continue/submit
  await page.click('button[type="submit"]');

  // Wait for password field
  await page.waitForSelector('input[name="password"]', { timeout: 10000 });

  // Fill in password
  await page.fill('input[name="password"]', adminPassword);

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or select-org
  await page.waitForURL(/\/dashboard|select-org/, { timeout: 30000 });

  // If on select-org page, select the first organization
  if (page.url().includes("/select-org")) {
    // Wait for organization list
    await page.waitForSelector("button", { timeout: 10000 });

    // Click first organization button
    const orgButton = page.locator("button").first();
    await orgButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  }

  // Verify we're on dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Save authentication state
  await page.context().storageState({ path: authFile });

  console.log("Admin authentication state saved to", authFile);
});
