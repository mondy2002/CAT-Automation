import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MonitorPage extends BasePage {
  readonly kpiCards: Locator;
  readonly tabs: Locator;
  readonly auditsTab: Locator;
  readonly tasksTab: Locator;
  readonly monChips: Locator;
  readonly searchInput: Locator;
  readonly filterButtons: Locator;
  readonly auditListHeader: Locator;
  readonly auditRows: Locator;

  private readonly completedChip: Locator;

  constructor(page: Page) {
    super(page);
    this.kpiCards = this.locator('.kpi-card');
    this.tabs = this.locator('.table-card .tab');
    this.auditsTab = this.locator('.table-card .tab').filter({ hasText: /Audits/ });
    this.tasksTab = this.locator('.table-card .tab').filter({ hasText: /Tasks/ });
    this.monChips = this.locator('.mon-chips');
    this.searchInput = this.locator('input.mon-search-input-inline');
    this.filterButtons = this.locator('.mon-filter-btn');
    this.auditListHeader = this.locator('.al-header');
    this.auditRows = this.locator('.al-row');
    // Kept for backward-compat — dashboard.spec.ts calls getCompletedCount()
    this.completedChip = this.monChips.locator('.chip').filter({ hasText: /Completed/ });
  }

  async goto(): Promise<void> {
    await this.navigate('/monitor');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.kpiCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await this.monChips.waitFor({ state: 'visible', timeout: 15000 });
    await this.auditListHeader.waitFor({ state: 'visible', timeout: 15000 });
  }

  // ── KPI Cards ──────────────────────────────────────────────────────────────

  async getKpiCardCount(): Promise<number> {
    return this.kpiCards.count();
  }

  async getKpiValue(label: string): Promise<number> {
    const card = this.kpiCards.filter({ hasText: label });
    const text = (await card.locator('.kpi-num').textContent())?.trim() ?? '0';
    return parseInt(text.replace(/,/g, ''), 10);
  }

  async getKpiNum(index: number): Promise<number> {
    const text = (await this.kpiCards.nth(index).locator('.kpi-num').textContent())?.trim() ?? '0';
    return parseInt(text.replace(/,/g, ''), 10);
  }

  async getKpiLabel(index: number): Promise<string> {
    return (await this.kpiCards.nth(index).locator('.kpi-label').textContent())?.trim() ?? '';
  }

  // ── Chips ──────────────────────────────────────────────────────────────────

  async getChipCount(): Promise<number> {
    return this.monChips.locator('.chip').count();
  }

  async getActiveChipText(): Promise<string> {
    return (await this.monChips.locator('.chip.active').first().textContent())?.trim() ?? '';
  }

  async isChipActive(label: string): Promise<boolean> {
    const chip = this.monChips.locator('.chip').filter({ hasText: new RegExp(label) }).first();
    const classes = (await chip.getAttribute('class')) ?? '';
    return classes.includes('active');
  }

  async clickChip(label: string): Promise<void> {
    await this.monChips.locator('.chip').filter({ hasText: new RegExp(label) }).first().click();
    await this.page.waitForTimeout(500);
  }

  async getChipNumber(label: string): Promise<number> {
    const chip = this.monChips.locator('.chip').filter({ hasText: new RegExp(label) }).first();
    const text = (await chip.textContent())?.trim() ?? '';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // Used by dashboard.spec.ts cross-page tests
  async getCompletedCount(): Promise<number> {
    await this.completedChip.waitFor({ state: 'visible', timeout: 15000 });
    const text = (await this.completedChip.textContent())?.trim() ?? '';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────

  async getTabCount(): Promise<number> {
    return this.tabs.count();
  }

  async isAuditsTabActive(): Promise<boolean> {
    const classes = (await this.auditsTab.getAttribute('class')) ?? '';
    return classes.includes('active');
  }

  async isTasksTabActive(): Promise<boolean> {
    const classes = (await this.tasksTab.getAttribute('class')) ?? '';
    return classes.includes('active');
  }

  async clickTab(name: string): Promise<void> {
    await this.tabs.filter({ hasText: new RegExp(name) }).click();
    await this.page.waitForTimeout(500);
  }

  async getAuditsTabBadge(): Promise<number> {
    const text = (await this.auditsTab.locator('.tab-badge').textContent())?.trim() ?? '0';
    return parseInt(text.replace(/,/g, ''), 10);
  }

  async getTasksTabBadge(): Promise<number> {
    const text = (await this.tasksTab.locator('.tab-badge').textContent())?.trim() ?? '0';
    return parseInt(text.replace(/,/g, ''), 10);
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  async searchAudits(query: string): Promise<void> {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  async getSearchValue(): Promise<string> {
    return this.searchInput.inputValue();
  }

  async getSearchPlaceholder(): Promise<string> {
    return (await this.searchInput.getAttribute('placeholder')) ?? '';
  }

  // ── Filter Buttons ─────────────────────────────────────────────────────────

  async getFilterButtonCount(): Promise<number> {
    return this.filterButtons.count();
  }

  async clickFilterButton(label: string): Promise<void> {
    // Case-sensitive: avoids "group_work Type" matching the label "Group"
    await this.filterButtons.filter({ hasText: new RegExp(label) }).first().click();
    await this.page.waitForTimeout(400);
  }

  // ── Audit List ─────────────────────────────────────────────────────────────

  async getVisibleRowCount(): Promise<number> {
    return this.auditRows.count();
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = this.auditListHeader.locator('.al-h');
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await headers.nth(i).textContent())?.trim() ?? '';
      if (text) texts.push(text); // skip the empty actions column header
    }
    return texts;
  }

  async getRowAuditName(rowIndex: number): Promise<string> {
    return (await this.auditRows.nth(rowIndex).locator('.al-audit-name').textContent())?.trim() ?? '';
  }

  async getRowStatus(rowIndex: number): Promise<string> {
    return (await this.auditRows.nth(rowIndex).locator('.status-pill').textContent())?.trim() ?? '';
  }

  async getRowDueDate(rowIndex: number): Promise<string> {
    return (await this.auditRows.nth(rowIndex).locator('.al-date').textContent())?.trim() ?? '';
  }

  async getRowGroup(rowIndex: number): Promise<string> {
    return (await this.auditRows.nth(rowIndex).locator('.al-group-tag').textContent())?.trim() ?? '';
  }

  async isViewButtonVisible(rowIndex: number): Promise<boolean> {
    return this.auditRows.nth(rowIndex).locator('.al-primary-btn').isVisible();
  }

  async isOverflowMenuVisible(rowIndex: number): Promise<boolean> {
    return this.auditRows.nth(rowIndex).locator('.al-overflow-btn').isVisible();
  }

  async clickViewButton(rowIndex: number): Promise<void> {
    await this.auditRows.nth(rowIndex).locator('.al-primary-btn').click();
  }

  async clickOverflowMenu(rowIndex: number): Promise<void> {
    await this.auditRows.nth(rowIndex).locator('.al-overflow-btn').click();
    await this.page.waitForTimeout(400);
  }

  async getAllVisibleStatuses(): Promise<string[]> {
    const pills = this.locator('.al-row .status-pill');
    const count = await pills.count();
    const statuses: string[] = [];
    for (let i = 0; i < count; i++) {
      statuses.push((await pills.nth(i).textContent())?.trim() ?? '');
    }
    return statuses;
  }
}
