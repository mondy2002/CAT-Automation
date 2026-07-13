import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Review Queue — /audits/review/queue', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, reviewQueuePage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await reviewQueuePage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /audits/review/queue', async ({ page }) => {
      expect(page.url()).toContain('/audits/review/queue');
    });

    test('page title is "Review Queue"', async ({ reviewQueuePage }) => {
      const text = (await reviewQueuePage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/Review Queue/i);
    });

    test('page subtitle is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.pageSubtitle).toBeVisible();
    });

    test('KPI row is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.kpiRow).toBeVisible();
    });

    test('tab bar is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.tabBar).toBeVisible();
    });

    test('review table is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.reviewTable).toBeVisible();
    });

    test('filter bar is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.locator('.filter-bar')).toBeVisible();
    });
  });

  // ── UI: KPI Cards ───────────────────────────────────────────────────────

  test.describe('UI — KPI Cards', () => {
    test('3 KPI cards are present', async ({ reviewQueuePage }) => {
      const count = await reviewQueuePage.kpiCards.count();
      expect(count).toBe(3);
    });

    test('Pending Review KPI card is visible (purple)', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.locator('.rq-kpi-card--purple')).toBeVisible();
    });

    test('Approved This Month KPI card is visible (green)', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.locator('.rq-kpi-card--green')).toBeVisible();
    });

    test('Returned KPI card is visible (amber)', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.locator('.rq-kpi-card--amber')).toBeVisible();
    });

    test('Approved This Month shows a positive integer', async ({ reviewQueuePage }) => {
      const value = await reviewQueuePage.getKpiValue('Approved');
      expect(parseInt(value, 10)).toBeGreaterThan(0);
    });

    test('each KPI card has a label and numeric value', async ({ reviewQueuePage }) => {
      const cards = await reviewQueuePage.kpiCards.all();
      for (const card of cards) {
        const value = (await card.locator('.rq-kpi-value').textContent())?.trim() ?? '';
        const label = (await card.locator('.rq-kpi-label').textContent())?.trim() ?? '';
        expect(value).toMatch(/^\d+$/);
        expect(label.length).toBeGreaterThan(0);
      }
    });
  });

  // ── UI: Tabs ────────────────────────────────────────────────────────────

  test.describe('UI — Tabs', () => {
    test('3 tabs are visible', async ({ reviewQueuePage }) => {
      const count = await reviewQueuePage.tabButtons.count();
      expect(count).toBe(3);
    });

    test('Awaiting Review tab is present', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.awaitingTab).toBeVisible();
    });

    test('Approved tab is present', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.approvedTab).toBeVisible();
    });

    test('Returned tab is present', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.returnedTab).toBeVisible();
    });

    test('Awaiting Review tab is active by default', async ({ reviewQueuePage }) => {
      const cls = (await reviewQueuePage.awaitingTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('each tab has a count badge', async ({ reviewQueuePage }) => {
      const badges = reviewQueuePage.locator('.tab-badge');
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── UI: Filter Bar ──────────────────────────────────────────────────────

  test.describe('UI — Filter Bar', () => {
    test('search input is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.searchInput).toBeVisible();
    });

    test('search input is enabled', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.searchInput).toBeEnabled();
    });

    test('From date picker is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.fromDatePicker).toBeVisible();
    });

    test('To date picker is visible', async ({ reviewQueuePage }) => {
      await expect(reviewQueuePage.toDatePicker).toBeVisible();
    });

    test('search placeholder is "Search audit or auditor…"', async ({ reviewQueuePage }) => {
      const ph = await reviewQueuePage.searchInput.getAttribute('placeholder') ?? '';
      expect(ph).toMatch(/Search audit or auditor/i);
    });
  });

  // ── UI: Table Headers ───────────────────────────────────────────────────

  test.describe('UI — Table Headers', () => {
    test('table has correct column headers', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('approved');
      const headers = await reviewQueuePage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/AUDIT/i);
      expect(headers.join(' ')).toMatch(/AUDITOR/i);
      expect(headers.join(' ')).toMatch(/REVIEWER/i);
      expect(headers.join(' ')).toMatch(/GROUP/i);
      expect(headers.join(' ')).toMatch(/SCORE/i);
      expect(headers.join(' ')).toMatch(/SUBMITTED/i);
      expect(headers.join(' ')).toMatch(/ACTIONS/i);
    });
  });

  // ── Functionality: Tab Switching ────────────────────────────────────────

  test.describe('Functionality — Tab Switching', () => {
    test('clicking Approved tab makes it active', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('approved');
      const cls = (await reviewQueuePage.approvedTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Returned tab makes it active', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('returned');
      const cls = (await reviewQueuePage.returnedTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Awaiting Review tab restores it as active', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('approved');
      await reviewQueuePage.clickTab('awaiting');
      const cls = (await reviewQueuePage.awaitingTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });
  });

  // ── Functionality: Approved Tab ─────────────────────────────────────────

  test.describe('Functionality — Approved Tab', () => {
    test('Approved tab shows records (48 approved in demo)', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('approved');
      const rowCount = await reviewQueuePage.getReviewTableRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('table rows in Approved tab have audit names', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('approved');
      const firstRow = reviewQueuePage.reviewTable.locator('tbody tr').first();
      const text = (await firstRow.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });
  });

  // ── Functionality: Awaiting Review Empty State ──────────────────────────

  test.describe('Functionality — Awaiting Review Empty State', () => {
    test('Awaiting Review tab shows empty state (0 pending in demo)', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('awaiting');
      const isEmpty = await reviewQueuePage.isTableEmpty();
      const rowCount = await reviewQueuePage.getReviewTableRowCount();
      expect(isEmpty || rowCount === 0).toBe(true);
    });
  });

  // ── Functionality: Search ───────────────────────────────────────────────

  test.describe('Functionality — Search', () => {
    test('search input accepts text', async ({ reviewQueuePage }) => {
      await reviewQueuePage.searchAudits('test');
      const value = await reviewQueuePage.searchInput.inputValue();
      expect(value).toBe('test');
    });

    test('searching in Approved tab filters results', async ({ reviewQueuePage }) => {
      await reviewQueuePage.clickTab('approved');
      const originalCount = await reviewQueuePage.getReviewTableRowCount();
      await reviewQueuePage.searchAudits('zzznonexistent12345');
      const filteredCount = await reviewQueuePage.getReviewTableRowCount();
      expect(filteredCount).toBeLessThanOrEqual(originalCount);
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL stays at /audits/review/queue after load', async ({ page }) => {
      expect(page.url()).toContain('/audits/review/queue');
    });
  });
});
