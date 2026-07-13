import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReportsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly kpiRow: Locator;
  readonly kpiCards: Locator;
  readonly reportsGrid: Locator;
  readonly reportCards: Locator;
  readonly reportTitles: Locator;
  readonly reportDescriptions: Locator;
  readonly runReportButtons: Locator;
  readonly generateCustomButton: Locator;
  readonly detailCard: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.kpiRow = this.locator('.rp-kpi-row');
    this.kpiCards = this.locator('.rp-kpi-card');
    this.reportsGrid = this.locator('.reports-grid-new');
    this.reportCards = this.locator('.rcn-card');
    this.reportTitles = this.locator('.rcn-title');
    this.reportDescriptions = this.locator('.rcn-desc');
    this.runReportButtons = this.locator('.rcn-run');
    this.generateCustomButton = this.locator('.ff-btn-apply');
    this.detailCard = this.locator('.detail-card');
  }

  async goto(): Promise<void> {
    await this.navigate('/reports');
    await this.kpiRow.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getKpiValue(label: string): Promise<string> {
    const cards = await this.kpiCards.all();
    for (const card of cards) {
      const labelText = (await card.locator('.rp-kpi-label').textContent())?.trim() ?? '';
      if (labelText.toLowerCase().includes(label.toLowerCase())) {
        return (await card.locator('.rp-kpi-num').textContent())?.trim() ?? '';
      }
    }
    return '';
  }

  async getKpiCardCount(): Promise<number> {
    return this.kpiCards.count();
  }

  async getReportCardCount(): Promise<number> {
    return this.reportCards.count();
  }

  async getReportTitles(): Promise<string[]> {
    const count = await this.reportTitles.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (await this.reportTitles.nth(i).textContent())?.trim() ?? '';
      if (t) titles.push(t);
    }
    return titles;
  }

  async clickRunReport(index: number): Promise<void> {
    await this.runReportButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async clickGenerateCustom(): Promise<void> {
    await this.generateCustomButton.click();
    await this.page.waitForTimeout(500);
  }
}
