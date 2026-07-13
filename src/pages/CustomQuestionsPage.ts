import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CustomQuestionsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly questionsTab: Locator;
  readonly customAuditsTab: Locator;
  readonly aiBuilderTab: Locator;
  readonly searchInput: Locator;
  readonly resultCount: Locator;
  readonly addQuestionButton: Locator;
  readonly questionTable: Locator;
  readonly tableHeaders: Locator;
  readonly questionRows: Locator;
  readonly editButtons: Locator;
  readonly deleteButtons: Locator;
  readonly paginationText: Locator;
  // Add/Edit modal
  readonly addQuestionModal: Locator;
  readonly modalClose: Locator;
  readonly questionTextInput: Locator;
  readonly tooltipInput: Locator;
  readonly auditDropdownToggle: Locator;
  readonly docUploadCheckbox: Locator;
  readonly yesResponseInput: Locator;
  readonly noResponseInput: Locator;
  readonly actionTitleInput: Locator;
  readonly aiSuggestButton: Locator;
  readonly createQuestionButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.questionsTab = this.locator('.tab-btn').nth(0);
    this.customAuditsTab = this.locator('.tab-btn').nth(1);
    this.aiBuilderTab = this.locator('.tab-btn--ai');
    this.searchInput = this.locator('.search-input');
    this.resultCount = this.locator('.result-count');
    this.addQuestionButton = this.locator('.btn-primary');
    this.questionTable = this.locator('.data-table');
    this.tableHeaders = this.locator('.data-table th');
    this.questionRows = this.locator('.data-table tbody tr');
    this.editButtons = this.locator('.btn-edit');
    this.deleteButtons = this.locator('.btn-delete');
    this.paginationText = this.locator('.pagination-text');
    this.addQuestionModal = this.locator('.modal-overlay');
    this.modalClose = this.locator('.modal-overlay .btn-icon');
    this.questionTextInput = this.locator('.modal-overlay textarea[formcontrolname="questionText"]');
    this.tooltipInput = this.locator('.modal-overlay input[formcontrolname="prompt"]');
    this.auditDropdownToggle = this.locator('.modal-overlay .audit-dropdown-toggle');
    this.docUploadCheckbox = this.locator('.modal-overlay input[formcontrolname="docUploadRequired"]').first();
    this.yesResponseInput = this.locator('.modal-overlay textarea[formcontrolname="response"]').nth(0);
    this.noResponseInput = this.locator('.modal-overlay textarea[formcontrolname="response"]').nth(1);
    this.actionTitleInput = this.locator('.modal-overlay textarea[formcontrolname="title"]');
    this.aiSuggestButton = this.locator('.btn-suggest');
    this.createQuestionButton = this.locator('.modal-overlay .btn-primary').last();
    this.cancelButton = this.locator('.modal-overlay .btn-secondary');
  }

  async goto(): Promise<void> {
    await this.navigate('/setup/custom-questions');
    await this.locator('.qb-container').waitFor({ state: 'visible', timeout: 15000 });
    await this.locator('.data-table').waitFor({ state: 'visible', timeout: 10000 });
    await this.locator('.data-table th').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickTab(tab: 'questions' | 'customAudits' | 'aiBuilder'): Promise<void> {
    const map = { questions: this.questionsTab, customAudits: this.customAuditsTab, aiBuilder: this.aiBuilderTab };
    await map[tab].click();
    await this.page.waitForTimeout(500);
  }

  async getActiveTabText(): Promise<string> {
    return (await this.locator('.tab-btn.active').textContent())?.trim() ?? '';
  }

  async getQuestionCount(): Promise<number> {
    return this.questionRows.count();
  }

  async searchQuestions(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async clickAddQuestion(): Promise<void> {
    await this.addQuestionButton.click();
    await this.addQuestionModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isAddQuestionModalOpen(): Promise<boolean> {
    return this.addQuestionModal.isVisible();
  }

  async fillQuestionText(text: string): Promise<void> {
    await this.questionTextInput.fill(text);
  }

  async fillTooltip(text: string): Promise<void> {
    await this.tooltipInput.fill(text);
  }

  async closeAddQuestionModal(): Promise<void> {
    await this.modalClose.click();
    await this.page.waitForTimeout(400);
  }

  async cancelAddQuestionModal(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForTimeout(400);
  }

  async clickEditQuestion(index: number): Promise<void> {
    await this.editButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async clickDeleteQuestion(index: number): Promise<void> {
    await this.deleteButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async getTableHeaderTexts(): Promise<string[]> {
    const count = await this.tableHeaders.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (await this.tableHeaders.nth(i).textContent())?.trim() ?? '';
      if (t) texts.push(t);
    }
    return texts;
  }
}
