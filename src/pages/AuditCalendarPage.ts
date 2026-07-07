import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuditCalendarPage extends BasePage {
  // ── Page ──────────────────────────────────────────────────────────────────
  readonly calendarContainer: Locator;
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;

  // ── Header navigation ─────────────────────────────────────────────────────
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly todayButton: Locator;
  readonly monthSelector: Locator;
  readonly yearSelector: Locator;

  // ── Calendar grid ─────────────────────────────────────────────────────────
  readonly weekdayRow: Locator;
  readonly weekdayCells: Locator;
  readonly daysGrid: Locator;
  readonly dayCells: Locator;
  readonly todayCell: Locator;
  readonly otherMonthCells: Locator;
  readonly entryCells: Locator;

  // ── Audit entry items ─────────────────────────────────────────────────────
  readonly entryPills: Locator;
  readonly morePills: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly filterButtons: Locator;
  readonly groupsFilter: Locator;
  readonly auditorFilter: Locator;
  readonly statusFilter: Locator;
  readonly overdueToggle: Locator;

  // ── Actions ───────────────────────────────────────────────────────────────
  readonly newAuditButton: Locator;

  constructor(page: Page) {
    super(page);

    this.calendarContainer = this.locator('.calendar');
    this.pageTitle = this.locator('h1.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');

    // chevron_left / chevron_right are Material icon text nodes inside the buttons
    this.prevMonthButton = this.locator('.btn-nav').filter({ hasText: 'chevron_left' });
    this.nextMonthButton = this.locator('.btn-nav').filter({ hasText: 'chevron_right' });
    this.todayButton = this.locator('.btn-today');
    this.monthSelector = this.locator('.cd-trigger:not(.cd-trigger--filter)').first();
    this.yearSelector = this.locator('.cd-trigger:not(.cd-trigger--filter)').last();

    // Grid
    this.weekdayRow = this.locator('.weekday-row');
    this.weekdayCells = this.locator('.weekday-cell');
    this.daysGrid = this.locator('.days-grid');
    this.dayCells = this.locator('.day-cell');
    this.todayCell = this.locator('.day-cell.today');
    this.otherMonthCells = this.locator('.day-cell.other-month');
    this.entryCells = this.locator('.day-cell.has-entries');

    // Audit entries
    this.entryPills = this.locator('.entry-pill');
    this.morePills = this.locator('.more-pill');

    // Filters: .cd-trigger--filter buttons (Groups, Auditor, Status, Schedule Audit)
    this.filterButtons = this.locator('.cd-trigger--filter');
    this.groupsFilter = this.locator('.cd-trigger--filter').nth(0);
    this.auditorFilter = this.locator('.cd-trigger--filter').nth(1);
    this.statusFilter = this.locator('.cd-trigger--filter').nth(2);
    this.overdueToggle = this.locator('.btn-overdue');

    this.newAuditButton = this.locator('.btn-new');
  }

  async goto(): Promise<void> {
    await this.navigate('/audits/calendar');
    await this.calendarContainer.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.textContent())?.trim() ?? '';
  }

  async getMonthText(): Promise<string> {
    return (await this.monthSelector.textContent()) ?? '';
  }

  async getYearText(): Promise<string> {
    return (await this.yearSelector.textContent()) ?? '';
  }

  async getSubtitleText(): Promise<string> {
    return (await this.pageSubtitle.textContent())?.trim() ?? '';
  }

  // Returns true when the calendar grid is showing the month that contains today.
  // Reliable indicator because .day-cell.today is ONLY present in the current month.
  async isViewingCurrentMonth(): Promise<boolean> {
    return (await this.todayCell.count()) > 0;
  }

  async getWeekdayTexts(): Promise<string[]> {
    const count = await this.weekdayCells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await this.weekdayCells.nth(i).textContent())?.trim() ?? '';
      texts.push(text);
    }
    return texts;
  }

  async getDayCellCount(): Promise<number> {
    return this.dayCells.count();
  }

  async getWeekdayCellCount(): Promise<number> {
    return this.weekdayCells.count();
  }

  async getTodayCellCount(): Promise<number> {
    return this.todayCell.count();
  }

  async getEntryCellCount(): Promise<number> {
    return this.entryCells.count();
  }

  async getEntryPillCount(): Promise<number> {
    return this.entryPills.count();
  }

  async getMorePillCount(): Promise<number> {
    return this.morePills.count();
  }

  async getFilterButtonCount(): Promise<number> {
    return this.filterButtons.count();
  }

  async getTodayDayNumber(): Promise<string> {
    return (await this.todayCell.locator('.day-num-inner').textContent())?.trim() ?? '';
  }

  async getFirstEntryPillText(): Promise<string> {
    return (await this.entryPills.first().locator('.entry-name').textContent())?.trim() ?? '';
  }

  async clickPrevMonth(): Promise<void> {
    await this.prevMonthButton.click();
    await this.page.waitForTimeout(600);
  }

  async clickNextMonth(): Promise<void> {
    await this.nextMonthButton.click();
    await this.page.waitForTimeout(600);
  }

  async clickToday(): Promise<void> {
    await this.todayButton.click();
    await this.page.waitForTimeout(600);
  }

  async clickFirstEntryPill(): Promise<void> {
    await this.entryPills.first().click();
    await this.page.waitForTimeout(500);
  }

  async clickOverdueToggle(): Promise<void> {
    await this.overdueToggle.click();
    await this.page.waitForTimeout(600);
  }

  async clickGroupsFilter(): Promise<void> {
    await this.groupsFilter.click();
    await this.page.waitForTimeout(500);
  }

  async clickStatusFilter(): Promise<void> {
    await this.statusFilter.click();
    await this.page.waitForTimeout(500);
  }

  async clickNewAudit(): Promise<void> {
    await this.newAuditButton.click();
  }
}
