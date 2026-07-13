import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SchedulingPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly emptyCard: Locator;
  readonly newScheduleButton: Locator;
  readonly pageActions: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.emptyCard = this.locator('.card');
    this.newScheduleButton = this.locator('.btn.btn-primary');
    this.pageActions = this.locator('.pg-actions');
  }

  async goto(): Promise<void> {
    await this.navigate('/scheduling');
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15000 });
  }

  async isEmptyState(): Promise<boolean> {
    return this.emptyCard.filter({ hasText: 'No schedules' }).isVisible();
  }

  async getPageTitle(): Promise<string> {
    return (await this.pageTitle.textContent())?.trim() ?? '';
  }

  async clickNewSchedule(): Promise<void> {
    await this.newScheduleButton.click();
    await this.page.waitForTimeout(500);
  }
}
