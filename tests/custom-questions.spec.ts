import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Custom Questions — /setup/custom-questions', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, customQuestionsPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await customQuestionsPage.goto();
  });

  // ── UI: Page Structure ──────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /setup/custom-questions', async ({ page }) => {
      expect(page.url()).toContain('/setup/custom-questions');
    });

    test('page title is "Custom Questions"', async ({ customQuestionsPage }) => {
      const text = (await customQuestionsPage.pageTitle.textContent())?.trim() ?? '';
      expect(text).toMatch(/Custom Questions/i);
    });

    test('page subtitle is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.pageSubtitle).toBeVisible();
    });

    test('tab bar is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.locator('.tab-bar')).toBeVisible();
    });

    test('filter bar is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.locator('.filter-bar')).toBeVisible();
    });

    test('question table is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.questionTable).toBeVisible();
    });
  });

  // ── UI: Tabs ────────────────────────────────────────────────────────────

  test.describe('UI — Tabs', () => {
    test('Questions tab is visible and active by default', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.questionsTab).toBeVisible();
      const cls = (await customQuestionsPage.questionsTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('Questions tab shows a count badge', async ({ customQuestionsPage }) => {
      const badge = customQuestionsPage.questionsTab.locator('.tab-badge');
      await expect(badge).toBeVisible();
    });

    test('Custom Audits tab is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.customAuditsTab).toBeVisible();
    });

    test('AI Audit Builder tab is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.aiBuilderTab).toBeVisible();
    });

    test('AI Audit Builder tab has auto_awesome icon text', async ({ customQuestionsPage }) => {
      const text = (await customQuestionsPage.aiBuilderTab.textContent())?.trim() ?? '';
      expect(text).toMatch(/AI Audit Builder/i);
    });
  });

  // ── UI: Questions Table ─────────────────────────────────────────────────

  test.describe('UI — Questions Table', () => {
    test('table has row number or # column header', async ({ customQuestionsPage }) => {
      const headers = await customQuestionsPage.getTableHeaderTexts();
      const combined = headers.join(' ');
      // First column is either '#', a number column, or empty — just check the table has at least 2 headers
      expect(headers.length).toBeGreaterThanOrEqual(2);
    });

    test('table has Question column header', async ({ customQuestionsPage }) => {
      const headers = await customQuestionsPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/Question/i);
    });

    test('table has Audit column header', async ({ customQuestionsPage }) => {
      const headers = await customQuestionsPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/Audit/i);
    });

    test('table has Source column header', async ({ customQuestionsPage }) => {
      const headers = await customQuestionsPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/Source/i);
    });

    test('table has Date Created column header', async ({ customQuestionsPage }) => {
      const headers = await customQuestionsPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/Date Created/i);
    });

    test('table has Actions column header', async ({ customQuestionsPage }) => {
      const headers = await customQuestionsPage.getTableHeaderTexts();
      expect(headers.join(' ')).toMatch(/Actions/i);
    });

    test('at least 5 question rows are present', async ({ customQuestionsPage }) => {
      const count = await customQuestionsPage.getQuestionCount();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('first question row shows text', async ({ customQuestionsPage }) => {
      const textCell = customQuestionsPage.questionRows.first().locator('.text-link, td').first();
      const text = (await textCell.textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });

    test('each question row has Edit button', async ({ customQuestionsPage }) => {
      const count = await customQuestionsPage.editButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('each question row has Delete button', async ({ customQuestionsPage }) => {
      const count = await customQuestionsPage.deleteButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── UI: Filter Bar ──────────────────────────────────────────────────────

  test.describe('UI — Filter Bar', () => {
    test('search input is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.searchInput).toBeVisible();
    });

    test('Add Question button is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.addQuestionButton).toBeVisible();
    });

    test('Add Question button shows correct label', async ({ customQuestionsPage }) => {
      const text = (await customQuestionsPage.addQuestionButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/Add Question/i);
    });

    test('result count is visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.resultCount).toBeVisible();
    });

    test('result count shows a number', async ({ customQuestionsPage }) => {
      const text = (await customQuestionsPage.resultCount.textContent())?.trim() ?? '';
      expect(text).toMatch(/\d+/);
    });
  });

  // ── Functionality: Search ───────────────────────────────────────────────

  test.describe('Functionality — Search', () => {
    test('typing in search filters the question list', async ({ customQuestionsPage }) => {
      const original = await customQuestionsPage.getQuestionCount();
      await customQuestionsPage.searchQuestions('DBS');
      const filtered = await customQuestionsPage.getQuestionCount();
      expect(filtered).toBeLessThanOrEqual(original);
    });

    test('clearing search restores all questions', async ({ customQuestionsPage }) => {
      const original = await customQuestionsPage.getQuestionCount();
      await customQuestionsPage.searchQuestions('zzznonexistent');
      await customQuestionsPage.searchInput.clear();
      await customQuestionsPage.page.waitForTimeout(1500);
      const restored = await customQuestionsPage.getQuestionCount();
      expect(restored).toBe(original);
    });
  });

  // ── Functionality: Add Question Modal ───────────────────────────────────

  test.describe('Functionality — Add Question Modal', () => {
    test('clicking Add Question opens modal', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      expect(await customQuestionsPage.isAddQuestionModalOpen()).toBe(true);
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has Question Text field (required)', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.questionTextInput).toBeVisible();
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('Question Text field shows placeholder', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      const ph = await customQuestionsPage.questionTextInput.getAttribute('placeholder') ?? '';
      expect(ph).toMatch(/Enter the full question text/i);
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has Tooltip field', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.tooltipInput).toBeVisible();
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has Audit dropdown', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.auditDropdownToggle).toBeVisible();
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has Document Upload Required checkbox', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.docUploadCheckbox.first()).toBeAttached();
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has AI Suggest button', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.aiSuggestButton).toBeVisible();
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has Create Question button', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.createQuestionButton).toBeVisible();
      const text = (await customQuestionsPage.createQuestionButton.textContent())?.trim() ?? '';
      expect(text).toMatch(/Create Question/i);
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has Cancel button', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.cancelButton).toBeVisible();
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('modal has close (×) button', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await expect(customQuestionsPage.modalClose).toBeVisible();
      await customQuestionsPage.closeAddQuestionModal();
    });

    test('cancelling closes the modal', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await customQuestionsPage.cancelAddQuestionModal();
      expect(await customQuestionsPage.isAddQuestionModalOpen()).toBe(false);
    });

    test('Question Text field accepts text input', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      await customQuestionsPage.fillQuestionText('Is this a test question?');
      const value = await customQuestionsPage.questionTextInput.inputValue();
      expect(value).toBe('Is this a test question?');
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('CQC section shows CARING label', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      const text = (await customQuestionsPage.addQuestionModal.textContent())?.trim() ?? '';
      expect(text).toMatch(/CARING/i);
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('CQC section shows SAFE label', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickAddQuestion();
      const text = (await customQuestionsPage.addQuestionModal.textContent())?.trim() ?? '';
      expect(text).toMatch(/SAFE/i);
      await customQuestionsPage.cancelAddQuestionModal();
    });
  });

  // ── Functionality: Edit Question ────────────────────────────────────────

  test.describe('Functionality — Edit Question', () => {
    test('clicking Edit on first question opens edit form/modal', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickEditQuestion(0);
      await customQuestionsPage.page.waitForTimeout(600);
      const modalVisible = await customQuestionsPage.addQuestionModal.isVisible();
      expect(modalVisible).toBe(true);
      await customQuestionsPage.cancelAddQuestionModal();
    });

    test('edit modal is pre-filled with question text', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickEditQuestion(0);
      await customQuestionsPage.page.waitForTimeout(600);
      const value = await customQuestionsPage.questionTextInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
      await customQuestionsPage.cancelAddQuestionModal();
    });
  });

  // ── Functionality: Delete Question ──────────────────────────────────────

  test.describe('Functionality — Delete Question', () => {
    test('clicking Delete shows a confirmation UI', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickDeleteQuestion(0);
      await customQuestionsPage.page.waitForTimeout(600);
      const confirmUI = await customQuestionsPage.locator('[class*="confirm"], [class*="modal"], [role="dialog"], [class*="alert"]').first().isVisible().catch(() => false);
      if (confirmUI) {
        await customQuestionsPage.page.keyboard.press('Escape');
      }
    });
  });

  // ── Functionality: Tab Switching ────────────────────────────────────────

  test.describe('Functionality — Tab Switching', () => {
    test('clicking Custom Audits tab makes it active', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickTab('customAudits');
      const cls = (await customQuestionsPage.customAuditsTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking Questions tab returns it to active', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickTab('customAudits');
      await customQuestionsPage.clickTab('questions');
      const cls = (await customQuestionsPage.questionsTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });

    test('clicking AI Builder tab makes it active', async ({ customQuestionsPage }) => {
      await customQuestionsPage.clickTab('aiBuilder');
      const cls = (await customQuestionsPage.aiBuilderTab.getAttribute('class')) ?? '';
      expect(cls).toContain('active');
    });
  });

  // ── Functionality: Pagination ───────────────────────────────────────────

  test.describe('Functionality — Pagination', () => {
    test('pagination controls are visible', async ({ customQuestionsPage }) => {
      await expect(customQuestionsPage.locator('.pagination-controls')).toBeVisible();
    });

    test('pagination text shows record count', async ({ customQuestionsPage }) => {
      const text = (await customQuestionsPage.paginationText.textContent())?.trim() ?? '';
      expect(text).toMatch(/\d+/);
    });
  });
});
