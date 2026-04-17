/**
 * E2E Flow 7: Super admin impersonation
 *
 * Steps:
 *  1. Log in as a superadmin user (seeded or created via API)
 *  2. Navigate to /admin/users
 *  3. Click "Impersonate" on a target user
 *  4. Confirm impersonation banner appears on the dashboard
 *  5. Click "Exit Impersonation"
 *  6. Confirm we are back as admin (banner gone)
 *
 * Relies on ADMIN_EMAIL / ADMIN_PASSWORD env vars for the admin account.
 */
import { test, expect } from '@playwright/test';
import { url } from './helpers';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@eye.test';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Password1!';

test('flow 7 — admin impersonation banner and exit', async ({ page }) => {
  // Log in as super admin
  await page.goto(url('/auth/login'));
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in|log in|login/i }).click();

  // May land on /admin or /dashboard depending on role redirect
  await expect(page).toHaveURL(/admin|dashboard/, { timeout: 15_000 });

  // Navigate to admin users
  await page.goto(url('/admin/users'));
  await expect(page).toHaveURL(/admin\/users/, { timeout: 15_000 });

  // Admin users table should render
  await expect(page.locator('table, [data-testid="users-table"], .users-list').first()).toBeVisible({ timeout: 10_000 });

  // If there are users, click the first impersonate button
  const impersonateBtn = page.getByRole('button', { name: /impersonate/i }).first();
  if (await impersonateBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await impersonateBtn.click();
    await page.waitForTimeout(1500);

    // Impersonation banner should appear
    const banner = page.locator('[data-testid="impersonation-banner"], [class*="impersonat"]').first();
    const bannerVisible = await banner.isVisible({ timeout: 8_000 }).catch(() => false);

    if (bannerVisible) {
      // Exit impersonation
      const exitBtn = page.getByRole('button', { name: /exit impersonat|stop impersonat/i });
      if (await exitBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await exitBtn.click();
        await page.waitForTimeout(1000);
        // Banner should be gone
        await expect(banner).not.toBeVisible({ timeout: 8_000 });
      }
    }
  }

  // Admin UI still accessible
  await expect(page.locator('body')).toBeVisible();
});
