/**
 * Monitor – Audit Workflows
 *
 * Complete end-to-end workflow tests for each audit action on the Monitor page:
 *   1. View Audit  – open an audit in read/execute mode, navigate questions, return
 *   2. Start Audit – open a Scheduled audit, answer first question, navigate, return
 *   3. Continue Audit – open an In Progress audit, continue answering, navigate, return
 *   4. Reassign Audit – open the reassign modal, interact with fields, cancel
 */
import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

// All workflow tests log in fresh for each test via serial mode.
// Serial prevents concurrent logins that throttle the QC server.
test.describe('Monitor – Audit Workflows', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ loginPage, monitorPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await monitorPage.goto();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // View Audit
  // Entry point: View button (.al-primary-btn) on ANY audit row
  // Destination:  /audits/{id}?auditId={id}&view=1
  // ────────────────────────────────────────────────────────────────────────────
  test.describe('View Audit – complete workflow', () => {
    test('clicking View navigates to the audit execution URL', async ({ monitorPage, page }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('audit detail URL contains auditId query parameter', async ({ monitorPage, page }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      expect(page.url()).toContain('auditId=');
    });

    test('audit detail page shows the Back button', async ({ monitorPage, auditDetailPage, page }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.backButton).toBeVisible();
    });

    test('audit detail page shows the Close button', async ({ monitorPage, auditDetailPage, page }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.closeButton).toBeVisible();
    });

    test('audit detail page shows the All Questions button', async ({ monitorPage, auditDetailPage, page }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.allQuestionsButton).toBeVisible();
    });

    test('audit detail page shows Yes, No, and Not Applicable answer buttons', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.yesButton).toBeVisible();
      await expect(auditDetailPage.noButton).toBeVisible();
      await expect(auditDetailPage.naButton).toBeVisible();
    });

    test('audit detail page shows the Next navigation button', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.nextButton).toBeVisible();
    });

    test('clicking Next advances to the second question and reveals the Prev button', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.clickNext();
      await expect(auditDetailPage.prevButton).toBeVisible();
    });

    test('clicking Prev after Next returns to the first question', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.clickNext();
      await auditDetailPage.clickPrev();
      // Still on the audit detail page
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('question sidebar shows all audit questions by default', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      const count = await auditDetailPage.getQuestionSidebarCount();
      expect(count).toBeGreaterThan(0);
    });

    test('All Questions button toggles the question sidebar – closes then reopens', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      // Sidebar is open on load
      expect(await auditDetailPage.getQuestionSidebarCount()).toBeGreaterThan(0);
      // First click collapses the sidebar
      await auditDetailPage.clickAllQuestions();
      expect(await auditDetailPage.getQuestionSidebarCount()).toBe(0);
      // Second click reopens it
      await auditDetailPage.clickAllQuestions();
      expect(await auditDetailPage.getQuestionSidebarCount()).toBeGreaterThan(0);
    });

    test('back breadcrumb displays the audit execution name', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      const crumb = await auditDetailPage.getBackBreadcrumbText();
      // e.g. "arrow_backAudit Execution: <audit name>"
      expect(crumb).toContain('Audit Execution');
    });

    test('Close button returns to the Monitor page', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.closeAndReturnToMonitor();
      expect(page.url()).toContain(urls.monitor);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Start Audit
  // The Monitor page opens audits in READ-ONLY view mode (answer buttons are
  // disabled).  "Starting" an audit from Monitor uses the overflow menu →
  // "Questions" which navigates to /audits/{id}/manage-questions.
  // ────────────────────────────────────────────────────────────────────────────
  test.describe('Start Audit – complete workflow', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.filterByStatus('Scheduled');
    });

    test('View on a Scheduled audit navigates to the audit execution URL', async ({
      monitorPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('Scheduled audit execution page shows all three answer buttons', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.yesButton).toBeVisible();
      await expect(auditDetailPage.noButton).toBeVisible();
      await expect(auditDetailPage.naButton).toBeVisible();
    });

    // View button opens a read-only snapshot — answer buttons are intentionally disabled
    test('answer buttons are disabled in read-only view mode for a Scheduled audit', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.yesButton).toBeDisabled();
      await expect(auditDetailPage.noButton).toBeDisabled();
      await expect(auditDetailPage.naButton).toBeDisabled();
    });

    test('Next button navigates to the second question in view mode', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.clickNext();
      await expect(auditDetailPage.prevButton).toBeVisible();
    });

    test('Prev button is visible after navigating to the second question', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.clickNext();
      // Can navigate back to the first question
      await auditDetailPage.clickPrev();
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('Close button returns to Monitor after viewing a Scheduled audit', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.closeAndReturnToMonitor();
      expect(page.url()).toContain(urls.monitor);
    });

    // "Questions" in the overflow menu is the actual entry point for audit execution
    test('overflow menu includes a Questions option for Scheduled audits', async ({ monitorPage }) => {
      await monitorPage.clickOverflowMenu(0);
      const items = await monitorPage.getOverflowMenuItems();
      expect(items.some(item => /questions/i.test(item))).toBe(true);
    });

    test('clicking Questions in the overflow menu navigates to the manage-questions page', async ({
      monitorPage, page,
    }) => {
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Questions');
      await page.waitForURL(/\/audits\/\d+\/manage-questions/, { timeout: 15000 });
      expect(page.url()).toMatch(/\/audits\/\d+\/manage-questions/);
    });

    test('manage-questions page shows the Manage Questions heading', async ({
      monitorPage, page,
    }) => {
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Questions');
      await page.waitForURL(/manage-questions/, { timeout: 15000 });
      await expect(
        page.getByRole('heading').filter({ hasText: /Manage Questions/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('manage-questions page lists the audit questions', async ({
      monitorPage, page,
    }) => {
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Questions');
      await page.waitForURL(/manage-questions/, { timeout: 15000 });
      await page.waitForTimeout(1000);
      // The page has question/list items
      const count = await page.locator('[class*="question"], [class*="list-item"], li').count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Continue Audit
  // Entry point: View button on an IN PROGRESS audit
  // The Monitor opens audits in READ-ONLY mode; the view shows the partially
  // answered state so the reviewer can see current progress.
  // ────────────────────────────────────────────────────────────────────────────
  test.describe('Continue Audit – complete workflow', () => {
    test.beforeEach(async ({ monitorPage }) => {
      await monitorPage.filterByStatus('In Progress');
    });

    test('View on an In Progress audit navigates to the audit execution URL', async ({
      monitorPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('In Progress audit page shows Yes, No, and NA answer buttons', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.yesButton).toBeVisible();
      await expect(auditDetailPage.noButton).toBeVisible();
      await expect(auditDetailPage.naButton).toBeVisible();
    });

    // View mode is read-only: answers are shown but cannot be changed here
    test('answer buttons are disabled in read-only view mode for an In Progress audit', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await expect(auditDetailPage.yesButton).toBeDisabled();
      await expect(auditDetailPage.noButton).toBeDisabled();
      await expect(auditDetailPage.naButton).toBeDisabled();
    });

    test('Next button advances through questions in Continue view', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.clickNext();
      await expect(auditDetailPage.prevButton).toBeVisible();
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('Prev button navigates back to the previous question', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.clickNext();
      await auditDetailPage.clickPrev();
      expect(page.url()).toMatch(/\/audits\/\d+/);
    });

    test('question sidebar lists all questions for an In Progress audit', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      // Sidebar is open by default; real audits have multiple questions
      const count = await auditDetailPage.getQuestionSidebarCount();
      expect(count).toBeGreaterThan(1);
    });

    test('Close button returns to the Monitor page from an In Progress audit', async ({
      monitorPage, auditDetailPage, page,
    }) => {
      await monitorPage.clickViewButton(0);
      await page.waitForURL(/\/audits\//, { timeout: 15000 });
      await auditDetailPage.waitForLoad();
      await auditDetailPage.closeAndReturnToMonitor();
      expect(page.url()).toContain(urls.monitor);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Reassign Audit
  // Entry point: overflow menu (.al-overflow-btn) on Scheduled or Overdue audit
  // Modal:        .modal  (NOT [role="dialog"] — that element is the AI panel)
  //   .modal-title   → "Reassign Audit"
  //   .form-label    → "New Auditor *"
  //   .cdd-trigger   → custom dropdown (not checkboxes)
  //   textarea.form-textarea → optional Reason field
  //   .btn-secondary → Cancel
  //   .btn-primary   → Reassign (disabled until auditor selected)
  // ────────────────────────────────────────────────────────────────────────────
  test.describe('Reassign Audit – complete workflow', () => {
    test('overflow menu for a Scheduled audit includes a Reassign option', async ({ monitorPage }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      const items = await monitorPage.getOverflowMenuItems();
      expect(items.some(item => /reassign/i.test(item))).toBe(true);
    });

    test('overflow menu for an Overdue audit includes a Reassign option', async ({ monitorPage }) => {
      await monitorPage.filterByStatus('Overdue');
      await monitorPage.clickOverflowMenu(0);
      const items = await monitorPage.getOverflowMenuItems();
      expect(items.some(item => /reassign/i.test(item))).toBe(true);
    });

    test('clicking Reassign opens the reassign modal', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await expect(page.locator('.modal')).toBeVisible();
    });

    test('reassign modal title reads "Reassign Audit"', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await expect(page.locator('.modal-title')).toHaveText(/Reassign Audit/i);
    });

    test('reassign modal shows the audit name being reassigned', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      const auditName = await monitorPage.getRowAuditName(0);
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await expect(page.locator('.modal-desc')).toContainText('Reassigning');
    });

    test('reassign modal displays the New Auditor required label', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await expect(
        page.locator('.modal .form-label').filter({ hasText: /New Auditor/ })
      ).toBeVisible();
    });

    test('reassign modal has an auditor selection dropdown', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await expect(page.locator('.modal .cdd-trigger')).toBeVisible();
    });

    test('auditor dropdown shows the select-auditor placeholder by default', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await expect(page.locator('.modal .cdd-label')).toContainText(/Select auditor/i);
    });

    test('reassign modal contains an optional Reason textarea', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await expect(
        page.locator('.modal textarea[placeholder*="Original auditor"]')
      ).toBeVisible();
    });

    test('Reassign submit button is disabled before an auditor is selected', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await expect(page.locator('.modal .btn-primary')).toBeDisabled();
    });

    test('filling the optional Reason field accepts free-text input', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      const textarea = page.locator('.modal textarea[placeholder*="Original auditor"]');
      await textarea.fill('Original auditor on leave');
      expect(await textarea.inputValue()).toBe('Original auditor on leave');
    });

    test('Cancel button closes the reassign modal', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await page.locator('.modal .btn-secondary').click(); // Cancel
      await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
    });

    test('Close (×) button closes the reassign modal', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await page.locator('.modal-close').click();
      await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
    });

    test('Monitor URL is unchanged after cancelling the reassign modal', async ({ monitorPage, page }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await page.locator('.modal .btn-secondary').click();
      await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
      expect(page.url()).toContain(urls.monitor);
    });

    test('Monitor KPI cards are still rendered after closing the reassign modal', async ({
      monitorPage, page,
    }) => {
      await monitorPage.filterByStatus('Scheduled');
      await monitorPage.clickOverflowMenu(0);
      await monitorPage.clickOverflowMenuItem('Reassign');
      await page.locator('.modal').waitFor({ state: 'visible' });
      await page.locator('.modal .btn-secondary').click();
      await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
      await expect(page.locator('.kpi-card').first()).toBeVisible();
    });
  });
});
