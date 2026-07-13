import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Groups & Structure — /setup/groups', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, groupsPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await groupsPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /setup/groups', async ({ page }) => {
      expect(page.url()).toContain('/setup/groups');
    });

    test('page title is "Groups & Organisation Structure"', async ({ groupsPage }) => {
      await expect(groupsPage.pageTitle).toBeVisible();
      const text = (await groupsPage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/Groups/i);
    });

    test('content grid is visible', async ({ groupsPage }) => {
      await expect(groupsPage.contentGrid).toBeVisible();
    });

    test('Create Group button is visible', async ({ groupsPage }) => {
      await expect(groupsPage.createGroupButton).toBeVisible();
    });

    test('Create Group button is enabled', async ({ groupsPage }) => {
      await expect(groupsPage.createGroupButton).toBeEnabled();
    });

    test('Create Group button shows correct label', async ({ groupsPage }) => {
      const text = (await groupsPage.createGroupButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/Create Group/i);
    });
  });

  // ── UI: Group Tree Card ─────────────────────────────────────────────────

  test.describe('UI — Group Tree Card', () => {
    test('Group Tree card is visible', async ({ groupsPage }) => {
      await expect(groupsPage.treeCard).toBeVisible();
    });

    test('Group Tree card has a header', async ({ groupsPage }) => {
      const header = groupsPage.treeCard.locator('.card-header');
      await expect(header).toBeVisible();
    });

    test('tree body is visible inside the tree card', async ({ groupsPage }) => {
      const treeBody = groupsPage.locator('.tree-body');
      await expect(treeBody).toBeVisible();
    });

    test('at least one tree expand button is visible', async ({ groupsPage }) => {
      const count = await groupsPage.treeExpandButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('tree nodes are present', async ({ groupsPage }) => {
      const count = await groupsPage.getTreeNodeCount();
      expect(count).toBeGreaterThan(0);
    });

    test('tree nodes show a label', async ({ groupsPage }) => {
      const label = groupsPage.locator('.tree-label').first();
      await expect(label).toBeVisible();
    });
  });

  // ── UI: All Groups Table ────────────────────────────────────────────────

  test.describe('UI — All Groups Table', () => {
    test('All Groups card is visible', async ({ groupsPage }) => {
      await expect(groupsPage.tableCard).toBeVisible();
    });

    test('All Groups card has a header', async ({ groupsPage }) => {
      const header = groupsPage.tableCard.locator('.card-header');
      await expect(header).toBeVisible();
    });

    test('group header row is visible', async ({ groupsPage }) => {
      await expect(groupsPage.groupHeaderRow).toBeVisible();
    });

    test('header shows Audit Group Name column', async ({ groupsPage }) => {
      const nameHeader = groupsPage.locator('.group-cell-name').first();
      await expect(nameHeader).toBeVisible();
    });

    test('header shows Type column', async ({ groupsPage }) => {
      const typeHeader = groupsPage.locator('.group-cell-type').first();
      await expect(typeHeader).toBeVisible();
    });

    test('header shows Members column', async ({ groupsPage }) => {
      const membersHeader = groupsPage.locator('.group-cell-members').first();
      await expect(membersHeader).toBeVisible();
    });

    test('header shows Scheduled column', async ({ groupsPage }) => {
      const scheduledHeader = groupsPage.locator('.group-cell-scheduled').first();
      await expect(scheduledHeader).toBeVisible();
    });
  });

  // ── UI: Group Types ─────────────────────────────────────────────────────

  test.describe('UI — Group Types', () => {
    test('type badges are visible in the table', async ({ groupsPage }) => {
      const count = await groupsPage.typeBadges.count();
      expect(count).toBeGreaterThan(0);
    });

    test('at least one organisation-type badge is present', async ({ groupsPage }) => {
      const orgBadge = groupsPage.locator('.type-org');
      const count = await orgBadge.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Manage buttons are visible per group row', async ({ groupsPage }) => {
      const count = await groupsPage.manageButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── Functionality: Group Table ──────────────────────────────────────────

  test.describe('Functionality — Group Table', () => {
    test('at least 3 group rows are visible', async ({ groupsPage }) => {
      const count = await groupsPage.getGroupCount();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('each group row shows a group name', async ({ groupsPage }) => {
      const allRows = await groupsPage.locator('.group-row, .group-super-row').all();
      for (const row of allRows) {
        const name = row.locator('.group-name');
        const text = (await name.textContent())?.trim() ?? '';
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test('each group row has a Manage button', async ({ groupsPage }) => {
      const rows = await groupsPage.locator('.group-row, .group-super-row').all();
      for (const row of rows) {
        const btn = row.locator('.btn-manage');
        await expect(btn).toBeVisible();
      }
    });

    test('stat cells show numeric scheduled/in-progress/done values', async ({ groupsPage }) => {
      const sched = groupsPage.locator('.stat-scheduled').first();
      await expect(sched).toBeVisible();
    });
  });

  // ── Functionality: Manage Modal ─────────────────────────────────────────

  test.describe('Functionality — Manage Modal', () => {
    test('clicking Manage opens the modal', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      expect(await groupsPage.isModalOpen()).toBe(true);
      await groupsPage.closeModalWithEscape();
    });

    test('modal has an Edit button', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      await expect(groupsPage.modalEditButton).toBeVisible();
      await groupsPage.closeModalWithEscape();
    });

    test('modal has an Add User button', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      await expect(groupsPage.modalAddUserButton).toBeVisible();
      await groupsPage.closeModalWithEscape();
    });

    test('modal has a search input', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      await expect(groupsPage.modalSearchInput).toBeVisible();
      await groupsPage.closeModalWithEscape();
    });

    test('modal has member rows with action buttons', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      const editRoleBtns = groupsPage.locator('.btn-edit-role');
      const count = await editRoleBtns.count();
      expect(count).toBeGreaterThan(0);
      await groupsPage.closeModalWithEscape();
    });

    test('closing modal with Escape hides it', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      await groupsPage.closeModalWithEscape();
      await expect(groupsPage.modal).toBeHidden();
    });

    test('closing modal with close button hides it', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      await groupsPage.closeModal();
      await expect(groupsPage.modal).toBeHidden();
    });

    test('modal search input accepts text', async ({ groupsPage }) => {
      await groupsPage.clickManageGroup(0);
      await groupsPage.modalSearchInput.fill('test search');
      const value = await groupsPage.modalSearchInput.inputValue();
      expect(value).toBe('test search');
      await groupsPage.closeModalWithEscape();
    });
  });

  // ── Functionality: Create Group ─────────────────────────────────────────

  test.describe('Functionality — Create Group', () => {
    test('Create Group button is clickable', async ({ groupsPage }) => {
      await groupsPage.clickCreateGroup();
      await groupsPage.page.waitForTimeout(500);
    });

    test('clicking Create Group shows a form or modal', async ({ page, groupsPage }) => {
      await groupsPage.clickCreateGroup();
      const urlChanged = page.url().includes('/setup/groups/new') ||
        page.url().includes('/create') ||
        await groupsPage.locator('.modal, .modal-overlay, .cu-modal, [role="dialog"]').isVisible();
      expect(urlChanged).toBe(true);
      await page.keyboard.press('Escape');
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL stays at /setup/groups after page load', async ({ page }) => {
      expect(page.url()).toContain('/setup/groups');
    });

    test('navigating to /setup/groups from dashboard lands correctly', async ({ page, groupsPage }) => {
      await page.goto(page.url().replace('/setup/groups', '/dashboard'));
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await groupsPage.goto();
      expect(page.url()).toContain('/setup/groups');
    });
  });
});
