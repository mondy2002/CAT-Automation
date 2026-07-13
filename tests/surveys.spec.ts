import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Surveys — /survey', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, surveysPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await surveysPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /survey', async ({ page }) => {
      expect(page.url()).toContain('/survey');
    });

    test('page title is "Surveys"', async ({ surveysPage }) => {
      const text = (await surveysPage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/Surveys/i);
    });

    test('page subtitle is visible', async ({ surveysPage }) => {
      await expect(surveysPage.pageSubtitle).toBeVisible();
    });

    test('stat cards container is visible', async ({ surveysPage }) => {
      await expect(surveysPage.statCards).toBeVisible();
    });

    test('tab bar is visible', async ({ surveysPage }) => {
      await expect(surveysPage.tabBar).toBeVisible();
    });
  });

  // ── UI: Stat Cards ──────────────────────────────────────────────────────

  test.describe('UI — Stat Cards', () => {
    test('Active Surveys card is visible (green)', async ({ surveysPage }) => {
      await expect(surveysPage.locator('.stat-card--green')).toBeVisible();
    });

    test('Expired Surveys card is visible (red)', async ({ surveysPage }) => {
      await expect(surveysPage.locator('.stat-card--red')).toBeVisible();
    });

    test('Total System Surveys card is visible (blue)', async ({ surveysPage }) => {
      await expect(surveysPage.locator('.stat-card--blue')).toBeVisible();
    });

    test('Active Surveys shows a numeric value', async ({ surveysPage }) => {
      const value = await surveysPage.getStatValue('Active Surveys');
      expect(value).toMatch(/^\d+$/);
    });

    test('Total System Surveys >= Active Surveys', async ({ surveysPage }) => {
      const total = parseInt(await surveysPage.getStatValue('Total System Surveys'), 10);
      const active = parseInt(await surveysPage.getStatValue('Active Surveys'), 10);
      expect(total).toBeGreaterThanOrEqual(active);
    });

    test('each stat card has a label and numeric value', async ({ surveysPage }) => {
      const cards = await surveysPage.locator('.stat-card').all();
      for (const card of cards) {
        const value = (await card.locator('.stat-value').textContent())?.trim() ?? '';
        const label = (await card.locator('.stat-label').textContent())?.trim() ?? '';
        expect(value).toMatch(/^\d+$/);
        expect(label.length).toBeGreaterThan(0);
      }
    });
  });

  // ── UI: Tabs ────────────────────────────────────────────────────────────

  test.describe('UI — Tabs', () => {
    test('Surveys tab is visible and active by default', async ({ surveysPage }) => {
      await expect(surveysPage.surveysTab).toBeVisible();
      const cls = (await surveysPage.surveysTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('Surveys tab shows a count', async ({ surveysPage }) => {
      const text = (await surveysPage.surveysTab.textContent())?.trim() ?? '';
      expect(text).toMatch(/\d+/);
    });

    test('Schedules tab is visible', async ({ surveysPage }) => {
      await expect(surveysPage.schedulesTab).toBeVisible();
    });

    test('Schedules tab shows a count', async ({ surveysPage }) => {
      const text = (await surveysPage.schedulesTab.textContent())?.trim() ?? '';
      expect(text).toMatch(/\d+/);
    });

    test('Results tab is visible', async ({ surveysPage }) => {
      await expect(surveysPage.resultsTab).toBeVisible();
    });
  });

  // ── UI: Survey Table ────────────────────────────────────────────────────

  test.describe('UI — Survey Table', () => {
    test('survey table is visible', async ({ surveysPage }) => {
      await expect(surveysPage.surveyTable).toBeVisible();
    });

    test('table has SURVEY column header', async ({ surveysPage }) => {
      const headers = await surveysPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/SURVEY/i);
    });

    test('table has TYPE column header', async ({ surveysPage }) => {
      const headers = await surveysPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/TYPE/i);
    });

    test('table has QUESTIONS column header', async ({ surveysPage }) => {
      const headers = await surveysPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/QUESTIONS/i);
    });

    test('table has RESPONSES column header', async ({ surveysPage }) => {
      const headers = await surveysPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/RESPONSES/i);
    });

    test('at least one survey row is present', async ({ surveysPage }) => {
      const count = await surveysPage.getSurveyCount();
      expect(count).toBeGreaterThan(0);
    });

    test('each survey row has a Schedule button', async ({ surveysPage }) => {
      const count = await surveysPage.scheduleButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Schedule buttons are enabled', async ({ surveysPage }) => {
      const buttons = await surveysPage.scheduleButtons.all();
      for (const btn of buttons.slice(0, 3)) {
        await expect(btn).toBeEnabled();
      }
    });
  });

  // ── UI: New Survey Schedule Button ──────────────────────────────────────

  test.describe('UI — New Survey Schedule Button', () => {
    test('"New Survey Schedule" button is visible', async ({ surveysPage }) => {
      await expect(surveysPage.newSurveyScheduleButton).toBeVisible();
    });

    test('"New Survey Schedule" button is enabled', async ({ surveysPage }) => {
      await expect(surveysPage.newSurveyScheduleButton).toBeEnabled();
    });

    test('button shows correct label', async ({ surveysPage }) => {
      const text = (await surveysPage.newSurveyScheduleButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/New Survey Schedule/i);
    });
  });

  // ── Functionality: Tab Switching ────────────────────────────────────────

  test.describe('Functionality — Tab Switching', () => {
    test('clicking Schedules tab makes it active', async ({ surveysPage }) => {
      await surveysPage.clickTab('schedules');
      const cls = (await surveysPage.schedulesTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Surveys tab returns it to active', async ({ surveysPage }) => {
      await surveysPage.clickTab('schedules');
      await surveysPage.clickTab('surveys');
      const cls = (await surveysPage.surveysTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Results tab makes it active', async ({ surveysPage }) => {
      await surveysPage.clickTab('results');
      const cls = (await surveysPage.resultsTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });
  });

  // ── Functionality: New Survey Schedule Modal ────────────────────────────

  test.describe('Functionality — New Survey Schedule Modal', () => {
    test('clicking New Survey Schedule opens modal', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      expect(await surveysPage.isSurveyScheduleModalOpen()).toBe(true);
      await surveysPage.closeSurveyScheduleModal();
    });

    test('modal has Survey field label', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      const labels = await surveysPage.scheduleModal.locator('label').all();
      const labelTexts = await Promise.all(labels.map(l => l.textContent()));
      const combined = labelTexts.join(' ').toLowerCase();
      expect(combined).toMatch(/survey/i);
      await surveysPage.closeSurveyScheduleModal();
    });

    test('modal has Schedule Name field', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      await expect(surveysPage.scheduleNameInput).toBeVisible();
      await surveysPage.closeSurveyScheduleModal();
    });

    test('Schedule Name field has correct placeholder', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      const ph = await surveysPage.scheduleNameInput.getAttribute('placeholder') ?? '';
      expect(ph).toMatch(/Q2 Staff Survey|e\.g\./i);
      await surveysPage.closeSurveyScheduleModal();
    });

    test('modal has Available From date picker', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      const datePickers = surveysPage.scheduleModal.locator('.dp-trigger');
      const count = await datePickers.count();
      expect(count).toBeGreaterThanOrEqual(2);
      await surveysPage.closeSurveyScheduleModal();
    });

    test('modal has Create Schedule submit button', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      await expect(surveysPage.scheduleModalSubmit).toBeVisible();
      const text = (await surveysPage.scheduleModalSubmit.textContent())?.trim() ?? '';
      expect(text).toMatch(/Create Schedule/i);
      await surveysPage.closeSurveyScheduleModal();
    });

    test('modal has Cancel button', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      await expect(surveysPage.scheduleModalCancel).toBeVisible();
      await surveysPage.cancelSurveyScheduleModal();
    });

    test('closing modal hides it', async ({ surveysPage }) => {
      await surveysPage.clickNewSurveySchedule();
      await surveysPage.closeSurveyScheduleModal();
      expect(await surveysPage.isSurveyScheduleModalOpen()).toBe(false);
    });
  });

  // ── Functionality: Schedule Button Per Row ──────────────────────────────

  test.describe('Functionality — Schedule Button Per Row', () => {
    test('clicking Schedule on first survey row opens modal', async ({ surveysPage }) => {
      await surveysPage.clickScheduleButton(0);
      expect(await surveysPage.isSurveyScheduleModalOpen()).toBe(true);
      await surveysPage.closeSurveyScheduleModal();
    });
  });

  // ── Functionality: Navigation ───────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('URL is /survey after load', async ({ page }) => {
      expect(page.url()).toContain('/survey');
    });
  });
});
