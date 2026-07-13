import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class QuestionOrderPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly container: Locator;
  readonly selectorSection: Locator;
  readonly selectorCards: Locator;
  readonly categoryCard: Locator;
  readonly auditCard: Locator;
  readonly categoryTrigger: Locator;
  readonly auditTrigger: Locator;
  readonly idleHint: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.container = this.locator('.page-container');
    this.selectorSection = this.locator('.selector-section');
    this.selectorCards = this.locator('.sel-card');
    this.categoryCard = this.locator('.sel-card').nth(0);
    this.auditCard = this.locator('.sel-card').nth(1);
    this.categoryTrigger = this.locator('.sel-card').nth(0).locator('.sel-trigger');
    this.auditTrigger = this.locator('.sel-card').nth(1).locator('.sel-trigger');
    this.idleHint = this.locator('.idle-hint');
  }

  async goto(): Promise<void> {
    await this.navigate('/setup/question-order');
    await this.selectorSection.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getSelectorCardCount(): Promise<number> {
    return this.selectorCards.count();
  }

  async isCategoryCardActive(): Promise<boolean> {
    const cls = (await this.categoryCard.getAttribute('class')) ?? '';
    return !cls.includes('sel-card--disabled');
  }

  async isAuditCardDisabled(): Promise<boolean> {
    const cls = (await this.auditCard.getAttribute('class')) ?? '';
    return cls.includes('sel-card--disabled') || cls.includes('disabled');
  }

  async clickCategoryCard(): Promise<void> {
    await this.categoryTrigger.click();
    await this.page.waitForTimeout(500);
  }

  async clickAuditCard(): Promise<void> {
    await this.auditTrigger.click();
    await this.page.waitForTimeout(500);
  }

  async selectFirstCategory(): Promise<boolean> {
    try {
      await this.categoryTrigger.click();
      await this.page.waitForTimeout(400);
      // Skip the placeholder option (sel-option--placeholder) and pick the first real option
      const option = this.locator('.sel-option:not(.sel-option--placeholder)').first();
      const visible = await option.isVisible({ timeout: 2000 }).catch(() => false);
      if (visible) {
        await option.click();
        await this.page.waitForTimeout(500);
        return true;
      }
      await this.page.keyboard.press('Escape');
      return false;
    } catch {
      return false;
    }
  }

  async getCategoryPlaceholderText(): Promise<string> {
    const ph = this.categoryCard.locator('.sel-placeholder');
    const val = this.categoryCard.locator('.sel-value');
    try {
      const phText = (await ph.textContent({ timeout: 1000 }))?.trim() ?? '';
      if (phText) return phText;
    } catch {}
    try {
      return (await val.textContent({ timeout: 1000 }))?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async getAuditPlaceholderText(): Promise<string> {
    const ph = this.auditCard.locator('.sel-placeholder');
    const val = this.auditCard.locator('.sel-value');
    try {
      const phText = (await ph.textContent({ timeout: 1000 }))?.trim() ?? '';
      if (phText) return phText;
    } catch {}
    try {
      return (await val.textContent({ timeout: 1000 }))?.trim() ?? '';
    } catch {
      return '';
    }
  }
}
