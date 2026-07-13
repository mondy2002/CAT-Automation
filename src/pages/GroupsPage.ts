import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class GroupsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly createGroupButton: Locator;
  readonly contentGrid: Locator;
  readonly treeCard: Locator;
  readonly tableCard: Locator;
  readonly treeNodes: Locator;
  readonly treeExpandButtons: Locator;
  readonly groupRows: Locator;
  readonly groupSuperRows: Locator;
  readonly manageButtons: Locator;
  readonly groupHeaderRow: Locator;
  readonly typeBadges: Locator;
  // Manage modal
  readonly modal: Locator;
  readonly modalCloseButton: Locator;
  readonly modalEditButton: Locator;
  readonly modalAddUserButton: Locator;
  readonly modalSearchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.createGroupButton = this.locator('.btn-create');
    this.contentGrid = this.locator('.content-grid');
    this.treeCard = this.locator('.tree-card');
    this.tableCard = this.locator('.table-card');
    this.treeNodes = this.locator('.tree-node');
    this.treeExpandButtons = this.locator('.tree-expand-btn');
    this.groupRows = this.locator('.group-row');
    this.groupSuperRows = this.locator('.group-super-row');
    this.manageButtons = this.locator('.btn-manage');
    this.groupHeaderRow = this.locator('.group-header-row');
    this.typeBadges = this.locator('.type-badge');
    this.modal = this.locator('.modal');
    this.modalCloseButton = this.locator('.modal .btn-icon');
    this.modalEditButton = this.locator('.modal .btn-outline.btn-sm').first();
    this.modalAddUserButton = this.locator('.modal .btn-outline.btn-sm').nth(1);
    this.modalSearchInput = this.locator('.modal input[placeholder="Search by name or email…"]');
  }

  async goto(): Promise<void> {
    await this.navigate('/setup/groups');
    await this.contentGrid.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getGroupCount(): Promise<number> {
    const rows = await this.groupRows.count();
    const superRows = await this.groupSuperRows.count();
    return rows + superRows;
  }

  async getTreeNodeCount(): Promise<number> {
    return this.treeNodes.count();
  }

  async clickCreateGroup(): Promise<void> {
    await this.createGroupButton.click();
    await this.page.waitForTimeout(800);
  }

  async clickManageGroup(index: number): Promise<void> {
    await this.manageButtons.nth(index).click();
    await this.modal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isModalOpen(): Promise<boolean> {
    return this.modal.isVisible();
  }

  async closeModal(): Promise<void> {
    await this.modalCloseButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async closeModalWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(400);
  }
}
