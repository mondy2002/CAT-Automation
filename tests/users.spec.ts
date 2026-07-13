import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('User Management — /setup/users', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, usersPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await usersPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /setup/users', async ({ page }) => {
      expect(page.url()).toContain('/setup/users');
    });

    test('page title is "User Management"', async ({ usersPage }) => {
      const text = (await usersPage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/User Management/i);
    });

    test('KPI row is visible', async ({ usersPage }) => {
      await expect(usersPage.kpiRow).toBeVisible();
    });

    test('user list is visible', async ({ usersPage }) => {
      await expect(usersPage.userList).toBeVisible();
    });

    test('filter bar is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.filter-bar')).toBeVisible();
    });

    test('Add User button is visible', async ({ usersPage }) => {
      await expect(usersPage.createUserButton).toBeVisible();
    });

    test('Add User button shows correct label', async ({ usersPage }) => {
      const text = (await usersPage.createUserButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/Add User/i);
    });
  });

  // ── UI: KPI Cards ───────────────────────────────────────────────────────

  test.describe('UI — KPI Cards', () => {
    test('4 KPI cards are present', async ({ usersPage }) => {
      const count = await usersPage.kpiCards.count();
      expect(count).toBe(4);
    });

    test('Total Users KPI card is visible (blue)', async ({ usersPage }) => {
      await expect(usersPage.locator('.su-kpi-card--blue')).toBeVisible();
    });

    test('Active KPI card is visible (green)', async ({ usersPage }) => {
      await expect(usersPage.locator('.su-kpi-card--green')).toBeVisible();
    });

    test('Pending Invitation KPI card is visible (amber)', async ({ usersPage }) => {
      await expect(usersPage.locator('.su-kpi-card--amber')).toBeVisible();
    });

    test('Inactive KPI card is visible (red)', async ({ usersPage }) => {
      await expect(usersPage.locator('.su-kpi-card--red')).toBeVisible();
    });

    test('Total Users shows a positive integer', async ({ usersPage }) => {
      const value = await usersPage.getKpiValue('Total Users');
      expect(parseInt(value, 10)).toBeGreaterThan(0);
    });

    test('Active users count <= Total Users', async ({ usersPage }) => {
      const total = parseInt(await usersPage.getKpiValue('Total Users'), 10);
      const active = parseInt(await usersPage.getKpiValue('Active'), 10);
      expect(active).toBeLessThanOrEqual(total);
    });

    test('each KPI card shows a numeric value', async ({ usersPage }) => {
      const cards = await usersPage.kpiCards.all();
      for (const card of cards) {
        const value = (await card.locator('.su-kpi-value').textContent())?.trim() ?? '';
        expect(value).toMatch(/^\d+$/);
      }
    });

    test('each KPI card has a label', async ({ usersPage }) => {
      const cards = await usersPage.kpiCards.all();
      for (const card of cards) {
        const label = (await card.locator('.su-kpi-label').textContent())?.trim() ?? '';
        expect(label.length).toBeGreaterThan(0);
      }
    });
  });

  // ── UI: User List Header ────────────────────────────────────────────────

  test.describe('UI — User List Header', () => {
    test('User column header is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.ul-hcol-user')).toBeVisible();
    });

    test('Role column header is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.ul-hcol-role')).toBeVisible();
    });

    test('Groups column header is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.ul-hcol-groups')).toBeVisible();
    });

    test('Status column header is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.ul-hcol-status')).toBeVisible();
    });

    test('Login column header is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.ul-hcol-login')).toBeVisible();
    });

    test('Actions column header is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.ul-hcol-actions')).toBeVisible();
    });
  });

  // ── UI: User Rows ───────────────────────────────────────────────────────

  test.describe('UI — User Rows', () => {
    test('at least one user row is present', async ({ usersPage }) => {
      const count = await usersPage.getUserCount();
      expect(count).toBeGreaterThan(0);
    });

    test('first user row shows a full name', async ({ usersPage }) => {
      const name = usersPage.userRows.first().locator('.ul-fullname');
      const text = (await name.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('first user row shows an email', async ({ usersPage }) => {
      const email = await usersPage.getFirstUserEmail();
      expect(email.length).toBeGreaterThan(0);
      expect(email).toContain('@');
    });

    test('first user row shows a role badge', async ({ usersPage }) => {
      const roleBadge = usersPage.userRows.first().locator('.ul-role-badge');
      await expect(roleBadge).toBeVisible();
    });

    test('first user row shows a status badge', async ({ usersPage }) => {
      const status = usersPage.userRows.first().locator('.ul-status');
      await expect(status).toBeVisible();
    });

    test('first user row has Details action button', async ({ usersPage }) => {
      const detailsBtn = usersPage.userRows.first().locator('.ul-act-info');
      await expect(detailsBtn).toBeVisible();
    });

    test('first user row has Reset action button', async ({ usersPage }) => {
      const resetBtn = usersPage.userRows.first().locator('.ul-act-key');
      await expect(resetBtn).toBeVisible();
    });

    test('first user row has a user avatar or initials badge', async ({ usersPage }) => {
      const avatar = usersPage.userRows.first().locator('.ul-avatar');
      await expect(avatar).toBeVisible();
    });

    test('first user row shows group chip(s)', async ({ usersPage }) => {
      const chips = usersPage.userRows.first().locator('.ul-group-chip');
      const count = await chips.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── UI: Filter Bar ──────────────────────────────────────────────────────

  test.describe('UI — Filter Bar', () => {
    test('search input is visible and enabled', async ({ usersPage }) => {
      await expect(usersPage.filterSearchInput).toBeVisible();
      await expect(usersPage.filterSearchInput).toBeEnabled();
    });

    test('Role filter dropdown is visible', async ({ usersPage }) => {
      await expect(usersPage.roleFilter).toBeVisible();
    });

    test('Status filter dropdown is visible', async ({ usersPage }) => {
      await expect(usersPage.statusFilter).toBeVisible();
    });

    test('Group filter dropdown is visible', async ({ usersPage }) => {
      await expect(usersPage.groupFilter).toBeVisible();
    });

    test('Role filter shows "All Roles" label', async ({ usersPage }) => {
      const text = (await usersPage.roleFilter.textContent())?.trim() ?? '';
      expect(text).toMatch(/All Roles/i);
    });
  });

  // ── Functionality: Search ───────────────────────────────────────────────

  test.describe('Functionality — Search', () => {
    test('search input accepts text', async ({ usersPage }) => {
      await usersPage.searchUsers('test');
      const value = await usersPage.filterSearchInput.inputValue();
      expect(value).toBe('test');
    });

    test('searching for a known user email returns results', async ({ usersPage }) => {
      const email = await usersPage.getFirstUserEmail();
      const localPart = email.split('@')[0];
      await usersPage.searchUsers(localPart);
      await usersPage.page.waitForTimeout(600);
      const count = await usersPage.getUserCount();
      expect(count).toBeGreaterThan(0);
    });

    test('searching for a non-existent string shows fewer or no users', async ({ usersPage }) => {
      const originalCount = await usersPage.getUserCount();
      await usersPage.searchUsers('xyznonexistent12345');
      await usersPage.page.waitForTimeout(600);
      const filteredCount = await usersPage.getUserCount();
      expect(filteredCount).toBeLessThanOrEqual(originalCount);
    });
  });

  // ── Functionality: Add User Modal ───────────────────────────────────────

  test.describe('Functionality — Add User Modal', () => {
    test('clicking Add User opens the modal', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      expect(await usersPage.isAddUserModalOpen()).toBe(true);
      await usersPage.cancelAddUserModal();
    });

    test('modal has First Name field', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      const input = usersPage.addUserModal.locator('input[placeholder="e.g. John"]');
      await expect(input).toBeVisible();
      await usersPage.cancelAddUserModal();
    });

    test('modal has Surname field', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      const input = usersPage.addUserModal.locator('input[placeholder="e.g. Smith"]');
      await expect(input).toBeVisible();
      await usersPage.cancelAddUserModal();
    });

    test('modal has Email field', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      const input = usersPage.addUserModal.locator('input[type="email"]');
      await expect(input).toBeVisible();
      await usersPage.cancelAddUserModal();
    });

    test('modal has Job Title field', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      const input = usersPage.addUserModal.locator('input[placeholder="e.g. Care Manager"]');
      await expect(input).toBeVisible();
      await usersPage.cancelAddUserModal();
    });

    test('modal has role radio buttons', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      const radios = usersPage.addUserModal.locator('input[type="radio"]');
      const count = await radios.count();
      expect(count).toBeGreaterThanOrEqual(2);
      await usersPage.cancelAddUserModal();
    });

    test('modal has group checkboxes', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      const checkboxes = usersPage.addUserModal.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);
      await usersPage.cancelAddUserModal();
    });

    test('modal has Create User submit button', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      await expect(usersPage.modalSubmitButton).toBeVisible();
      const text = (await usersPage.modalSubmitButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/Create User/i);
      await usersPage.cancelAddUserModal();
    });

    test('modal has Cancel button', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      await expect(usersPage.modalCancelButton).toBeVisible();
      await usersPage.cancelAddUserModal();
    });

    test('modal has close (×) button', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      await expect(usersPage.modalCloseButton).toBeVisible();
      await usersPage.closeAddUserModal();
    });

    test('pressing Escape closes the modal', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      await usersPage.page.keyboard.press('Escape');
      await usersPage.page.waitForTimeout(400);
      const isOpen = await usersPage.addUserModal.isVisible();
      expect(isOpen).toBe(false);
    });

    test('cancelling closes the modal', async ({ usersPage }) => {
      await usersPage.clickCreateUser();
      await usersPage.cancelAddUserModal();
      const isOpen = await usersPage.addUserModal.isVisible();
      expect(isOpen).toBe(false);
    });
  });

  // ── Functionality: Pagination ───────────────────────────────────────────

  test.describe('Functionality — Pagination', () => {
    test('pagination controls are visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.pagination-controls')).toBeVisible();
    });

    test('pagination text shows user count info', async ({ usersPage }) => {
      const text = (await usersPage.paginationText.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('page size selector is visible', async ({ usersPage }) => {
      await expect(usersPage.locator('.size-trigger')).toBeVisible();
    });
  });
});
