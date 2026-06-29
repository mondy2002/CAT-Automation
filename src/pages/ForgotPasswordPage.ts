import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly submitButton: Locator;
  private readonly fieldError: Locator;
  private readonly successAlert: Locator;
  private readonly backLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.locator('#email');
    this.submitButton = this.locator('button.sign-in-btn[type="submit"]');
    this.fieldError = this.locator('.field-error');
    this.successAlert = this.locator('.alert.alert-success');
    this.backLink = this.locator('a.back-link');
  }

  async goto(): Promise<void> {
    await this.navigate('/auth/forgot-password');
    await this.waitForPageLoad();
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async clearEmail(): Promise<void> {
    await this.emailInput.clear();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  async isSubmitEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled();
  }

  async getFieldError(): Promise<string> {
    await this.fieldError.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.fieldError.textContent())?.trim() ?? '';
  }

  async isFieldErrorVisible(): Promise<boolean> {
    await this.fieldError.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return this.fieldError.isVisible();
  }

  async waitForSuccessMessage(): Promise<void> {
    await this.successAlert.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getSuccessMessage(): Promise<string> {
    await this.waitForSuccessMessage();
    return (await this.successAlert.textContent())?.trim() ?? '';
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    await this.successAlert.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    return this.successAlert.isVisible();
  }

  async clickBackToLogin(): Promise<void> {
    await this.backLink.click();
  }

  async getEmailInputPlaceholder(): Promise<string | null> {
    return this.emailInput.getAttribute('placeholder');
  }

  async isEmailInputVisible(): Promise<boolean> {
    return this.emailInput.isVisible();
  }
}
