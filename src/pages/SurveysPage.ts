import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SurveysPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly newSurveyScheduleButton: Locator;
  readonly statCards: Locator;
  readonly tabBar: Locator;
  readonly surveysTab: Locator;
  readonly schedulesTab: Locator;
  readonly resultsTab: Locator;
  readonly surveyTable: Locator;
  readonly surveyTableHeaders: Locator;
  readonly surveyRows: Locator;
  readonly scheduleButtons: Locator;
  // Schedule modal
  readonly scheduleModal: Locator;
  readonly scheduleModalClose: Locator;
  readonly scheduleModalCancel: Locator;
  readonly scheduleModalSubmit: Locator;
  readonly scheduleNameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.newSurveyScheduleButton = this.locator('.btn-primary');
    this.statCards = this.locator('.stat-cards');
    this.tabBar = this.locator('.tab-bar');
    this.surveysTab = this.locator('.tab-btn').nth(0);
    this.schedulesTab = this.locator('.tab-btn').nth(1);
    this.resultsTab = this.locator('.tab-btn').nth(2);
    this.surveyTable = this.locator('.data-table');
    this.surveyTableHeaders = this.locator('.data-table th');
    this.surveyRows = this.locator('.data-table tbody tr');
    this.scheduleButtons = this.locator('.btn-schedule');
    this.scheduleModal = this.locator('.modal-overlay');
    this.scheduleModalClose = this.locator('.modal-close');
    this.scheduleModalCancel = this.locator('.btn-cancel');
    this.scheduleModalSubmit = this.locator('.modal-overlay .btn-primary');
    this.scheduleNameInput = this.locator('input[placeholder="e.g. Q2 Staff Survey 2026"]');
  }

  async goto(): Promise<void> {
    await this.navigate('/survey');
    await this.statCards.waitFor({ state: 'visible', timeout: 15000 });
    await this.surveyTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.surveyTableHeaders.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }

  async getStatValue(label: string): Promise<string> {
    const cards = await this.locator('.stat-card').all();
    for (const card of cards) {
      const labelText = (await card.locator('.stat-label').textContent())?.trim() ?? '';
      if (labelText.toLowerCase().includes(label.toLowerCase())) {
        return (await card.locator('.stat-value').textContent())?.trim() ?? '';
      }
    }
    return '';
  }

  async clickTab(tab: 'surveys' | 'schedules' | 'results'): Promise<void> {
    const map = { surveys: this.surveysTab, schedules: this.schedulesTab, results: this.resultsTab };
    await map[tab].click();
    await this.page.waitForTimeout(500);
  }

  async getActiveTabText(): Promise<string> {
    return (await this.locator('.tab-btn.active').textContent())?.trim() ?? '';
  }

  async getSurveyCount(): Promise<number> {
    return this.surveyRows.count();
  }

  async getTableHeaderTexts(): Promise<string[]> {
    const count = await this.surveyTableHeaders.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (await this.surveyTableHeaders.nth(i).textContent())?.trim() ?? '';
      if (t) texts.push(t);
    }
    return texts;
  }

  async clickNewSurveySchedule(): Promise<void> {
    await this.newSurveyScheduleButton.click();
    await this.scheduleModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isSurveyScheduleModalOpen(): Promise<boolean> {
    return this.scheduleModal.isVisible();
  }

  async closeSurveyScheduleModal(): Promise<void> {
    await this.scheduleModalClose.click();
    await this.page.waitForTimeout(400);
  }

  async cancelSurveyScheduleModal(): Promise<void> {
    await this.scheduleModalCancel.click();
    await this.page.waitForTimeout(400);
  }

  async fillScheduleName(name: string): Promise<void> {
    await this.scheduleNameInput.fill(name);
  }

  async clickScheduleButton(index: number): Promise<void> {
    await this.scheduleButtons.nth(index).click();
    await this.scheduleModal.waitFor({ state: 'visible', timeout: 5000 });
  }
}
