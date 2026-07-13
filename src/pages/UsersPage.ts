import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class UsersPage extends BasePage {
  readonly pageTitle: Locator;
  readonly createUserButton: Locator;
  readonly kpiRow: Locator;
  readonly kpiCards: Locator;
  readonly userList: Locator;
  readonly userRows: Locator;
  readonly filterSearchInput: Locator;
  readonly roleFilter: Locator;
  readonly statusFilter: Locator;
  readonly groupFilter: Locator;
  readonly userCount: Locator;
  readonly paginationText: Locator;
  // Add user modal
  readonly addUserModal: Locator;
  readonly modalCloseButton: Locator;
  readonly modalCancelButton: Locator;
  readonly modalSubmitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.createUserButton = this.locator('.btn-create');
    this.kpiRow = this.locator('.su-kpi-row');
    this.kpiCards = this.locator('.su-kpi-card');
    this.userList = this.locator('.ul-list');
    this.userRows = this.locator('.ul-row');
    this.filterSearchInput = this.locator('.fb-search-input');
    this.roleFilter = this.locator('.cdd-trigger').nth(0);
    this.statusFilter = this.locator('.cdd-trigger').nth(1);
    this.groupFilter = this.locator('.cdd-trigger').nth(2);
    this.userCount = this.locator('.fb-count');
    this.paginationText = this.locator('.pagination-text');
    this.addUserModal = this.locator('.cu-modal');
    this.modalCloseButton = this.locator('.cu-close');
    this.modalCancelButton = this.locator('.cu-btn-cancel');
    this.modalSubmitButton = this.locator('.cu-btn-submit');
  }

  async goto(): Promise<void> {
    await this.navigate('/setup/users');
    await this.userList.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getKpiValue(label: string): Promise<string> {
    const cards = await this.kpiCards.all();
    for (const card of cards) {
      const labelText = (await card.locator('.su-kpi-label').textContent())?.trim() ?? '';
      if (labelText.toLowerCase().includes(label.toLowerCase())) {
        return (await card.locator('.su-kpi-value').textContent())?.trim() ?? '';
      }
    }
    return '';
  }

  async getUserCount(): Promise<number> {
    return this.userRows.count();
  }

  async getFirstUserEmail(): Promise<string> {
    return (await this.userRows.first().locator('.ul-email').textContent())?.trim() ?? '';
  }

  async clickCreateUser(): Promise<void> {
    await this.createUserButton.click();
    await this.addUserModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isAddUserModalOpen(): Promise<boolean> {
    return this.addUserModal.isVisible();
  }

  async closeAddUserModal(): Promise<void> {
    await this.modalCloseButton.click();
    await this.page.waitForTimeout(400);
  }

  async cancelAddUserModal(): Promise<void> {
    await this.modalCancelButton.click();
    await this.page.waitForTimeout(400);
  }

  async fillAddUserForm(first: string, last: string, email: string, jobTitle: string): Promise<void> {
    await this.addUserModal.locator('input[placeholder="e.g. John"]').fill(first);
    await this.addUserModal.locator('input[placeholder="e.g. Smith"]').fill(last);
    await this.addUserModal.locator('input[type="email"]').fill(email);
    await this.addUserModal.locator('input[placeholder="e.g. Care Manager"]').fill(jobTitle);
  }

  async searchUsers(term: string): Promise<void> {
    await this.filterSearchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async clickUserDetails(index: number): Promise<void> {
    await this.userRows.nth(index).locator('.ul-act-info').click();
    await this.page.waitForTimeout(500);
  }

  async clickUserReset(index: number): Promise<void> {
    await this.userRows.nth(index).locator('.ul-act-key').click();
    await this.page.waitForTimeout(500);
  }

  async clickUserDeactivate(index: number): Promise<void> {
    await this.userRows.nth(index).locator('.ul-act-danger').click();
    await this.page.waitForTimeout(500);
  }
}
