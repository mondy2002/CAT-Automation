import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MessagingPage extends BasePage {
  readonly messagingPage: Locator;
  readonly messagingLayout: Locator;
  readonly messageListPanel: Locator;
  readonly newMessageButton: Locator;
  readonly searchInput: Locator;
  readonly messageList: Locator;
  readonly messageItems: Locator;
  readonly detailPanel: Locator;
  readonly emptyDetail: Locator;
  readonly newMessageCta: Locator;

  constructor(page: Page) {
    super(page);
    this.messagingPage = this.locator('.messaging-page');
    this.messagingLayout = this.locator('.messaging-layout');
    this.messageListPanel = this.locator('.message-list-panel');
    this.newMessageButton = this.locator('.btn-new');
    this.searchInput = this.locator('.search-input');
    this.messageList = this.locator('.message-list');
    this.messageItems = this.locator('.message-item');
    this.detailPanel = this.locator('.message-detail-panel');
    this.emptyDetail = this.locator('.detail-empty');
    this.newMessageCta = this.locator('.btn-new-cta');
  }

  async goto(): Promise<void> {
    await this.navigate('/messaging');
    await this.messagingLayout.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getMessageCount(): Promise<number> {
    return this.messageItems.count();
  }

  async clickNewMessage(): Promise<void> {
    await this.newMessageButton.click();
    await this.page.waitForTimeout(600);
  }

  async clickNewMessageCta(): Promise<void> {
    await this.newMessageCta.click();
    await this.page.waitForTimeout(600);
  }

  async searchMessages(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500);
  }

  async isDetailEmpty(): Promise<boolean> {
    return this.emptyDetail.isVisible();
  }
}
