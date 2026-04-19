/**
 * E2E helpers shared across all tests.
 */
import { Page } from '@playwright/test';

export const TEST_USER = {
  name: 'E2E Test User',
  email: `e2e_${Date.now()}@example.com`,
  password: 'Password1!',
};

/** Navigate to a locale-prefixed path */
export function url(path: string, locale = 'en') {
  return `/${locale}${path}`;
}

/** Register a fresh user and return the created email */
export async function registerUser(
  page: Page,
  user = TEST_USER,
): Promise<string> {
  await page.goto(url('/auth/register'));
  await page.getByLabel(/name/i).fill(user.name);
  await page.getByLabel(/email/i).fill(user.email);
  // password fields — pick by placeholder or label order
  const pwFields = page.getByLabel(/password/i);
  await pwFields.nth(0).fill(user.password);
  await pwFields.nth(1).fill(user.password);
  await page.getByRole('button', { name: /register|sign up|create/i }).click();
  return user.email;
}

/** Log in with an existing user and land on dashboard */
export async function loginUser(
  page: Page,
  email: string,
  password = TEST_USER.password,
) {
  await page.goto(url('/auth/login'));
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in|login/i }).click();
  await page.waitForURL(/dashboard/);
}
