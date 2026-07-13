import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Reports — /reports', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, reportsPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await reportsPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /reports', async ({ page }) => {
      expect(page.url()).toContain('/reports');
    });

    test('page title is "Reports"', async ({ reportsPage }) => {
      await expect(reportsPage.pageTitle).toBeVisible();
      const title = (await reportsPage.pageTitle.textContent())?.trim() ?? '';
      expect(title).toMatch(/Reports/i);
    });

    test('page subtitle is visible', async ({ reportsPage }) => {
      await expect(reportsPage.pageSubtitle).toBeVisible();
    });

    test('KPI row is visible', async ({ reportsPage }) => {
      await expect(reportsPage.kpiRow).toBeVisible();
    });

    test('Available Reports grid is visible', async ({ reportsPage }) => {
      await expect(reportsPage.reportsGrid).toBeVisible();
    });

    test('detail / filter card is visible', async ({ reportsPage }) => {
      await expect(reportsPage.detailCard).toBeVisible();
    });
  });

  // ── UI: KPI Cards ───────────────────────────────────────────────────────

  test.describe('UI — KPI Cards', () => {
    test('at least 6 KPI cards are present', async ({ reportsPage }) => {
      const count = await reportsPage.getKpiCardCount();
      expect(count).toBeGreaterThanOrEqual(6);
    });

    test('Completed Audits KPI card is visible (green)', async ({ reportsPage }) => {
      await expect(reportsPage.locator('.rp-kpi-card-green')).toBeVisible();
    });

    test('Overdue Audits KPI card is visible (danger/red)', async ({ reportsPage }) => {
      await expect(reportsPage.locator('.rp-kpi-card-danger')).toBeVisible();
    });

    test('In Progress KPI card is visible (amber)', async ({ reportsPage }) => {
      await expect(reportsPage.locator('.rp-kpi-card-amber')).toBeVisible();
    });

    test('Scheduled KPI card is visible (blue)', async ({ reportsPage }) => {
      await expect(reportsPage.locator('.rp-kpi-card-blue')).toBeVisible();
    });

    test('Total Audits KPI card is visible (teal)', async ({ reportsPage }) => {
      await expect(reportsPage.locator('.rp-kpi-card-teal')).toBeVisible();
    });

    test('Tasks Total KPI card is visible (purple)', async ({ reportsPage }) => {
      await expect(reportsPage.locator('.rp-kpi-card-purple')).toBeVisible();
    });

    test('each KPI card shows a numeric value', async ({ reportsPage }) => {
      const cards = await reportsPage.kpiCards.all();
      for (const card of cards) {
        const value = (await card.locator('.rp-kpi-num').textContent())?.trim() ?? '';
        expect(value).toMatch(/^\d+/);
      }
    });

    test('each KPI card has a label', async ({ reportsPage }) => {
      const cards = await reportsPage.kpiCards.all();
      for (const card of cards) {
        const label = (await card.locator('.rp-kpi-label').textContent())?.trim() ?? '';
        expect(label.length).toBeGreaterThan(0);
      }
    });

    test('each KPI card has an icon', async ({ reportsPage }) => {
      const cards = await reportsPage.kpiCards.all();
      for (const card of cards) {
        const icon = card.locator('.rp-kpi-icon');
        await expect(icon).toBeVisible();
      }
    });
  });

  // ── UI: Reports Grid ────────────────────────────────────────────────────

  test.describe('UI — Reports Grid', () => {
    test('"Available Reports" heading is visible', async ({ reportsPage }) => {
      await expect(reportsPage.page.getByText('Available Reports')).toBeVisible();
    });

    test('at least 5 report cards are present', async ({ reportsPage }) => {
      const count = await reportsPage.getReportCardCount();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('each report card has a non-empty title', async ({ reportsPage }) => {
      const titles = await reportsPage.getReportTitles();
      expect(titles.length).toBeGreaterThan(0);
      for (const title of titles) {
        expect(title.length).toBeGreaterThan(0);
      }
    });

    test('each report card has a Run Report button', async ({ reportsPage }) => {
      const count = await reportsPage.getReportCardCount();
      const btnCount = await reportsPage.runReportButtons.count();
      expect(btnCount).toBe(count);
    });

    test('all Run Report buttons are enabled', async ({ reportsPage }) => {
      const buttons = await reportsPage.runReportButtons.all();
      for (const btn of buttons) {
        await expect(btn).toBeEnabled();
      }
    });

    test('each report card has a description', async ({ reportsPage }) => {
      const descs = await reportsPage.reportDescriptions.all();
      expect(descs.length).toBeGreaterThan(0);
      for (const desc of descs) {
        const text = (await desc.textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test('report cards have an open/hint indicator', async ({ reportsPage }) => {
      const hints = reportsPage.locator('.rcn-open-hint');
      const count = await hints.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── UI: Custom Report ───────────────────────────────────────────────────

  test.describe('UI — Custom Report', () => {
    test('Generate Custom button is visible', async ({ reportsPage }) => {
      await expect(reportsPage.generateCustomButton).toBeVisible();
    });

    test('Generate Custom button is enabled', async ({ reportsPage }) => {
      await expect(reportsPage.generateCustomButton).toBeEnabled();
    });

    test('Generate Custom button contains PDF icon text', async ({ reportsPage }) => {
      const text = (await reportsPage.generateCustomButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/Generate Custom/i);
    });
  });

  // ── Functionality: KPI Values ───────────────────────────────────────────

  test.describe('Functionality — KPI Values', () => {
    test('Completed Audits KPI value is a non-negative integer', async ({ reportsPage }) => {
      const value = await reportsPage.getKpiValue('Completed Audits');
      expect(value).toMatch(/^\d+$/);
    });

    test('Total Audits KPI value is a positive integer', async ({ reportsPage }) => {
      const value = await reportsPage.getKpiValue('Total Audits');
      expect(parseInt(value, 10)).toBeGreaterThan(0);
    });

    test('Total Audits >= Completed Audits', async ({ reportsPage }) => {
      const total = parseInt(await reportsPage.getKpiValue('Total Audits'), 10);
      const completed = parseInt(await reportsPage.getKpiValue('Completed Audits'), 10);
      expect(total).toBeGreaterThanOrEqual(completed);
    });

    test('In Progress KPI value is a non-negative integer', async ({ reportsPage }) => {
      const value = await reportsPage.getKpiValue('In Progress');
      expect(value).toMatch(/^\d+$/);
    });

    test('Tasks Total KPI value is a positive integer', async ({ reportsPage }) => {
      const value = await reportsPage.getKpiValue('Tasks Total');
      expect(parseInt(value, 10)).toBeGreaterThan(0);
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL stays at /reports after page load', async ({ page }) => {
      expect(page.url()).toContain('/reports');
    });

    test('page title element text does not change on idle', async ({ reportsPage }) => {
      const t1 = (await reportsPage.pageTitle.textContent())?.trim() ?? '';
      await reportsPage.page.waitForTimeout(1000);
      const t2 = (await reportsPage.pageTitle.textContent())?.trim() ?? '';
      expect(t1).toBe(t2);
    });
  });
});
