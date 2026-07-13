import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Audit Schedules — /scheduling', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, schedulingPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await schedulingPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /scheduling', async ({ page }) => {
      expect(page.url()).toContain('/scheduling');
      expect(page.url()).not.toContain('/scheduling/wizard');
      expect(page.url()).not.toContain('/scheduling/quick');
    });

    test('page title is "Audit Schedules"', async ({ schedulingPage }) => {
      const text = await schedulingPage.getPageTitle();
      expect(text).toMatch(/Audit Schedules/i);
    });

    test('page title element is visible', async ({ schedulingPage }) => {
      await expect(schedulingPage.pageTitle).toBeVisible();
    });
  });

  // ── UI: Empty State ─────────────────────────────────────────────────────

  test.describe('UI — Empty State', () => {
    test('empty state card is visible (no schedules in demo)', async ({ schedulingPage }) => {
      const isEmpty = await schedulingPage.isEmptyState();
      expect(isEmpty).toBe(true);
    });

    test('empty state text mentions schedules', async ({ schedulingPage }) => {
      const card = schedulingPage.emptyCard.filter({ hasText: 'No schedules' });
      const text = (await card.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toMatch(/schedules/i);
    });

    test('empty card is styled consistently (has .card class)', async ({ schedulingPage }) => {
      const cls = (await schedulingPage.emptyCard.first().getAttribute('class')) ?? '';
      expect(cls).toContain('card');
    });
  });

  // ── UI: Actions ─────────────────────────────────────────────────────────

  test.describe('UI — Actions', () => {
    test('New Schedule button is visible', async ({ schedulingPage }) => {
      await expect(schedulingPage.newScheduleButton).toBeVisible();
    });

    test('New Schedule button is enabled', async ({ schedulingPage }) => {
      await expect(schedulingPage.newScheduleButton).toBeEnabled();
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL is /scheduling after load', async ({ page }) => {
      expect(page.url()).toContain('/scheduling');
    });

    test('clicking New Schedule navigates to /scheduling/wizard', async ({ page, schedulingPage }) => {
      await schedulingPage.clickNewSchedule();
      await page.waitForURL(/\/scheduling\/wizard|\/scheduling\/quick/, { timeout: 10000 });
      const url = page.url();
      expect(url).toMatch(/\/scheduling\/wizard|\/scheduling\/quick/);
    });
  });
});
