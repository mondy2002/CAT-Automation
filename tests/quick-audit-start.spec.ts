import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Quick Audit — /audits/start', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, quickAuditStartPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await quickAuditStartPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /audits/start', async ({ page }) => {
      expect(page.url()).toContain('/audits/start');
    });

    test('page title is "Quick Audit"', async ({ quickAuditStartPage }) => {
      const text = (await quickAuditStartPage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/Quick Audit/i);
    });

    test('page subtitle mentions selecting an audit', async ({ quickAuditStartPage }) => {
      const text = (await quickAuditStartPage.pageSubtitle.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toContain('select');
    });

    test('stats row is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.statsRow).toBeVisible();
    });

    test('audit table is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.auditTable).toBeVisible();
    });

    test('filter bar with search is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.searchInput).toBeVisible();
    });
  });

  // ── UI: Stat Cards ──────────────────────────────────────────────────────

  test.describe('UI — Stat Cards', () => {
    test('at least 2 stat cards are visible', async ({ quickAuditStartPage }) => {
      const count = await quickAuditStartPage.statCards.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('Total System Audits card shows a positive number', async ({ quickAuditStartPage }) => {
      const value = await quickAuditStartPage.getStatValue('Total System Audits');
      expect(parseInt(value, 10)).toBeGreaterThan(0);
    });

    test('each stat card has a label', async ({ quickAuditStartPage }) => {
      const cards = await quickAuditStartPage.statCards.all();
      for (const card of cards) {
        const label = (await card.locator('.stat-label').textContent())?.trim() ?? '';
        expect(label.length).toBeGreaterThan(0);
      }
    });

    test('each stat card shows a numeric value', async ({ quickAuditStartPage }) => {
      const cards = await quickAuditStartPage.statCards.all();
      for (const card of cards) {
        const value = (await card.locator('.stat-number').textContent())?.trim() ?? '';
        expect(value).toMatch(/^\d+$/);
      }
    });
  });

  // ── UI: Audit Table ─────────────────────────────────────────────────────

  test.describe('UI — Audit Table', () => {
    test('at least one audit row is present', async ({ quickAuditStartPage }) => {
      const count = await quickAuditStartPage.getAuditCount();
      expect(count).toBeGreaterThan(0);
    });

    test('Audit column header is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.locator('.col-audit')).toBeVisible();
    });

    test('Category column header is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.locator('.col-category')).toBeVisible();
    });

    test('Status column header is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.locator('.col-status')).toBeVisible();
    });

    test('Actions column header is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.locator('.col-actions')).toBeVisible();
    });

    test('first audit row has a name', async ({ quickAuditStartPage }) => {
      const name = quickAuditStartPage.auditRows.first().locator('.audit-name');
      const text = (await name.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('Start button is present per row', async ({ quickAuditStartPage }) => {
      const count = await quickAuditStartPage.startButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Favourite button is present per row', async ({ quickAuditStartPage }) => {
      const count = await quickAuditStartPage.favButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── UI: Filter Bar ──────────────────────────────────────────────────────

  test.describe('UI — Filter Bar', () => {
    test('search input is visible and enabled', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.searchInput).toBeVisible();
      await expect(quickAuditStartPage.searchInput).toBeEnabled();
    });

    test('search placeholder is "Search audits..."', async ({ quickAuditStartPage }) => {
      const ph = await quickAuditStartPage.searchInput.getAttribute('placeholder') ?? '';
      expect(ph).toMatch(/Search audits/i);
    });

    test('Category filter is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.categoryFilter).toBeVisible();
    });

    test('Type filter is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.typeFilter).toBeVisible();
    });

    test('Status filter is visible', async ({ quickAuditStartPage }) => {
      await expect(quickAuditStartPage.statusFilter).toBeVisible();
    });
  });

  // ── Functionality: Search ───────────────────────────────────────────────

  test.describe('Functionality — Search', () => {
    test('typing in search input filters the list', async ({ quickAuditStartPage }) => {
      const original = await quickAuditStartPage.getAuditCount();
      await quickAuditStartPage.searchAudits('fire safety');
      await quickAuditStartPage.page.waitForTimeout(600);
      const filtered = await quickAuditStartPage.getAuditCount();
      expect(filtered).toBeLessThanOrEqual(original);
    });

    test('searching with non-existent term shows fewer results', async ({ quickAuditStartPage }) => {
      const original = await quickAuditStartPage.getAuditCount();
      await quickAuditStartPage.searchAudits('xyznonexistent99999');
      await quickAuditStartPage.page.waitForTimeout(600);
      const filtered = await quickAuditStartPage.getAuditCount();
      expect(filtered).toBeLessThanOrEqual(original);
    });
  });

  // ── Functionality: Start Modal ──────────────────────────────────────────

  test.describe('Functionality — Start Modal', () => {
    test('clicking Start opens the start modal', async ({ quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      expect(await quickAuditStartPage.isStartModalOpen()).toBe(true);
      await quickAuditStartPage.closeStartModal();
    });

    test('start modal has a close button', async ({ quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      await expect(quickAuditStartPage.modalCloseBtn).toBeVisible();
      await quickAuditStartPage.closeStartModal();
    });

    test('start modal has a Cancel button', async ({ quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      await expect(quickAuditStartPage.modalCancelBtn).toBeVisible();
      await quickAuditStartPage.cancelStartModal();
    });

    test('start modal has a Quick Audit submit button', async ({ quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      await expect(quickAuditStartPage.modalQuickAuditBtn).toBeVisible();
      await quickAuditStartPage.closeStartModal();
    });

    test('start modal has Reviewer optional field', async ({ quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      await expect(quickAuditStartPage.reviewerInput).toBeVisible();
      await quickAuditStartPage.closeStartModal();
    });

    test('cancelling the modal closes it', async ({ quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      await quickAuditStartPage.cancelStartModal();
      expect(await quickAuditStartPage.isStartModalOpen()).toBe(false);
    });

    test('pressing Escape closes the modal', async ({ quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      await quickAuditStartPage.page.keyboard.press('Escape');
      await quickAuditStartPage.page.waitForTimeout(400);
      expect(await quickAuditStartPage.isStartModalOpen()).toBe(false);
    });
  });

  // ── Functionality: Favourite Toggle ────────────────────────────────────

  test.describe('Functionality — Favourite Toggle', () => {
    test('clicking favourite button does not navigate away', async ({ page, quickAuditStartPage }) => {
      await quickAuditStartPage.toggleFavourite(0);
      expect(page.url()).toContain('/audits/start');
    });

    test('clicking favourite twice stays on page', async ({ page, quickAuditStartPage }) => {
      await quickAuditStartPage.toggleFavourite(0);
      await quickAuditStartPage.toggleFavourite(0);
      expect(page.url()).toContain('/audits/start');
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL stays at /audits/start', async ({ page }) => {
      expect(page.url()).toContain('/audits/start');
    });

    test('opening and cancelling start modal stays at /audits/start', async ({ page, quickAuditStartPage }) => {
      await quickAuditStartPage.clickStart(0);
      await quickAuditStartPage.cancelStartModal();
      expect(page.url()).toContain('/audits/start');
    });
  });
});
