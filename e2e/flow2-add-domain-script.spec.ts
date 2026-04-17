/**
 * E2E Flow 2: Add domain → copy script tag → confirm script snippet is shown
 *
 * Steps:
 *  1. Register + login
 *  2. Navigate to /settings/domains
 *  3. Click "Add Domain"
 *  4. Enter a domain name and submit
 *  5. Domain card appears in the list
 *  6. Script snippet is visible and contains data-token attribute
 */
import { test, expect } from '@playwright/test';
import { url, registerUser, loginUser, TEST_USER } from './helpers';

test('flow 2 — add domain and see script snippet', async ({ page }) => {
  const email = `flow2_${Date.now()}@e2e.test`;
  const user = { ...TEST_USER, email };

  await registerUser(page, user);

  // Log in (registration may or may not auto-login depending on env)
  if (!page.url().includes('dashboard')) {
    await loginUser(page, email);
  }

  // Navigate to domains settings
  await page.goto(url('/settings/domains'));
  await expect(page).toHaveURL(/settings\/domains/, { timeout: 15_000 });

  // Click "Add Domain" button
  const addBtn = page.getByRole('button', { name: /add domain/i });
  await expect(addBtn).toBeVisible({ timeout: 10_000 });
  await addBtn.click();

  // Fill the domain input in the modal/form
  const domainInput = page.getByPlaceholder(/example\.com|domain/i).first();
  await expect(domainInput).toBeVisible({ timeout: 5_000 });
  await domainInput.fill('e2etest.example.com');
  await page.getByRole('button', { name: /save|add|create|confirm/i }).last().click();

  // Domain card should appear
  await expect(page.getByText('e2etest.example.com')).toBeVisible({ timeout: 10_000 });

  // Script snippet should contain a token
  const snippet = page.locator('code, pre, [data-testid="script-snippet"]').first();
  await expect(snippet).toBeVisible({ timeout: 10_000 });
  const snippetText = await snippet.textContent();
  expect(snippetText).toMatch(/data-token|eye\.min\.js/i);
});
