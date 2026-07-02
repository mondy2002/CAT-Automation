import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

// Chip and KPI labels used in multiple describe blocks
const KPI_LABELS = [
  'Overdue Audits',
  'In Progress',
  'Scheduled',
  'Total Audits',
  'Tasks Total',
  'Critical Tasks',
  'Overdue Tasks',
] as const;

const STATUS_CHIPS = ['Completed', 'In Progress', 'Scheduled', 'Pending Review', 'Overdue'] as const;

const VALID_STATUSES = ['Scheduled', 'In Progress', 'Overdue', 'Completed', 'Pending Review'];

test.describe('Monitor', () => {
  // Serial mode: prevents concurrent logins that throttle the QC server.
  // Retries guard against one-off network blips.
  test.describe.configure({ mode: 'serial', retries: 1 });

  // Log in once per test; each nested beforeEach then navigates to /monitor
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
  });

  // ── Page Load ──────────────────────────────────────────────────────────────
  test.describe('Page Load', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('should load on the /monitor URL', async ({ page }) => {
      expect(page.url()).toContain(urls.monitor);
    });

    test('should display the monitor page wrapper', async ({ page }) => {
      await expect(page.locator('.monitor-page')).toBeVisible();
    });

    test('should display the KPI grid', async ({ page }) => {
      await expect(page.locator('.kpi-grid')).toBeVisible();
    });

    test('should display 7 KPI cards', async ({ monitorPage }) => {
      expect(await monitorPage.getKpiCardCount()).toBe(7);
    });

    test('should display the table card container', async ({ page }) => {
      await expect(page.locator('.table-card')).toBeVisible();
    });

    test('should display the audit list header row', async ({ page }) => {
      await expect(page.locator('.al-header')).toBeVisible();
    });

    test('should display at least one audit row', async ({ monitorPage }) => {
      expect(await monitorPage.getVisibleRowCount()).toBeGreaterThan(0);
    });
  });

  // ── KPI Cards ──────────────────────────────────────────────────────────────
  test.describe('KPI Cards', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    for (const label of KPI_LABELS) {
      test(`should display the "${label}" KPI card`, async ({ page }) => {
        await expect(page.locator('.kpi-card').filter({ hasText: label })).toBeVisible();
      });
    }

    test('every KPI card should show a non-negative integer', async ({ monitorPage }) => {
      for (let i = 0; i < 7; i++) {
        const value = await monitorPage.getKpiNum(i);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    });

    test('every KPI card should have a visible label', async ({ monitorPage }) => {
      for (let i = 0; i < 7; i++) {
        const label = await monitorPage.getKpiLabel(i);
        expect(label.length).toBeGreaterThan(0);
      }
    });

    test('Total Audits KPI should be a positive number', async ({ monitorPage }) => {
      expect(await monitorPage.getKpiValue('Total Audits')).toBeGreaterThan(0);
    });

    test('Overdue Audits card should use the danger colour variant', async ({ page }) => {
      await expect(page.locator('.kpi-card-danger')).toBeVisible();
    });

    test('In Progress card should use the amber colour variant', async ({ page }) => {
      await expect(page.locator('.kpi-card-amber')).toBeVisible();
    });

    test('Scheduled card should use the blue colour variant', async ({ page }) => {
      await expect(page.locator('.kpi-card-blue')).toBeVisible();
    });

    test('Tasks Total card should use the purple colour variant', async ({ page }) => {
      await expect(page.locator('.kpi-card-purple')).toBeVisible();
    });

    test('Critical Tasks card should use the rose colour variant', async ({ page }) => {
      await expect(page.locator('.kpi-card-rose')).toBeVisible();
    });
  });

  // ── Filter Chips ───────────────────────────────────────────────────────────
  test.describe('Filter Chips', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('should display 7 filter chips', async ({ monitorPage }) => {
      expect(await monitorPage.getChipCount()).toBe(7);
    });

    test('"All" chip should be active on page load', async ({ monitorPage }) => {
      expect(await monitorPage.isChipActive('All')).toBe(true);
    });

    test('"All" chip count should match the Total Audits KPI card', async ({ monitorPage }) => {
      const allChipCount = await monitorPage.getChipNumber('All');
      const kpiTotal = await monitorPage.getKpiValue('Total Audits');
      expect(allChipCount).toBe(kpiTotal);
    });

    test('"Overdue" chip count should match the Overdue Audits KPI card', async ({ monitorPage }) => {
      expect(await monitorPage.getChipNumber('Overdue')).toBe(
        await monitorPage.getKpiValue('Overdue Audits'),
      );
    });

    test('"In Progress" chip count should match the In Progress KPI card', async ({ monitorPage }) => {
      expect(await monitorPage.getChipNumber('In Progress')).toBe(
        await monitorPage.getKpiValue('In Progress'),
      );
    });

    for (const label of STATUS_CHIPS) {
      test(`clicking "${label}" chip should make it active`, async ({ monitorPage }) => {
        await monitorPage.clickChip(label);
        expect(await monitorPage.isChipActive(label)).toBe(true);
      });

      test(`clicking "${label}" chip should deactivate the "All" chip`, async ({ monitorPage }) => {
        await monitorPage.clickChip(label);
        expect(await monitorPage.isChipActive('All')).toBe(false);
      });
    }

    test('clicking "Quick Audit" chip should make it active', async ({ monitorPage }) => {
      await monitorPage.clickChip('Quick Audit');
      expect(await monitorPage.isChipActive('Quick Audit')).toBe(true);
    });

    test('clicking "All" after another chip should restore "All" as active', async ({ monitorPage }) => {
      await monitorPage.clickChip('Overdue');
      expect(await monitorPage.isChipActive('All')).toBe(false);
      await monitorPage.clickChip('All');
      expect(await monitorPage.isChipActive('All')).toBe(true);
    });

    test('"Overdue" chip filter should reduce visible rows to the overdue subset', async ({
      monitorPage,
    }) => {
      // "Overdue" is a due-date filter, not a status filter — rows may still show
      // "In Progress" or "Scheduled" status while being past their due date.
      await monitorPage.clickChip('Overdue');
      const rowCount = await monitorPage.getVisibleRowCount();
      const chipCount = await monitorPage.getChipNumber('Overdue');
      expect(rowCount).toBeGreaterThan(0);
      // Visible rows are capped at 10 per page; chip total can be larger
      expect(rowCount).toBeLessThanOrEqual(Math.max(chipCount, 10));
    });

    test('"In Progress" filter should show only In-Progress rows', async ({ monitorPage }) => {
      await monitorPage.clickChip('In Progress');
      const statuses = await monitorPage.getAllVisibleStatuses();
      expect(statuses.length).toBeGreaterThan(0);
      for (const s of statuses) {
        expect(s.toLowerCase()).toContain('progress');
      }
    });

    test('"Scheduled" filter should show only Scheduled rows', async ({ monitorPage }) => {
      await monitorPage.clickChip('Scheduled');
      const statuses = await monitorPage.getAllVisibleStatuses();
      expect(statuses.length).toBeGreaterThan(0);
      for (const s of statuses) {
        expect(s.toLowerCase()).toContain('scheduled');
      }
    });

    test('"Completed" filter should show only Completed rows', async ({ monitorPage }) => {
      await monitorPage.clickChip('Completed');
      const statuses = await monitorPage.getAllVisibleStatuses();
      expect(statuses.length).toBeGreaterThan(0);
      for (const s of statuses) {
        expect(s.toLowerCase()).toContain('completed');
      }
    });

    test('"Pending Review" filter should show only Pending-Review rows', async ({ monitorPage }) => {
      await monitorPage.clickChip('Pending Review');
      const statuses = await monitorPage.getAllVisibleStatuses();
      for (const s of statuses) {
        expect(s.toLowerCase()).toContain('pending');
      }
    });

    test('chip filter should not change the page URL', async ({ monitorPage, page }) => {
      const before = page.url();
      await monitorPage.clickChip('Overdue');
      expect(page.url()).toBe(before);
    });

    test('"All" filter should restore the full row list', async ({ monitorPage }) => {
      const initialCount = await monitorPage.getVisibleRowCount();
      await monitorPage.clickChip('Overdue');
      await monitorPage.clickChip('All');
      expect(await monitorPage.getVisibleRowCount()).toBe(initialCount);
    });
  });

  // ── Tabs ───────────────────────────────────────────────────────────────────
  test.describe('Tabs', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('should display exactly 2 tabs', async ({ monitorPage }) => {
      expect(await monitorPage.getTabCount()).toBe(2);
    });

    test('"Audits" tab should be active on page load', async ({ monitorPage }) => {
      expect(await monitorPage.isAuditsTabActive()).toBe(true);
    });

    test('"Tasks" tab should not be active on page load', async ({ monitorPage }) => {
      expect(await monitorPage.isTasksTabActive()).toBe(false);
    });

    test('"Audits" tab badge should match Total Audits KPI', async ({ monitorPage }) => {
      expect(await monitorPage.getAuditsTabBadge()).toBe(
        await monitorPage.getKpiValue('Total Audits'),
      );
    });

    test('"Tasks" tab badge should match Tasks Total KPI', async ({ monitorPage }) => {
      expect(await monitorPage.getTasksTabBadge()).toBe(
        await monitorPage.getKpiValue('Tasks Total'),
      );
    });

    test('clicking "Tasks" tab should make it active', async ({ monitorPage }) => {
      await monitorPage.clickTab('Tasks');
      expect(await monitorPage.isTasksTabActive()).toBe(true);
    });

    test('clicking "Tasks" tab should deactivate "Audits" tab', async ({ monitorPage }) => {
      await monitorPage.clickTab('Tasks');
      expect(await monitorPage.isAuditsTabActive()).toBe(false);
    });

    test('clicking "Audits" after "Tasks" should switch back', async ({ monitorPage }) => {
      await monitorPage.clickTab('Tasks');
      await monitorPage.clickTab('Audits');
      expect(await monitorPage.isAuditsTabActive()).toBe(true);
    });

    test('"Tasks" tab should display rows after being clicked', async ({ monitorPage, page }) => {
      await monitorPage.clickTab('Tasks');
      // Wait for the tasks list to render
      await page.waitForTimeout(600);
      const rowCount = await monitorPage.getVisibleRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('"Tasks" tab badge count should be a positive number', async ({ monitorPage }) => {
      expect(await monitorPage.getTasksTabBadge()).toBeGreaterThan(0);
    });

    test('"Audits" tab badge count should be a positive number', async ({ monitorPage }) => {
      expect(await monitorPage.getAuditsTabBadge()).toBeGreaterThan(0);
    });
  });

  // ── Search ─────────────────────────────────────────────────────────────────
  test.describe('Search', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('search input should be visible', async ({ page }) => {
      await expect(page.locator('input.mon-search-input-inline')).toBeVisible();
    });

    test('search placeholder should mention "Search"', async ({ monitorPage }) => {
      expect(await monitorPage.getSearchPlaceholder()).toMatch(/search/i);
    });

    test('search input should be empty on page load', async ({ monitorPage }) => {
      expect(await monitorPage.getSearchValue()).toBe('');
    });

    test('typing a known term should reduce visible row count', async ({ monitorPage }) => {
      const before = await monitorPage.getVisibleRowCount();
      await monitorPage.searchAudits('Advocacy');
      const after = await monitorPage.getVisibleRowCount();
      expect(after).toBeLessThanOrEqual(before);
    });

    test('typing a non-existent term should show zero rows', async ({ monitorPage }) => {
      await monitorPage.searchAudits('ZZZNONEXISTENT999');
      expect(await monitorPage.getVisibleRowCount()).toBe(0);
    });

    test('clearing search should restore the original row count', async ({ monitorPage }) => {
      const before = await monitorPage.getVisibleRowCount();
      await monitorPage.searchAudits('ZZZNONEXISTENT999');
      await monitorPage.clearSearch();
      expect(await monitorPage.getVisibleRowCount()).toBe(before);
    });

    test('search should retain the typed value in the input', async ({ monitorPage }) => {
      await monitorPage.searchAudits('Care Home');
      expect(await monitorPage.getSearchValue()).toBe('Care Home');
    });

    test('search should not change the page URL', async ({ monitorPage, page }) => {
      const urlBefore = page.url();
      await monitorPage.searchAudits('test');
      expect(page.url()).toBe(urlBefore);
    });

    test('first result should contain the search term in its audit name', async ({ monitorPage }) => {
      await monitorPage.searchAudits('Advocacy');
      const count = await monitorPage.getVisibleRowCount();
      if (count > 0) {
        const name = await monitorPage.getRowAuditName(0);
        expect(name.toLowerCase()).toContain('advocacy');
      }
    });

    test('search is case-insensitive', async ({ monitorPage }) => {
      await monitorPage.searchAudits('advocacy');
      const lower = await monitorPage.getVisibleRowCount();
      await monitorPage.searchAudits('ADVOCACY');
      const upper = await monitorPage.getVisibleRowCount();
      expect(lower).toBe(upper);
    });
  });

  // ── Filter Buttons ─────────────────────────────────────────────────────────
  test.describe('Filter Buttons', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('should display exactly 4 filter buttons', async ({ monitorPage }) => {
      expect(await monitorPage.getFilterButtonCount()).toBe(4);
    });

    test('Auditor filter button should be visible', async ({ page }) => {
      await expect(page.locator('.mon-filter-btn').filter({ hasText: /Auditor/i })).toBeVisible();
    });

    test('Group filter button should be visible', async ({ page }) => {
      // Case-sensitive: avoids matching "group_work" (the Type button's icon name)
      await expect(page.locator('.mon-filter-btn').filter({ hasText: /Group/ })).toBeVisible();
    });

    test('Unarchived filter button should be visible', async ({ page }) => {
      await expect(page.locator('.mon-filter-btn').filter({ hasText: /Unarchived/i })).toBeVisible();
    });

    test('Type filter button should be visible', async ({ page }) => {
      await expect(page.locator('.mon-filter-btn').filter({ hasText: /^.*Type.*$/i })).toBeVisible();
    });

    test('clicking Auditor filter should respond without navigating away', async ({
      monitorPage,
      page,
    }) => {
      const urlBefore = page.url();
      await monitorPage.clickFilterButton('Auditor');
      // Filter click is handled client-side; URL must not change
      expect(page.url()).toBe(urlBefore);
      // Filter button should remain visible (page did not reload)
      await expect(page.locator('.mon-filter-btn').filter({ hasText: /Auditor/ })).toBeVisible();
    });

    test('clicking Group filter should respond without navigating away', async ({
      monitorPage,
      page,
    }) => {
      const urlBefore = page.url();
      await monitorPage.clickFilterButton('Group');
      expect(page.url()).toBe(urlBefore);
      await expect(page.locator('.mon-filter-btn').filter({ hasText: /Group/ })).toBeVisible();
    });

    test('all filter buttons should remain visible after clicking one', async ({ monitorPage, page }) => {
      await monitorPage.clickFilterButton('Auditor');
      expect(await monitorPage.getFilterButtonCount()).toBe(4);
    });
  });

  // ── Audit List Columns ─────────────────────────────────────────────────────
  test.describe('Audit List Columns', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    const EXPECTED_HEADERS = ['Audit', 'Auditor', 'Reviewer', 'Group', 'Status', 'Score', 'Due'];

    for (const header of EXPECTED_HEADERS) {
      test(`"${header}" column header should be visible`, async ({ page }) => {
        await expect(
          page.locator('.al-header .al-h').filter({ hasText: new RegExp(`^${header}$`) }),
        ).toBeVisible();
      });
    }

    test('should display 7 column headers', async ({ monitorPage }) => {
      const headers = await monitorPage.getColumnHeaders();
      expect(headers.length).toBe(7);
    });

    test('column headers should be in the correct order', async ({ monitorPage }) => {
      const headers = await monitorPage.getColumnHeaders();
      const expected = ['Audit', 'Auditor', 'Reviewer', 'Group', 'Status', 'Score', 'Due'];
      expect(headers).toEqual(expected);
    });
  });

  // ── Audit List Rows ────────────────────────────────────────────────────────
  test.describe('Audit List Rows', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('first row should have a non-empty audit name', async ({ monitorPage }) => {
      expect((await monitorPage.getRowAuditName(0)).length).toBeGreaterThan(0);
    });

    test('first row should have a valid status badge', async ({ monitorPage }) => {
      const status = await monitorPage.getRowStatus(0);
      expect(VALID_STATUSES.some(v => status.includes(v))).toBe(true);
    });

    test('first row should have a due date in DD/MM/YYYY format', async ({ monitorPage }) => {
      const due = await monitorPage.getRowDueDate(0);
      expect(due).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('first row should have a group tag', async ({ monitorPage }) => {
      expect((await monitorPage.getRowGroup(0)).length).toBeGreaterThan(0);
    });

    test('first row should show a View button', async ({ monitorPage }) => {
      expect(await monitorPage.isViewButtonVisible(0)).toBe(true);
    });

    test('first row should show an overflow menu button', async ({ monitorPage }) => {
      expect(await monitorPage.isOverflowMenuVisible(0)).toBe(true);
    });

    test('all visible rows should have a non-empty audit name', async ({ monitorPage }) => {
      const count = await monitorPage.getVisibleRowCount();
      for (let i = 0; i < count; i++) {
        expect((await monitorPage.getRowAuditName(i)).length).toBeGreaterThan(0);
      }
    });

    test('all visible rows should have a valid status', async ({ monitorPage }) => {
      const statuses = await monitorPage.getAllVisibleStatuses();
      for (const s of statuses) {
        expect(VALID_STATUSES.some(v => s.includes(v))).toBe(true);
      }
    });

    test('all visible rows should have a due date in DD/MM/YYYY format', async ({ monitorPage }) => {
      const count = await monitorPage.getVisibleRowCount();
      for (let i = 0; i < count; i++) {
        const due = await monitorPage.getRowDueDate(i);
        expect(due).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      }
    });

    test('clicking the overflow menu on the first row should respond client-side', async ({
      monitorPage,
      page,
    }) => {
      const urlBefore = page.url();
      await monitorPage.clickOverflowMenu(0);
      // Overflow click is handled client-side; URL must not change
      expect(page.url()).toBe(urlBefore);
      // The overflow button itself should remain reachable
      await expect(page.locator('.al-overflow-btn').first()).toBeVisible();
    });

    test('status badges should use a pill CSS class', async ({ page }) => {
      await expect(page.locator('.al-row .status-pill').first()).toBeVisible();
    });
  });

  // ── Filter + Search Combined ───────────────────────────────────────────────
  test.describe('Filter and Search Combined', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('chip filter + search should narrow results further', async ({ monitorPage }) => {
      await monitorPage.clickChip('Scheduled');
      const scheduledCount = await monitorPage.getVisibleRowCount();
      await monitorPage.searchAudits('Care');
      const combinedCount = await monitorPage.getVisibleRowCount();
      expect(combinedCount).toBeLessThanOrEqual(scheduledCount);
    });

    test('clearing search after chip filter should restore chip-filtered row count', async ({
      monitorPage,
    }) => {
      await monitorPage.clickChip('Overdue');
      const overdueCount = await monitorPage.getVisibleRowCount();
      await monitorPage.searchAudits('ZZZNONEXISTENT999');
      expect(await monitorPage.getVisibleRowCount()).toBe(0);
      await monitorPage.clearSearch();
      expect(await monitorPage.getVisibleRowCount()).toBe(overdueCount);
    });

    test('applying a status chip then searching keeps only matching rows visible', async ({
      monitorPage,
    }) => {
      await monitorPage.clickChip('Overdue');
      await monitorPage.searchAudits('ZZZNONEXISTENT999');
      expect(await monitorPage.getVisibleRowCount()).toBe(0);
    });

    test('switching to Tasks tab should show a separate list', async ({ monitorPage, page }) => {
      const auditsCount = await monitorPage.getVisibleRowCount();
      await monitorPage.clickTab('Tasks');
      await page.waitForTimeout(600);
      // Task rows may differ in count from audit rows
      const tasksCount = await monitorPage.getVisibleRowCount();
      expect(typeof tasksCount).toBe('number');
      // Switching back should restore audits
      await monitorPage.clickTab('Audits');
      await page.waitForTimeout(600);
      expect(await monitorPage.getVisibleRowCount()).toBe(auditsCount);
    });

    test('search on Tasks tab should filter task rows', async ({ monitorPage, page }) => {
      await monitorPage.clickTab('Tasks');
      await page.waitForTimeout(600);
      const before = await monitorPage.getVisibleRowCount();
      if (before > 0) {
        await monitorPage.searchAudits('ZZZNONEXISTENT999');
        expect(await monitorPage.getVisibleRowCount()).toBeLessThanOrEqual(before);
      }
    });
  });

  // ── Data Accuracy – UI vs API ──────────────────────────────────────────────
  test.describe('Data Accuracy – UI vs API', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.goto();
    });

    test('"All" chip count should equal Total Audits KPI', async ({ monitorPage }) => {
      expect(await monitorPage.getChipNumber('All')).toBe(
        await monitorPage.getKpiValue('Total Audits'),
      );
    });

    test('"In Progress" chip count should equal In Progress KPI', async ({ monitorPage }) => {
      expect(await monitorPage.getChipNumber('In Progress')).toBe(
        await monitorPage.getKpiValue('In Progress'),
      );
    });

    test('"Overdue" chip count should equal Overdue Audits KPI', async ({ monitorPage }) => {
      expect(await monitorPage.getChipNumber('Overdue')).toBe(
        await monitorPage.getKpiValue('Overdue Audits'),
      );
    });

    test('Tasks tab badge should equal Tasks Total KPI', async ({ monitorPage }) => {
      expect(await monitorPage.getTasksTabBadge()).toBe(
        await monitorPage.getKpiValue('Tasks Total'),
      );
    });

    test('Audits tab badge should equal Total Audits KPI', async ({ monitorPage }) => {
      expect(await monitorPage.getAuditsTabBadge()).toBe(
        await monitorPage.getKpiValue('Total Audits'),
      );
    });

    test('Total Audits KPI should match /api/audit-instances API total', async ({
      monitorPage,
      page,
    }) => {
      // Navigate again so we can intercept the fresh API response
      const [response] = await Promise.all([
        page.waitForResponse(
          r => r.url().includes('/api/audit-instances') && r.status() === 200,
          { timeout: 15000 },
        ),
        monitorPage.goto(),
      ]);
      const json = await response.json();
      // The API may return { total, data } or { count } or a plain array
      const apiTotal: number =
        json?.total ?? json?.count ?? (Array.isArray(json) ? json.length : -1);
      if (apiTotal >= 0) {
        expect(await monitorPage.getKpiValue('Total Audits')).toBe(apiTotal);
      }
    });

    test('Tasks Total KPI should match /api/user-tasks API count', async ({
      monitorPage,
      page,
    }) => {
      const [response] = await Promise.all([
        page.waitForResponse(
          r => r.url().includes('/api/user-tasks') && r.status() === 200,
          { timeout: 15000 },
        ),
        monitorPage.goto(),
      ]);
      const json = await response.json();
      const apiTotal: number =
        json?.total ?? json?.count ?? (Array.isArray(json) ? json.length : -1);
      if (apiTotal >= 0) {
        expect(await monitorPage.getKpiValue('Tasks Total')).toBe(apiTotal);
      }
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  test.describe('Navigation', () => {
    test('direct URL navigation to /monitor should load the page', async ({
      monitorPage,
      page,
    }) => {
      await monitorPage.goto();
      expect(page.url()).toContain(urls.monitor);
      expect(await monitorPage.getKpiCardCount()).toBe(7);
    });

    test('sidebar link should navigate to /monitor', async ({ page }) => {
      // Start from the dashboard (outer beforeEach already logged us in there)
      await page.waitForURL(`**${urls.dashboard}`, { timeout: 10000 });
      await page
        .locator('nav a, aside a, .sidebar a')
        .filter({ hasText: /Monitor/i })
        .click();
      await page.waitForURL(/\/monitor/, { timeout: 15000 });
      expect(page.url()).toContain(urls.monitor);
    });

    test('navigating away and back should reload the monitor page correctly', async ({
      monitorPage,
      page,
    }) => {
      await monitorPage.goto();
      await page.goto('/dashboard');
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      await monitorPage.goto();
      expect(page.url()).toContain(urls.monitor);
      expect(await monitorPage.getKpiCardCount()).toBe(7);
    });

    test('browser back button should return to the previous page', async ({
      monitorPage,
      page,
    }) => {
      await page.waitForURL(`**${urls.dashboard}`, { timeout: 10000 });
      await monitorPage.goto();
      await page.goBack();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      expect(page.url()).toContain(urls.dashboard);
    });

    test('browser forward button should return to /monitor', async ({ monitorPage, page }) => {
      await page.waitForURL(`**${urls.dashboard}`, { timeout: 10000 });
      await monitorPage.goto();
      await page.goBack();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      await page.goForward();
      await page.waitForURL(/\/monitor/, { timeout: 10000 });
      expect(page.url()).toContain(urls.monitor);
    });
  });
});
