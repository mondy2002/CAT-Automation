import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly errorAlert: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly rememberMeLabel: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly passwordToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.locator('#email');
    this.passwordInput = this.locator('#password');
    this.signInButton = this.locator('button.sign-in-btn[type="submit"]');
    this.errorAlert = this.locator('.login-alert');
    this.rememberMeCheckbox = this.locator('input.remember-check');
    this.rememberMeLabel = this.locator('label.remember-row');
    this.forgotPasswordLink = this.locator('a.forgot-link');
    this.passwordToggle = this.locator('button.eye-btn');
  }

  async goto(): Promise<void> {
    await this.navigate('/auth/login');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorAlert.waitFor({ state: 'visible', timeout: 10000 });
    return (await this.errorAlert.textContent())?.trim() ?? '';
  }

  async isErrorVisible(): Promise<boolean> {
    // Wait for the error to appear after the API responds
    await this.errorAlert.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return this.errorAlert.isVisible();
  }

  async checkRememberMe(): Promise<void> {
    // The native checkbox is CSS-hidden; click the visible label to toggle
    await this.rememberMeLabel.click();
  }

  async isRememberMeChecked(): Promise<boolean> {
    return this.rememberMeCheckbox.isChecked();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.scrollIntoViewIfNeeded();
    await this.forgotPasswordLink.click();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }

  async getPasswordInputType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type');
  }
}
