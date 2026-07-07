import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Audit Calendar', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, auditCalendarPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await auditCalendarPage.goto();
  });

  // ── UI: Page structure ─────────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /audits/calendar', async ({ page }) => {
      expect(page.url()).toContain('/audits/calendar');
    });

    test('page title is "Audit Calendar"', async ({ auditCalendarPage }) => {
      const title = await auditCalendarPage.getPageTitleText();
      expect(title).toMatch(/Audit Calendar/i);
    });

    test('calendar container is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.calendarContainer).toBeVisible();
    });

    test('weekday row is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.weekdayRow).toBeVisible();
    });

    test('weekday row shows exactly 7 day headers', async ({ auditCalendarPage }) => {
      const count = await auditCalendarPage.getWeekdayCellCount();
      expect(count).toBe(7);
    });

    test('weekday headers are MON through SUN', async ({ auditCalendarPage }) => {
      const texts = await auditCalendarPage.getWeekdayTexts();
      expect(texts).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
    });

    test('days grid is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.daysGrid).toBeVisible();
    });

    test('days grid shows a week-aligned cell count (35 or 42)', async ({ auditCalendarPage }) => {
      const count = await auditCalendarPage.getDayCellCount();
      expect([35, 42]).toContain(count);
    });

    test('exactly one day cell is marked as today', async ({ auditCalendarPage }) => {
      const count = await auditCalendarPage.getTodayCellCount();
      expect(count).toBe(1);
    });

    test('today cell shows the correct calendar date number', async ({ auditCalendarPage }) => {
      const todayNum = new Date().getDate().toString();
      const displayed = await auditCalendarPage.getTodayDayNumber();
      expect(displayed).toBe(todayNum);
    });

    test('other-month day cells are present (padding for full 5-week grid)', async ({ auditCalendarPage }) => {
      const count = await auditCalendarPage.otherMonthCells.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── UI: Navigation controls ────────────────────────────────────────────────

  test.describe('UI — Navigation Controls', () => {
    test('previous month button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.prevMonthButton).toBeVisible();
    });

    test('next month button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.nextMonthButton).toBeVisible();
    });

    test('Today button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.todayButton).toBeVisible();
    });

    test('month selector is visible and shows current month', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.monthSelector).toBeVisible();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const currentMonth = monthNames[new Date().getMonth()];
      const text = await auditCalendarPage.getMonthText();
      expect(text).toContain(currentMonth);
    });

    test('year selector is visible and shows current year', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.yearSelector).toBeVisible();
      const currentYear = new Date().getFullYear().toString();
      const text = await auditCalendarPage.getYearText();
      expect(text).toContain(currentYear);
    });
  });

  // ── UI: Filter controls ────────────────────────────────────────────────────

  test.describe('UI — Filter Controls', () => {
    test('four filter buttons are present', async ({ auditCalendarPage }) => {
      const count = await auditCalendarPage.getFilterButtonCount();
      expect(count).toBe(4);
    });

    test('Groups filter button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.groupsFilter).toBeVisible();
    });

    test('Groups filter shows "All Groups" label', async ({ auditCalendarPage }) => {
      const text = (await auditCalendarPage.groupsFilter.textContent()) ?? '';
      expect(text).toMatch(/All Groups/i);
    });

    test('Auditor filter button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.auditorFilter).toBeVisible();
    });

    test('Status filter button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.statusFilter).toBeVisible();
    });

    test('Status filter shows "All Statuses" label', async ({ auditCalendarPage }) => {
      const text = (await auditCalendarPage.statusFilter.textContent()) ?? '';
      expect(text).toMatch(/All Statuses/i);
    });

    test('Overdue toggle button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.overdueToggle).toBeVisible();
    });

    test('Overdue toggle shows "Overdue only" label', async ({ auditCalendarPage }) => {
      const text = (await auditCalendarPage.overdueToggle.textContent()) ?? '';
      expect(text).toMatch(/Overdue only/i);
    });

    test('New Audit button is visible', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.newAuditButton).toBeVisible();
    });

    test('New Audit button shows "New Audit" label', async ({ auditCalendarPage }) => {
      const text = (await auditCalendarPage.newAuditButton.textContent()) ?? '';
      expect(text).toMatch(/New Audit/i);
    });
  });

  // ── Functionality: Month navigation ────────────────────────────────────────
  // Note: the .cd-trigger dropdown is a month-picker that does NOT update when using
  // arrow navigation. The reliable indicator that the month changed is .day-cell.today —
  // it only exists in the month that contains today's date.

  test.describe('Functionality — Month Navigation', () => {
    test('clicking next month removes the today marker from the grid', async ({ auditCalendarPage }) => {
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(true);
      await auditCalendarPage.clickNextMonth();
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(false);
    });

    test('clicking prev month removes the today marker from the grid', async ({ auditCalendarPage }) => {
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(true);
      await auditCalendarPage.clickPrevMonth();
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(false);
    });

    test('clicking next then prev returns to the current month', async ({ auditCalendarPage }) => {
      await auditCalendarPage.clickNextMonth();
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(false);
      await auditCalendarPage.clickPrevMonth();
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(true);
    });

    test('clicking Today from a future month restores the current month', async ({ auditCalendarPage }) => {
      await auditCalendarPage.clickNextMonth();
      await auditCalendarPage.clickNextMonth();
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(false);
      await auditCalendarPage.clickToday();
      expect(await auditCalendarPage.isViewingCurrentMonth()).toBe(true);
    });

    test('today cell is visible after clicking the Today button', async ({ auditCalendarPage }) => {
      await auditCalendarPage.clickNextMonth();
      await auditCalendarPage.clickToday();
      await expect(auditCalendarPage.todayCell).toBeVisible();
    });

    test('grid shows a full week-aligned cell count after navigating to next month', async ({ auditCalendarPage }) => {
      await auditCalendarPage.clickNextMonth();
      const count = await auditCalendarPage.getDayCellCount();
      // Month grids are always 5 or 6 complete weeks (35 or 42 cells)
      expect([35, 42]).toContain(count);
    });

    test('URL stays at /audits/calendar during month navigation', async ({ page, auditCalendarPage }) => {
      await auditCalendarPage.clickNextMonth();
      await auditCalendarPage.clickPrevMonth();
      expect(page.url()).toContain('/audits/calendar');
    });
  });

  // ── Functionality: Audit entry display ─────────────────────────────────────

  test.describe('Functionality — Audit Entry Display', () => {
    test('at least one day cell has audit entries', async ({ auditCalendarPage }) => {
      const count = await auditCalendarPage.getEntryCellCount();
      expect(count).toBeGreaterThan(0);
    });

    test('entry pills are visible on days with audits', async ({ auditCalendarPage }) => {
      await expect(auditCalendarPage.entryPills.first()).toBeVisible();
    });

    test('entry pills show a non-empty audit name', async ({ auditCalendarPage }) => {
      const text = await auditCalendarPage.getFirstEntryPillText();
      expect(text.length).toBeGreaterThan(0);
    });

    test('days with entries show an entry count badge', async ({ auditCalendarPage }) => {
      const firstEntryCell = auditCalendarPage.entryCells.first();
      const badge = firstEntryCell.locator('.entry-count-badge');
      await expect(badge).toBeVisible();
    });

    test('entry count badge shows a positive number', async ({ auditCalendarPage }) => {
      const firstEntryCell = auditCalendarPage.entryCells.first();
      const badgeText = (await firstEntryCell.locator('.entry-count-badge').textContent())?.trim() ?? '0';
      expect(parseInt(badgeText, 10)).toBeGreaterThan(0);
    });

    test('entry pills with many audits show a "+N more" overflow pill', async ({ auditCalendarPage }) => {
      const morePillCount = await auditCalendarPage.getMorePillCount();
      expect(morePillCount).toBeGreaterThan(0);
    });

    test('"more" overflow pill text starts with "+"', async ({ auditCalendarPage }) => {
      const morePillCount = await auditCalendarPage.getMorePillCount();
      if (morePillCount > 0) {
        const text = (await auditCalendarPage.morePills.first().textContent())?.trim() ?? '';
        expect(text).toMatch(/^\+\d+/);
      }
    });
  });

  // ── Functionality: Overdue filter ──────────────────────────────────────────

  test.describe('Functionality — Overdue Filter', () => {
    test('clicking overdue toggle reduces or clears the entry count', async ({ auditCalendarPage }) => {
      const countBefore = await auditCalendarPage.getEntryPillCount();
      await auditCalendarPage.clickOverdueToggle();
      const countAfter = await auditCalendarPage.getEntryPillCount();
      expect(countAfter).toBeLessThanOrEqual(countBefore);
    });

    test('clicking overdue toggle twice restores the original entry count', async ({ auditCalendarPage }) => {
      const countOriginal = await auditCalendarPage.getEntryPillCount();
      await auditCalendarPage.clickOverdueToggle();
      await auditCalendarPage.clickOverdueToggle();
      const countRestored = await auditCalendarPage.getEntryPillCount();
      expect(countRestored).toBe(countOriginal);
    });

    test('calendar grid is still visible after toggling overdue filter', async ({ auditCalendarPage }) => {
      await auditCalendarPage.clickOverdueToggle();
      await expect(auditCalendarPage.calendarContainer).toBeVisible();
    });
  });

  // ── Functionality: New Audit navigation ────────────────────────────────────

  test.describe('Functionality — New Audit', () => {
    test('clicking New Audit navigates to the scheduling wizard', async ({ page, auditCalendarPage }) => {
      await auditCalendarPage.clickNewAudit();
      await page.waitForURL(/\/scheduling\/quick/, { timeout: 10000 });
      expect(page.url()).toContain('/scheduling/quick');
    });
  });

  // ── Functionality: Entry pill click ────────────────────────────────────────

  test.describe('Functionality — Entry Pill Interaction', () => {
    test('clicking an entry pill navigates to the audit detail page', async ({ page, auditCalendarPage }) => {
      await auditCalendarPage.clickFirstEntryPill();
      await page.waitForURL(/\/audits\/\d+/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('audit detail page reached from calendar contains the auditId in the URL', async ({ page, auditCalendarPage }) => {
      await auditCalendarPage.clickFirstEntryPill();
      await page.waitForURL(/\/audits\/\d+/, { timeout: 10000 });
      expect(page.url()).toContain('/audits/');
    });
  });
});
