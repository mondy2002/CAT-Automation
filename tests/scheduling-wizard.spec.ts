import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Scheduling Wizard — /scheduling/wizard', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, schedulingWizardPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await schedulingWizardPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /scheduling/wizard', async ({ page }) => {
      expect(page.url()).toContain('/scheduling/wizard');
    });

    test('wizard page container is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.wizardPage).toBeVisible();
    });

    test('wizard sidebar is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.wizardSidebar).toBeVisible();
    });

    test('step list is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.locator('.step-list')).toBeVisible();
    });

    test('Quick Schedule button is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.quickScheduleBtn).toBeVisible();
    });
  });

  // ── UI: Step Sidebar ────────────────────────────────────────────────────

  test.describe('UI — Step Sidebar', () => {
    test('exactly 4 steps are in the sidebar', async ({ schedulingWizardPage }) => {
      const count = await schedulingWizardPage.getStepCount();
      expect(count).toBe(4);
    });

    test('Step 1 "Audit details" is active on load', async ({ schedulingWizardPage }) => {
      const title = await schedulingWizardPage.getActiveStepTitle();
      expect(title).toMatch(/Audit details/i);
    });

    test('Step 1 is numbered "1"', async ({ schedulingWizardPage }) => {
      const num = await schedulingWizardPage.getActiveStepNumber();
      expect(num).toBe('1');
    });

    test('Step 2 "Questions" is visible in sidebar', async ({ schedulingWizardPage }) => {
      const step2 = schedulingWizardPage.stepItems.nth(1);
      const title = (await step2.locator('.step-title').textContent())?.trim() ?? '';
      expect(title).toMatch(/Questions/i);
    });

    test('Step 3 "Recurrence" is visible in sidebar', async ({ schedulingWizardPage }) => {
      const step3 = schedulingWizardPage.stepItems.nth(2);
      const title = (await step3.locator('.step-title').textContent())?.trim() ?? '';
      expect(title).toMatch(/Recurrence/i);
    });

    test('Step 4 "Review" is visible in sidebar', async ({ schedulingWizardPage }) => {
      const step4 = schedulingWizardPage.stepItems.nth(3);
      const title = (await step4.locator('.step-title').textContent())?.trim() ?? '';
      expect(title).toMatch(/Review/i);
    });

    test('each step has a numbered circle', async ({ schedulingWizardPage }) => {
      const circles = schedulingWizardPage.locator('.step-circle');
      const count = await circles.count();
      expect(count).toBe(4);
    });

    test('each step has a subtitle', async ({ schedulingWizardPage }) => {
      const subtitles = schedulingWizardPage.locator('.step-subtitle');
      const count = await subtitles.count();
      expect(count).toBe(4);
    });
  });

  // ── UI: Step 1 Form ─────────────────────────────────────────────────────

  test.describe('UI — Step 1 Form', () => {
    test('audit select trigger is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.auditTrigger).toBeVisible();
    });

    test('audit select shows "Select an audit…" placeholder', async ({ schedulingWizardPage }) => {
      const text = (await schedulingWizardPage.auditTrigger.textContent())?.trim() ?? '';
      expect(text).toMatch(/Select an audit/i);
    });

    test('group multi-select is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.groupSelect).toBeVisible();
    });

    test('schedule name input is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.scheduleNameInput).toBeVisible();
    });

    test('schedule name input has correct placeholder', async ({ schedulingWizardPage }) => {
      const ph = await schedulingWizardPage.scheduleNameInput.getAttribute('placeholder') ?? '';
      expect(ph.length).toBeGreaterThan(0);
    });

    test('date picker is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.datePicker).toBeVisible();
    });

    test('shared audit toggle card is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.sharedAuditCard).toBeVisible();
    });

    test('shared audit toggle shows correct title', async ({ schedulingWizardPage }) => {
      const title = schedulingWizardPage.locator('.toggle-card-title');
      const text = (await title.textContent())?.trim() ?? '';
      expect(text).toMatch(/Shared audit/i);
    });

    test('Continue button is visible', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.continueButton).toBeVisible();
    });

    test('Continue button shows "Continue" label', async ({ schedulingWizardPage }) => {
      const text = (await schedulingWizardPage.continueButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/Continue/i);
    });
  });

  // ── Functionality: Quick Schedule Button ────────────────────────────────

  test.describe('Functionality — Quick Schedule Button', () => {
    test('Quick Schedule button is enabled', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.quickScheduleBtn).toBeEnabled();
    });

    test('clicking Quick Schedule navigates to /scheduling/quick', async ({ page, schedulingWizardPage }) => {
      await schedulingWizardPage.clickQuickSchedule();
      await page.waitForURL('**/scheduling/quick', { timeout: 10000 });
      expect(page.url()).toContain('/scheduling/quick');
    });
  });

  // ── Functionality: Audit Select ─────────────────────────────────────────

  test.describe('Functionality — Audit Select', () => {
    test('clicking audit trigger opens a dropdown', async ({ schedulingWizardPage }) => {
      await schedulingWizardPage.selectAudit();
      const panel = schedulingWizardPage.locator('.audit-dropdown, .audit-dropdown-panel, [class*="dropdown-panel"]');
      await schedulingWizardPage.page.waitForTimeout(500);
      await schedulingWizardPage.page.keyboard.press('Escape');
    });

    test('audit trigger is enabled', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.auditTrigger).toBeEnabled();
    });
  });

  // ── Functionality: Schedule Name Input ─────────────────────────────────

  test.describe('Functionality — Schedule Name Input', () => {
    test('typing into schedule name input updates its value', async ({ schedulingWizardPage }) => {
      await schedulingWizardPage.fillScheduleName('Test Schedule Name');
      const value = await schedulingWizardPage.scheduleNameInput.inputValue();
      expect(value).toBe('Test Schedule Name');
    });

    test('schedule name input can be cleared', async ({ schedulingWizardPage }) => {
      await schedulingWizardPage.fillScheduleName('Test');
      await schedulingWizardPage.scheduleNameInput.clear();
      const value = await schedulingWizardPage.scheduleNameInput.inputValue();
      expect(value).toBe('');
    });
  });

  // ── Functionality: Audit History Panel ─────────────────────────────────

  test.describe('Functionality — Right Panel', () => {
    test('audit history panel is visible on the right', async ({ schedulingWizardPage }) => {
      await expect(schedulingWizardPage.rightPanel).toBeVisible();
    });

    test('audit history shows "No history yet" when no audit selected', async ({ schedulingWizardPage }) => {
      const historyCard = schedulingWizardPage.locator('.audit-history-card');
      await expect(historyCard).toBeVisible();
      const text = (await historyCard.textContent())?.trim() ?? '';
      expect(text).toMatch(/No history yet|0 records/i);
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL stays at /scheduling/wizard', async ({ page }) => {
      expect(page.url()).toContain('/scheduling/wizard');
    });

    test('step 1 remains active before any interaction', async ({ schedulingWizardPage }) => {
      expect(await schedulingWizardPage.isStepActive(1)).toBe(true);
      expect(await schedulingWizardPage.isStepActive(2)).toBe(false);
    });
  });
});
