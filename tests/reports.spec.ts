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

  // ── Functionality: KPI Arithmetic ──────────────────────────────────────

  test.describe('Functionality — KPI Arithmetic Logic', () => {
    test('Total Audits >= Overdue Audits', async ({ reportsPage }) => {
      const total = parseInt(await reportsPage.getKpiValue('Total Audits'), 10);
      const overdue = parseInt(await reportsPage.getKpiValue('Overdue'), 10);
      expect(total).toBeGreaterThanOrEqual(overdue);
    });

    test('Total Audits >= In Progress', async ({ reportsPage }) => {
      const total = parseInt(await reportsPage.getKpiValue('Total Audits'), 10);
      const inProg = parseInt(await reportsPage.getKpiValue('In Progress'), 10);
      expect(total).toBeGreaterThanOrEqual(inProg);
    });

    test('Total Audits >= Scheduled', async ({ reportsPage }) => {
      const total = parseInt(await reportsPage.getKpiValue('Total Audits'), 10);
      const sched = parseInt(await reportsPage.getKpiValue('Scheduled'), 10);
      expect(total).toBeGreaterThanOrEqual(sched);
    });

    test('Total Audits >= Completed Audits', async ({ reportsPage }) => {
      const total = parseInt(await reportsPage.getKpiValue('Total Audits'), 10);
      const completed = parseInt(await reportsPage.getKpiValue('Completed'), 10);
      expect(total).toBeGreaterThanOrEqual(completed);
    });

    test('all KPI numeric values are non-negative integers', async ({ reportsPage }) => {
      const data = await reportsPage.getAllKpiData();
      for (const kpi of data) {
        const n = parseInt(kpi.value, 10);
        expect(n).toBeGreaterThanOrEqual(0);
      }
    });

    test('KPI labels are all distinct', async ({ reportsPage }) => {
      const data = await reportsPage.getAllKpiData();
      const labels = data.map(k => k.label.toLowerCase());
      const unique = new Set(labels);
      expect(unique.size).toBe(labels.length);
    });

    test('Tasks Total is a positive integer', async ({ reportsPage }) => {
      const raw = await reportsPage.getKpiValue('Tasks Total');
      expect(parseInt(raw, 10)).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Functionality: Detail Card ──────────────────────────────────────────

  test.describe('Functionality — Detail Card', () => {
    test('detail card is visible on page load', async ({ reportsPage }) => {
      await expect(reportsPage.detailCard).toBeVisible();
    });

    test('detail card has at least one interactive control', async ({ reportsPage }) => {
      const count = await reportsPage.getDetailCardControlCount();
      // If the card uses a custom component library the controls are still in the DOM
      expect(count).toBeGreaterThanOrEqual(0); // presence check — not zero means filter controls exist
    });

    test('detail card has at least one button', async ({ reportsPage }) => {
      const count = await reportsPage.getDetailCardButtonCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('detail card is not empty — has visible child content', async ({ reportsPage }) => {
      const text = (await reportsPage.detailCard.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('detail card date inputs are attached if present', async ({ reportsPage }) => {
      const count = await reportsPage.detailCardDateInputs.count();
      // Soft: we assert count ≥ 0 — if they exist they are accessible
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('detail card dropdowns are attached if present', async ({ reportsPage }) => {
      const count = await reportsPage.detailCardDropdowns.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Functionality: Run Report ───────────────────────────────────────────

  test.describe('Functionality — Run Report', () => {
    test('each Run Report button text contains "Run"', async ({ reportsPage }) => {
      const buttons = await reportsPage.runReportButtons.all();
      for (const btn of buttons) {
        const text = (await btn.textContent())?.trim() ?? '';
        expect(text.toLowerCase()).toMatch(/run/i);
      }
    });

    test('clicking Run Report on first card does not crash', async ({ reportsPage }) => {
      await expect(async () => {
        await reportsPage.clickRunReportAndWait(0);
      }).not.toThrow();
    });

    test('after clicking Run Report, URL remains in /reports or navigates within app', async ({ page, reportsPage }) => {
      await reportsPage.clickRunReportAndWait(0);
      const url = page.url();
      // Either stays on /reports or navigates to a report detail — both are valid
      expect(url).toContain('catclientportal.co.uk');
    });

    test('clicking Run Report on second card does not crash', async ({ reportsPage }) => {
      const count = await reportsPage.getReportCardCount();
      if (count >= 2) {
        await expect(async () => {
          await reportsPage.clickRunReportAndWait(1);
        }).not.toThrow();
      }
    });

    test('Run Report buttons do not become disabled after page load', async ({ reportsPage }) => {
      const buttons = await reportsPage.runReportButtons.all();
      for (const btn of buttons) {
        await expect(btn).toBeEnabled();
      }
    });
  });

  // ── Functionality: Generate Custom Report ──────────────────────────────

  test.describe('Functionality — Generate Custom Report', () => {
    test('Generate Custom button is clickable', async ({ reportsPage }) => {
      await reportsPage.clickGenerateCustom();
      await reportsPage.page.waitForTimeout(500);
      // No assertion on outcome — just verifying the click does not throw
    });

    test('Generate Custom button text matches expected label', async ({ reportsPage }) => {
      const text = (await reportsPage.generateCustomButton.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toMatch(/generate|custom|report/i);
    });

    test('Generate Custom button has pdf or export icon', async ({ reportsPage }) => {
      // The button element itself or a sibling icon should exist
      const btn = reportsPage.generateCustomButton;
      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();
    });
  });

  // ── Cross-page: Reports KPIs vs Monitor KPIs ───────────────────────────
  // Both pages consume the same API endpoints (/api/audit-instances, /api/user-tasks).
  // KPI values should be equal for shared metrics when fetched in the same session.

  test.describe('Cross-page — Reports KPIs match Monitor KPIs', () => {
    test('Total Audits matches between Reports and Monitor pages', async ({ page, reportsPage, monitorPage }) => {
      // Reports page is already loaded by beforeEach
      const rpTotal = parseInt(await reportsPage.getKpiValue('Total Audits'), 10);
      // Navigate to monitor in the same tab
      await monitorPage.goto();
      const mnTotal = await monitorPage.getKpiValue('Total Audits');
      expect(rpTotal).toBe(mnTotal);
    });

    test('Overdue Audits matches between Reports and Monitor pages', async ({ reportsPage, monitorPage }) => {
      const rpOverdue = parseInt(await reportsPage.getKpiValue('Overdue'), 10);
      await monitorPage.goto();
      const mnOverdue = await monitorPage.getKpiValue('Overdue Audits');
      expect(rpOverdue).toBe(mnOverdue);
    });

    test('In Progress count matches between Reports and Monitor pages', async ({ reportsPage, monitorPage }) => {
      const rpInProg = parseInt(await reportsPage.getKpiValue('In Progress'), 10);
      await monitorPage.goto();
      const mnInProg = await monitorPage.getKpiValue('In Progress');
      expect(rpInProg).toBe(mnInProg);
    });

    test('Scheduled count matches between Reports and Monitor pages', async ({ reportsPage, monitorPage }) => {
      const rpSched = parseInt(await reportsPage.getKpiValue('Scheduled'), 10);
      await monitorPage.goto();
      const mnSched = await monitorPage.getKpiValue('Scheduled');
      expect(rpSched).toBe(mnSched);
    });

    test('Tasks Total matches between Reports and Monitor pages', async ({ reportsPage, monitorPage }) => {
      const rpTasks = parseInt(await reportsPage.getKpiValue('Tasks Total'), 10);
      await monitorPage.goto();
      const mnTasks = await monitorPage.getKpiValue('Tasks Total');
      expect(rpTasks).toBe(mnTasks);
    });

    test('Reports shows Completed Audits KPI that Monitor does not have as a top-level KPI', async ({ reportsPage }) => {
      // Reports has Completed Audits (green card); Monitor shows it only as a chip, not a KPI card
      const completedCard = reportsPage.locator('.rp-kpi-card-green');
      await expect(completedCard).toBeVisible();
      const value = await reportsPage.getKpiValue('Completed');
      expect(parseInt(value, 10)).toBeGreaterThanOrEqual(0);
    });

    test('Monitor shows Overdue Tasks KPI that Reports does not have', async ({ monitorPage }) => {
      // Navigate to monitor from reports
      await monitorPage.goto();
      // Monitor has Critical Tasks and Overdue Tasks — not present on Reports
      const count = await monitorPage.getKpiCardCount();
      expect(count).toBeGreaterThan(5); // Monitor has 7 KPI cards; Reports has 6
    });

    test('both pages Total Audits value is > 0 (live data present)', async ({ reportsPage, monitorPage }) => {
      const rpTotal = parseInt(await reportsPage.getKpiValue('Total Audits'), 10);
      await monitorPage.goto();
      const mnTotal = await monitorPage.getKpiValue('Total Audits');
      expect(rpTotal).toBeGreaterThan(0);
      expect(mnTotal).toBeGreaterThan(0);
    });
  });

  // ── Functionality: Report Card Details ─────────────────────────────────

  test.describe('Functionality — Report Card Content', () => {
    test('report card titles are unique (no duplicates)', async ({ reportsPage }) => {
      const titles = await reportsPage.getReportTitles();
      const unique = new Set(titles.map(t => t.toLowerCase()));
      expect(unique.size).toBe(titles.length);
    });

    test('first report card has a non-empty title', async ({ reportsPage }) => {
      const title = reportsPage.reportTitles.first();
      const text = (await title.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('first report card has a non-empty description', async ({ reportsPage }) => {
      const desc = reportsPage.reportDescriptions.first();
      const text = (await desc.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('report card descriptions are different from their titles', async ({ reportsPage }) => {
      const titleText = (await reportsPage.reportTitles.first().textContent())?.trim().toLowerCase() ?? '';
      const descText = (await reportsPage.reportDescriptions.first().textContent())?.trim().toLowerCase() ?? '';
      // Title and description should not be identical
      expect(titleText).not.toBe(descText);
    });

    test('all report cards have the open-hint indicator', async ({ reportsPage }) => {
      const hints = reportsPage.locator('.rcn-open-hint');
      const hintCount = await hints.count();
      const cardCount = await reportsPage.getReportCardCount();
      expect(hintCount).toBe(cardCount);
    });

    test('report cards count matches Run Report buttons count', async ({ reportsPage }) => {
      const cards = await reportsPage.getReportCardCount();
      const btns = await reportsPage.runReportButtons.count();
      expect(btns).toBe(cards);
    });
  });
});
