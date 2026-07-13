import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class QuickAuditStartPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly statsRow: Locator;
  readonly statCards: Locator;
  readonly tableCard: Locator;
  readonly searchInput: Locator;
  readonly auditTable: Locator;
  readonly auditRows: Locator;
  readonly startButtons: Locator;
  readonly favButtons: Locator;
  readonly categoryFilter: Locator;
  readonly typeFilter: Locator;
  readonly statusFilter: Locator;
  readonly sortFilter: Locator;
  // Start modal
  readonly startModal: Locator;
  readonly modalCloseBtn: Locator;
  readonly modalCancelBtn: Locator;
  readonly modalQuickAuditBtn: Locator;
  readonly reviewerInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.statsRow = this.locator('.stats-row');
    this.statCards = this.locator('.stat-card');
    this.tableCard = this.locator('.table-card');
    this.searchInput = this.locator('.search-input');
    this.auditTable = this.locator('.audit-table');
    this.auditRows = this.locator('.audit-row');
    this.startButtons = this.locator('.inline-action-btn--green');
    this.favButtons = this.locator('.fav-btn');
    this.categoryFilter = this.locator('.cdd-trigger').nth(0);
    this.typeFilter = this.locator('.cdd-trigger').nth(1);
    this.statusFilter = this.locator('.cdd-trigger').nth(2);
    this.sortFilter = this.locator('.cdd-trigger').nth(3);
    this.startModal = this.locator('.modal-overlay');
    this.modalCloseBtn = this.locator('.modal-overlay .close-btn');
    this.modalCancelBtn = this.locator('.modal-overlay .btn-secondary');
    this.modalQuickAuditBtn = this.locator('.modal-overlay .btn').filter({ hasText: 'Quick Audit' });
    this.reviewerInput = this.locator('input[formcontrolname="reviewerUserId"]');
  }

  async goto(): Promise<void> {
    await this.navigate('/audits/start');
    await this.auditTable.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getStatValue(label: string): Promise<string> {
    const cards = await this.statCards.all();
    for (const card of cards) {
      const labelText = (await card.locator('.stat-label').textContent())?.trim() ?? '';
      if (labelText.toLowerCase().includes(label.toLowerCase())) {
        return (await card.locator('.stat-number').textContent())?.trim() ?? '';
      }
    }
    return '';
  }

  async getAuditCount(): Promise<number> {
    return this.auditRows.count();
  }

  async searchAudits(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async clickStart(index: number): Promise<void> {
    await this.startButtons.nth(index).click();
    await this.startModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isStartModalOpen(): Promise<boolean> {
    return this.startModal.isVisible();
  }

  async closeStartModal(): Promise<void> {
    await this.modalCloseBtn.click();
    await this.page.waitForTimeout(400);
  }

  async cancelStartModal(): Promise<void> {
    await this.modalCancelBtn.click();
    await this.page.waitForTimeout(400);
  }

  async toggleFavourite(index: number): Promise<void> {
    await this.favButtons.nth(index).click();
    await this.page.waitForTimeout(300);
  }
}
