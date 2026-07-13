import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InitialAuditSetupPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly pageWrap: Locator;
  readonly statChips: Locator;
  readonly tealStatChip: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly searchInput: Locator;
  readonly enableAllBar: Locator;
  readonly enableAllToggle: Locator;
  readonly activeBadge: Locator;
  readonly categoriesList: Locator;
  readonly categoryCards: Locator;
  readonly categoryExpandButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.pageWrap = this.locator('.page-wrap');
    this.statChips = this.locator('.stat-chip');
    this.tealStatChip = this.locator('.stat-chip--teal');
    this.saveButton = this.locator('.btn-primary').first();
    this.cancelButton = this.locator('.btn-ghost').first();
    this.searchInput = this.locator('.search-input');
    this.enableAllBar = this.locator('.enable-all-bar');
    this.enableAllToggle = this.locator('.enable-all-bar .toggle');
    this.activeBadge = this.locator('.active-badge');
    this.categoriesList = this.locator('.categories-list');
    this.categoryCards = this.locator('.category-card');
    this.categoryExpandButtons = this.locator('.cat-expand-btn');
  }

  async goto(): Promise<void> {
    await this.navigate('/setup/initial-audit-setup');
    await this.categoriesList.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getStatChipCount(): Promise<number> {
    return this.statChips.count();
  }

  async getStatChipText(index: number): Promise<string> {
    return (await this.statChips.nth(index).textContent())?.trim() ?? '';
  }

  async getCategoryCount(): Promise<number> {
    return this.categoryCards.count();
  }

  async searchAudits(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async clickCategory(index: number): Promise<void> {
    await this.categoryExpandButtons.nth(index).click();
    await this.page.waitForTimeout(400);
  }

  async isCategoryActive(index: number): Promise<boolean> {
    const cls = (await this.categoryCards.nth(index).getAttribute('class')) ?? '';
    return cls.includes('card-active');
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(600);
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForTimeout(500);
  }

  async getAuditRowsInCategory(categoryIndex: number): Promise<Locator> {
    return this.categoryCards.nth(categoryIndex).locator('.audit-row');
  }
}
