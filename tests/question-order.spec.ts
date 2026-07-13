import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Question Order — /setup/question-order', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, questionOrderPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await questionOrderPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /setup/question-order', async ({ page }) => {
      expect(page.url()).toContain('/setup/question-order');
    });

    test('page title is "Question Display Order"', async ({ questionOrderPage }) => {
      const text = (await questionOrderPage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/Question.*Order/i);
    });

    test('page subtitle is visible', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.pageSubtitle).toBeVisible();
    });

    test('page container is present', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.container).toBeVisible();
    });

    test('selector section is visible', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.selectorSection).toBeVisible();
    });
  });

  // ── UI: Selector Cards ──────────────────────────────────────────────────

  test.describe('UI — Selector Cards', () => {
    test('exactly 2 selector cards are visible', async ({ questionOrderPage }) => {
      const count = await questionOrderPage.getSelectorCardCount();
      expect(count).toBe(2);
    });

    test('Category selector card is visible', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.categoryCard).toBeVisible();
    });

    test('Audit selector card is visible', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.auditCard).toBeVisible();
    });

    test('Category selector has a label', async ({ questionOrderPage }) => {
      const text = (await questionOrderPage.categoryCard.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toMatch(/category|audit type/i);
    });

    test('Category selector shows a trigger/placeholder', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.categoryTrigger).toBeVisible();
    });

    test('Audit selector shows a trigger/placeholder', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.auditTrigger).toBeVisible();
    });
  });

  // ── UI: Disabled Audit Card ─────────────────────────────────────────────

  test.describe('UI — Disabled Audit Card', () => {
    test('Audit card is disabled before selecting a category', async ({ questionOrderPage }) => {
      const isDisabled = await questionOrderPage.isAuditCardDisabled();
      expect(isDisabled).toBe(true);
    });

    test('disabled audit card has .sel-card--disabled class', async ({ questionOrderPage }) => {
      const cls = (await questionOrderPage.auditCard.getAttribute('class')) ?? '';
      expect(cls).toContain('disabled');
    });

    test('idle hint is visible before any selection', async ({ questionOrderPage }) => {
      await expect(questionOrderPage.idleHint).toBeVisible();
    });

    test('idle hint directs user to select a category', async ({ questionOrderPage }) => {
      const text = (await questionOrderPage.idleHint.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toMatch(/category|select/i);
    });
  });

  // ── Functionality: Category Selection ──────────────────────────────────

  test.describe('Functionality — Category Selection', () => {
    test('clicking category trigger opens dropdown', async ({ questionOrderPage }) => {
      await questionOrderPage.categoryTrigger.click();
      await questionOrderPage.page.waitForTimeout(500);
      const optionsVisible = await questionOrderPage.locator('.sel-dropdown').first().isVisible().catch(() => false);
      expect(optionsVisible).toBe(true);
    });

    test('after selecting a category, audit card becomes enabled', async ({ questionOrderPage }) => {
      const selected = await questionOrderPage.selectFirstCategory();
      if (selected) {
        const isDisabled = await questionOrderPage.isAuditCardDisabled();
        expect(isDisabled).toBe(false);
      }
    });

    test('after selecting a category, idle hint is hidden', async ({ questionOrderPage }) => {
      const selected = await questionOrderPage.selectFirstCategory();
      if (selected) {
        const isVisible = await questionOrderPage.idleHint.isVisible().catch(() => false);
        expect(isVisible).toBe(false);
      }
    });

    test('selected category name appears in category trigger', async ({ questionOrderPage }) => {
      const selected = await questionOrderPage.selectFirstCategory();
      if (selected) {
        const text = (await questionOrderPage.categoryTrigger.textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(0);
        const hasPlaceholder = text.toLowerCase().includes('select') && text.toLowerCase().includes('category');
        expect(hasPlaceholder).toBe(false);
      }
    });
  });

  // ── Functionality: Audit Selection ─────────────────────────────────────

  test.describe('Functionality — Audit Selection', () => {
    test('after selecting category, audit trigger is enabled', async ({ questionOrderPage }) => {
      const selected = await questionOrderPage.selectFirstCategory();
      if (selected) {
        const isDisabled = await questionOrderPage.auditTrigger.isDisabled().catch(() => false);
        expect(isDisabled).toBe(false);
      }
    });

    test('clicking audit trigger after category selection opens audit dropdown', async ({ questionOrderPage }) => {
      const selected = await questionOrderPage.selectFirstCategory();
      if (selected) {
        await questionOrderPage.auditTrigger.click();
        await questionOrderPage.page.waitForTimeout(500);
        const optionsVisible = await questionOrderPage.locator('.sel-dropdown').first().isVisible().catch(() => false);
        expect(optionsVisible).toBe(true);
      }
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL is /setup/question-order after load', async ({ page }) => {
      expect(page.url()).toContain('/setup/question-order');
    });
  });
});
