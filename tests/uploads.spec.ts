import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Uploads Library — /uploads', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, uploadsPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await uploadsPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /uploads', async ({ page }) => {
      expect(page.url()).toContain('/uploads');
    });

    test('page title is "Uploads Library"', async ({ uploadsPage }) => {
      const text = (await uploadsPage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/Uploads Library/i);
    });

    test('page subtitle is visible', async ({ uploadsPage }) => {
      await expect(uploadsPage.pageSubtitle).toBeVisible();
    });

    test('subtitle mentions managing files', async ({ uploadsPage }) => {
      const text = (await uploadsPage.pageSubtitle.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toContain('file');
    });

    test('upload card is visible', async ({ uploadsPage }) => {
      await expect(uploadsPage.uploadCard).toBeVisible();
    });

    test('filter bar is visible', async ({ uploadsPage }) => {
      await expect(uploadsPage.filterBar).toBeVisible();
    });
  });

  // ── UI: Upload Card ─────────────────────────────────────────────────────

  test.describe('UI — Upload Card', () => {
    test('Upload card label is "Upload New Files"', async ({ uploadsPage }) => {
      const label = uploadsPage.locator('.upload-card-label');
      const text = (await label.textContent())?.trim() ?? '';
      expect(text).toMatch(/Upload New Files/i);
    });

    test('drop zone is visible', async ({ uploadsPage }) => {
      expect(await uploadsPage.isDropZoneVisible()).toBe(true);
    });

    test('drop zone shows upload instructions', async ({ uploadsPage }) => {
      const text = (await uploadsPage.dropZone.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toMatch(/upload|drag/i);
    });

    test('upload card has an upload icon', async ({ uploadsPage }) => {
      const icon = uploadsPage.locator('.upload-card-icon');
      await expect(icon).toBeVisible();
    });
  });

  // ── UI: Filter Chips ────────────────────────────────────────────────────

  test.describe('UI — Filter Chips', () => {
    test('6 filter chips are present', async ({ uploadsPage }) => {
      const count = await uploadsPage.getChipCount();
      expect(count).toBe(6);
    });

    test('All chip is visible (teal)', async ({ uploadsPage }) => {
      await expect(uploadsPage.allChip).toBeVisible();
    });

    test('PDF chip is visible (red)', async ({ uploadsPage }) => {
      await expect(uploadsPage.pdfChip).toBeVisible();
    });

    test('Word chip is visible (blue)', async ({ uploadsPage }) => {
      await expect(uploadsPage.wordChip).toBeVisible();
    });

    test('Excel chip is visible (green)', async ({ uploadsPage }) => {
      await expect(uploadsPage.excelChip).toBeVisible();
    });

    test('PowerPoint chip is visible (orange)', async ({ uploadsPage }) => {
      await expect(uploadsPage.pptChip).toBeVisible();
    });

    test('Images chip is visible (purple)', async ({ uploadsPage }) => {
      await expect(uploadsPage.imagesChip).toBeVisible();
    });

    test('All chip is active by default', async ({ uploadsPage }) => {
      const cls = (await uploadsPage.allChip.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('chip labels are correct', async ({ uploadsPage }) => {
      const allText = (await uploadsPage.allChip.textContent())?.trim() ?? '';
      const pdfText = (await uploadsPage.pdfChip.textContent())?.trim() ?? '';
      const wordText = (await uploadsPage.wordChip.textContent())?.trim() ?? '';
      expect(allText).toMatch(/All/i);
      expect(pdfText).toMatch(/PDF/i);
      expect(wordText).toMatch(/Word/i);
    });
  });

  // ── UI: Search and Controls ─────────────────────────────────────────────

  test.describe('UI — Search and Controls', () => {
    test('search input is visible', async ({ uploadsPage }) => {
      await expect(uploadsPage.searchInput).toBeVisible();
    });

    test('search input is enabled', async ({ uploadsPage }) => {
      await expect(uploadsPage.searchInput).toBeEnabled();
    });

    test('search placeholder is "Search file name…"', async ({ uploadsPage }) => {
      const ph = await uploadsPage.searchInput.getAttribute('placeholder') ?? '';
      expect(ph).toMatch(/Search file name/i);
    });

    test('page size selector is visible', async ({ uploadsPage }) => {
      await expect(uploadsPage.pageSizeButton).toBeVisible();
    });
  });

  // ── Functionality: Filter Chips ─────────────────────────────────────────

  test.describe('Functionality — Filter Chips', () => {
    test('clicking PDF chip makes it active', async ({ uploadsPage }) => {
      await uploadsPage.clickFilterChip('pdf');
      const cls = (await uploadsPage.pdfChip.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking All chip after PDF makes All active again', async ({ uploadsPage }) => {
      await uploadsPage.clickFilterChip('pdf');
      await uploadsPage.clickFilterChip('all');
      const cls = (await uploadsPage.allChip.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Word chip makes it active', async ({ uploadsPage }) => {
      await uploadsPage.clickFilterChip('word');
      const cls = (await uploadsPage.wordChip.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Excel chip makes it active', async ({ uploadsPage }) => {
      await uploadsPage.clickFilterChip('excel');
      const cls = (await uploadsPage.excelChip.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Images chip makes it active', async ({ uploadsPage }) => {
      await uploadsPage.clickFilterChip('images');
      const cls = (await uploadsPage.imagesChip.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });
  });

  // ── Functionality: Search ───────────────────────────────────────────────

  test.describe('Functionality — Search', () => {
    test('typing in search input updates the value', async ({ uploadsPage }) => {
      await uploadsPage.searchFiles('test file');
      const value = await uploadsPage.searchInput.inputValue();
      expect(value).toBe('test file');
    });

    test('searching shows empty state when no files match (demo has no uploads)', async ({ uploadsPage }) => {
      await uploadsPage.searchFiles('any file name');
      await uploadsPage.page.waitForTimeout(500);
      const isEmpty = await uploadsPage.isEmptyState();
      expect(isEmpty).toBe(true);
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL is /uploads after load', async ({ page }) => {
      expect(page.url()).toContain('/uploads');
    });
  });
});
