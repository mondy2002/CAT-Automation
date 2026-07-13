import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  getByLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }
}
