import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReviewQueuePage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly kpiRow: Locator;
  readonly kpiCards: Locator;
  readonly searchInput: Locator;
  readonly fromDatePicker: Locator;
  readonly toDatePicker: Locator;
  readonly tabBar: Locator;
  readonly tabButtons: Locator;
  readonly awaitingTab: Locator;
  readonly approvedTab: Locator;
  readonly returnedTab: Locator;
  readonly reviewTable: Locator;
  readonly tableHeaders: Locator;
  readonly emptyRow: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.kpiRow = this.locator('.rq-kpi-row');
    this.kpiCards = this.locator('.rq-kpi-card');
    this.searchInput = this.locator('.filter-input');
    this.fromDatePicker = this.locator('.dp-trigger').nth(0);
    this.toDatePicker = this.locator('.dp-trigger').nth(1);
    this.tabBar = this.locator('.tab-bar');
    this.tabButtons = this.locator('.tab-btn');
    this.awaitingTab = this.locator('.tab-btn').nth(0);
    this.approvedTab = this.locator('.tab-btn').nth(1);
    this.returnedTab = this.locator('.tab-btn').nth(2);
    this.reviewTable = this.locator('.review-table');
    this.tableHeaders = this.locator('.review-table th');
    this.emptyRow = this.locator('.empty-row');
  }

  async goto(): Promise<void> {
    await this.navigate('/audits/review/queue');
    await this.kpiRow.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getKpiValue(label: string): Promise<string> {
    const cards = await this.kpiCards.all();
    for (const card of cards) {
      const labelText = (await card.locator('.rq-kpi-label').textContent())?.trim() ?? '';
      if (labelText.toLowerCase().includes(label.toLowerCase())) {
        return (await card.locator('.rq-kpi-value').textContent())?.trim() ?? '';
      }
    }
    return '';
  }

  async clickTab(tab: 'awaiting' | 'approved' | 'returned'): Promise<void> {
    const map = { awaiting: this.awaitingTab, approved: this.approvedTab, returned: this.returnedTab };
    await map[tab].click();
    await this.page.waitForTimeout(500);
  }

  async getActiveTabText(): Promise<string> {
    return (await this.locator('.tab-btn.active').textContent())?.trim() ?? '';
  }

  async searchAudits(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async isTableEmpty(): Promise<boolean> {
    return this.emptyRow.isVisible();
  }

  async getTableHeaderTexts(): Promise<string[]> {
    const count = await this.tableHeaders.count();
    const headers: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (await this.tableHeaders.nth(i).textContent())?.trim() ?? '';
      if (t) headers.push(t);
    }
    return headers;
  }

  async getReviewTableRowCount(): Promise<number> {
    return this.locator('.review-table tbody tr:not(.empty-row)').count();
  }
}
