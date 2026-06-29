import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MonitorPage extends BasePage {
  private readonly kpiCards: Locator;
  private readonly monChips: Locator;
  private readonly completedChip: Locator;

  constructor(page: Page) {
    super(page);
    this.kpiCards = this.locator('.kpi-card');
    this.monChips = this.locator('.mon-chips');
    // "Completed 30d" is the green chip inside the chip toolbar
    this.completedChip = this.monChips.locator('button').filter({ hasText: /Completed/ });
  }

  async goto(): Promise<void> {
    await this.navigate('/monitor');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.kpiCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await this.monChips.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getKpiValue(label: string): Promise<number> {
    const card = this.kpiCards.filter({ hasText: label });
    const text = (await card.locator('.kpi-num').textContent())?.trim() ?? '0';
    return parseInt(text, 10);
  }

  // Reads the "Completed N" chip and returns the number
  async getCompletedCount(): Promise<number> {
    await this.completedChip.waitFor({ state: 'visible', timeout: 15000 });
    const text = (await this.completedChip.textContent())?.trim() ?? '';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
}
