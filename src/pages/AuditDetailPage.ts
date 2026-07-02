import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuditDetailPage extends BasePage {
  readonly backButton: Locator;
  readonly closeButton: Locator;
  readonly allQuestionsButton: Locator;
  readonly yesButton: Locator;
  readonly noButton: Locator;
  readonly naButton: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly questionSidebarItems: Locator;

  constructor(page: Page) {
    super(page);
    this.backButton = this.locator('.top-btn.back');
    this.closeButton = this.locator('.top-btn.close-btn');
    this.allQuestionsButton = this.locator('.top-btn').filter({ hasText: /All Questions/ });
    this.yesButton = this.locator('.ans-btn.yes');
    this.noButton = this.locator('.ans-btn.no');
    this.naButton = this.locator('.ans-btn.na');
    // .nav-btn is reused by header icon buttons — narrow to the Prev/Next nav pair
    this.prevButton = this.locator('.nav-btn').filter({ hasText: /Prev/ }).first();
    this.nextButton = this.locator('.nav-btn.next');
    this.questionSidebarItems = this.locator('.sidebar-q');
  }

  async waitForLoad(): Promise<void> {
    await this.yesButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  isOnAuditDetailPage(): boolean {
    return this.page.url().includes('/audits/');
  }

  getAuditIdFromUrl(): string {
    const match = this.page.url().match(/\/audits\/(\d+)/);
    return match?.[1] ?? '';
  }

  async clickYes(): Promise<void> {
    await this.yesButton.click();
    await this.page.waitForTimeout(400);
  }

  async clickNo(): Promise<void> {
    await this.noButton.click();
    await this.page.waitForTimeout(400);
  }

  async clickNA(): Promise<void> {
    await this.naButton.click();
    await this.page.waitForTimeout(400);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickPrev(): Promise<void> {
    await this.prevButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickAllQuestions(): Promise<void> {
    await this.allQuestionsButton.click();
    await this.page.waitForTimeout(500);
  }

  // The .top-btn.back element is a breadcrumb showing the audit title, not a navigation link.
  // Use closeAndReturnToMonitor() or this alias to navigate back to /monitor.
  async goBackToMonitor(): Promise<void> {
    await this.closeButton.click();
    await this.page.waitForURL(/\/monitor/, { timeout: 15000 });
  }

  async closeAndReturnToMonitor(): Promise<void> {
    await this.closeButton.click();
    await this.page.waitForURL(/\/monitor/, { timeout: 15000 });
  }

  async getBackBreadcrumbText(): Promise<string> {
    return (await this.backButton.textContent())?.trim() ?? '';
  }

  async getQuestionSidebarCount(): Promise<number> {
    return this.questionSidebarItems.count();
  }

  // Returns true if the answer button has an active/selected visual state
  async isAnswerActive(answer: 'yes' | 'no' | 'na'): Promise<boolean> {
    const btn = answer === 'yes' ? this.yesButton
      : answer === 'no' ? this.noButton
      : this.naButton;
    const cls = (await btn.getAttribute('class')) ?? '';
    return cls.includes('active') || cls.includes('selected') || cls.includes('checked');
  }
}
