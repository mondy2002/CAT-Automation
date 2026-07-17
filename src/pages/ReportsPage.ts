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

  // Detail card filter controls
  readonly detailCardControls: Locator;
  readonly detailCardButtons: Locator;
  readonly detailCardDateInputs: Locator;
  readonly detailCardDropdowns: Locator;
  readonly detailCardApplyBtn: Locator;

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

    // Any interactive control inside the detail card
    this.detailCardControls = this.locator('.detail-card input, .detail-card select, .detail-card [class*="dp-"], .detail-card [class*="cdd-"], .detail-card [class*="cs-trigger"]');
    this.detailCardButtons = this.locator('.detail-card button, .detail-card .btn-primary, .detail-card .btn-secondary, .detail-card [class*="btn"]');
    this.detailCardDateInputs = this.locator('.detail-card input[type="date"], .detail-card input[type="text"], .detail-card [class*="dp-trigger"], .detail-card [class*="date"]');
    this.detailCardDropdowns = this.locator('.detail-card [class*="cdd-trigger"], .detail-card [class*="cs-trigger"], .detail-card [class*="sel-dropdown"], .detail-card select');
    this.detailCardApplyBtn = this.locator('.detail-card .btn-primary, .detail-card [class*="btn-apply"], .detail-card [class*="btn-run"]');
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

  async getAllKpiData(): Promise<Array<{ label: string; value: string; colorClass: string }>> {
    const cards = await this.kpiCards.all();
    const result = [];
    for (const card of cards) {
      const label = (await card.locator('.rp-kpi-label').textContent())?.trim() ?? '';
      const value = (await card.locator('.rp-kpi-num').textContent())?.trim() ?? '';
      const cls = (await card.getAttribute('class')) ?? '';
      const colorClass = cls.replace('rp-kpi-card', '').trim();
      result.push({ label, value, colorClass });
    }
    return result;
  }

  async getDetailCardControlCount(): Promise<number> {
    return this.detailCardControls.count();
  }

  async getDetailCardButtonCount(): Promise<number> {
    return this.detailCardButtons.count();
  }

  async clickRunReportAndWait(index: number): Promise<void> {
    await this.runReportButtons.nth(index).scrollIntoViewIfNeeded();
    await this.runReportButtons.nth(index).click();
    await this.page.waitForTimeout(1000);
  }
}
