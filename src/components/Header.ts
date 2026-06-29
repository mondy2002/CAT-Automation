import { Page, Locator } from '@playwright/test';

export class Header {
  private readonly page: Page;
  private readonly logo: Locator;
  private readonly navLinks: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('header .logo');
    this.navLinks = page.locator('header nav a');
    this.searchInput = page.getByRole('searchbox');
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  async getNavLinkCount(): Promise<number> {
    return this.navLinks.count();
  }

  async clickNavLink(name: string): Promise<void> {
    await this.navLinks.filter({ hasText: name }).click();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async isLogoVisible(): Promise<boolean> {
    return this.logo.isVisible();
  }
}
