import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SchedulingWizardPage extends BasePage {
  readonly wizardPage: Locator;
  readonly wizardBody: Locator;
  readonly wizardSidebar: Locator;
  readonly quickScheduleBtn: Locator;
  readonly stepItems: Locator;
  readonly activeStep: Locator;
  readonly auditTrigger: Locator;
  readonly groupSelect: Locator;
  readonly scheduleNameInput: Locator;
  readonly datePicker: Locator;
  readonly sharedAuditToggle: Locator;
  readonly sharedAuditCard: Locator;
  readonly backButton: Locator;
  readonly continueButton: Locator;
  readonly rightPanel: Locator;

  constructor(page: Page) {
    super(page);
    this.wizardPage = this.locator('.wizard-page');
    this.wizardBody = this.locator('.wizard-body');
    this.wizardSidebar = this.locator('.wizard-sidebar');
    this.quickScheduleBtn = this.locator('.quick-schedule-btn');
    this.stepItems = this.locator('.step-item');
    this.activeStep = this.locator('.step-item.active');
    this.auditTrigger = this.locator('.audit-trigger');
    this.groupSelect = this.locator('.custom-select-trigger');
    this.scheduleNameInput = this.locator('input[formcontrolname="name"]');
    this.datePicker = this.locator('.dp-trigger');
    this.sharedAuditToggle = this.locator('input[formcontrolname="sharedAudit"]');
    this.sharedAuditCard = this.locator('.toggle-card');
    this.backButton = this.locator('.btn.btn-back');
    this.continueButton = this.locator('.btn.btn-continue');
    this.rightPanel = this.locator('.wizard-right-panel');
  }

  async goto(): Promise<void> {
    await this.navigate('/scheduling/wizard');
    await this.wizardPage.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getActiveStepTitle(): Promise<string> {
    return (await this.activeStep.locator('.step-title').textContent())?.trim() ?? '';
  }

  async getActiveStepNumber(): Promise<string> {
    return (await this.activeStep.locator('.step-circle').textContent())?.trim() ?? '';
  }

  async getStepCount(): Promise<number> {
    return this.stepItems.count();
  }

  async isStepActive(stepNumber: number): Promise<boolean> {
    const cls = (await this.stepItems.nth(stepNumber - 1).getAttribute('class')) ?? '';
    return cls.includes('active');
  }

  async clickQuickSchedule(): Promise<void> {
    await this.quickScheduleBtn.click();
    await this.page.waitForTimeout(500);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
    await this.page.waitForTimeout(600);
  }

  async clickBack(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForTimeout(500);
  }

  async selectAudit(): Promise<void> {
    await this.auditTrigger.click();
    await this.page.waitForTimeout(500);
  }

  async fillScheduleName(name: string): Promise<void> {
    await this.scheduleNameInput.fill(name);
  }
}
