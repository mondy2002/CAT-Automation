import { Page } from '@playwright/test';

export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function clearAndFill(page: Page, selector: string, value: string): Promise<void> {
  const locator = page.locator(selector);
  await locator.clear();
  await locator.fill(value);
}

export function generateRandomEmail(): string {
  const timestamp = Date.now();
  return `test_${timestamp}@example.com`;
}

export function generateRandomString(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

export async function retryAction<T>(
  action: () => Promise<T>,
  retries = 3,
  delayMs = 500,
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}
