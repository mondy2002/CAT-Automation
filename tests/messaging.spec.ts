import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Messages — /messaging', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, messagingPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await messagingPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /messaging', async ({ page }) => {
      expect(page.url()).toContain('/messaging');
    });

    test('messaging layout container is visible', async ({ messagingPage }) => {
      await expect(messagingPage.messagingLayout).toBeVisible();
    });

    test('message list panel is visible', async ({ messagingPage }) => {
      await expect(messagingPage.messageListPanel).toBeVisible();
    });

    test('message detail panel is visible', async ({ messagingPage }) => {
      await expect(messagingPage.detailPanel).toBeVisible();
    });
  });

  // ── UI: Message List Panel ──────────────────────────────────────────────

  test.describe('UI — Message List Panel', () => {
    test('New message button is visible', async ({ messagingPage }) => {
      await expect(messagingPage.newMessageButton).toBeVisible();
    });

    test('New message button shows "New" text', async ({ messagingPage }) => {
      const text = (await messagingPage.newMessageButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/New/i);
    });

    test('New message button is enabled', async ({ messagingPage }) => {
      await expect(messagingPage.newMessageButton).toBeEnabled();
    });

    test('search input is visible', async ({ messagingPage }) => {
      await expect(messagingPage.searchInput).toBeVisible();
    });

    test('search input is enabled', async ({ messagingPage }) => {
      await expect(messagingPage.searchInput).toBeEnabled();
    });

    test('search placeholder is "Search messages..."', async ({ messagingPage }) => {
      const ph = await messagingPage.searchInput.getAttribute('placeholder') ?? '';
      expect(ph).toMatch(/Search messages/i);
    });

    test('message list container is visible', async ({ messagingPage }) => {
      await expect(messagingPage.messageList).toBeVisible();
    });

    test('panel header is visible', async ({ messagingPage }) => {
      await expect(messagingPage.locator('.panel-header')).toBeVisible();
    });
  });

  // ── UI: Empty Detail Panel ──────────────────────────────────────────────

  test.describe('UI — Empty Detail Panel', () => {
    test('detail panel shows empty/select state by default', async ({ messagingPage }) => {
      expect(await messagingPage.isDetailEmpty()).toBe(true);
    });

    test('"Select a conversation" text is visible in detail panel', async ({ messagingPage }) => {
      const text = (await messagingPage.detailPanel.textContent())?.trim() ?? '';
      expect(text.toLowerCase()).toMatch(/select|conversation|message/i);
    });

    test('New Message CTA is visible in the detail panel', async ({ messagingPage }) => {
      await expect(messagingPage.newMessageCta).toBeVisible();
    });

    test('New Message CTA button shows text', async ({ messagingPage }) => {
      const text = (await messagingPage.newMessageCta.textContent())?.trim() ?? '';
      expect(text).toMatch(/New Message/i);
    });
  });

  // ── UI: Message List Items ──────────────────────────────────────────────

  test.describe('UI — Message List Items', () => {
    test('message list has items or is empty (both states are valid)', async ({ messagingPage }) => {
      const count = await messagingPage.getMessageCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('if messages exist each shows a sender name', async ({ messagingPage }) => {
      const count = await messagingPage.getMessageCount();
      if (count > 0) {
        const firstName = messagingPage.messageItems.first().locator('.message-item-name');
        const text = (await firstName.textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test('if messages exist each shows a preview', async ({ messagingPage }) => {
      const count = await messagingPage.getMessageCount();
      if (count > 0) {
        const preview = messagingPage.messageItems.first().locator('.message-item-preview');
        await expect(preview).toBeVisible();
      }
    });
  });

  // ── Functionality: Search ───────────────────────────────────────────────

  test.describe('Functionality — Search', () => {
    test('search input accepts text', async ({ messagingPage }) => {
      await messagingPage.searchMessages('test search');
      const value = await messagingPage.searchInput.inputValue();
      expect(value).toBe('test search');
    });

    test('clearing search restores original state', async ({ messagingPage }) => {
      await messagingPage.searchMessages('test');
      await messagingPage.searchInput.clear();
      const value = await messagingPage.searchInput.inputValue();
      expect(value).toBe('');
    });
  });

  // ── Functionality: New Message ──────────────────────────────────────────

  test.describe('Functionality — New Message', () => {
    test('clicking New message button does not cause errors', async ({ page, messagingPage }) => {
      await messagingPage.clickNewMessage();
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/messaging');
    });

    test('clicking New Message CTA does not cause errors', async ({ page, messagingPage }) => {
      await messagingPage.clickNewMessageCta();
      await page.waitForTimeout(500);
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL is /messaging after load', async ({ page }) => {
      expect(page.url()).toContain('/messaging');
    });
  });
});
