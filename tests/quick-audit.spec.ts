import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Quick Audit — /scheduling/quick', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test.beforeEach(async ({ page, loginPage, quickAuditPage }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 30000 });
    await quickAuditPage.goto();
  });

  // ── UI: Page structure ─────────────────────────────────────────────────────

  test.describe('UI — Page Structure', () => {
    test('page loads at /scheduling/quick', async ({ page }) => {
      expect(page.url()).toContain('/scheduling/quick');
    });

    test('page heading is "Quick Schedule"', async ({ quickAuditPage }) => {
      const heading = await quickAuditPage.getPageHeading();
      expect(heading).toMatch(/Quick Schedule/i);
    });

    test('page subtitle mentions one-off audits', async ({ quickAuditPage }) => {
      const subtitle = await quickAuditPage.getPageSubtitle();
      expect(subtitle).toMatch(/one-off/i);
    });

    test('quick schedule card is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.qsCard).toBeVisible();
    });

    test('form is present inside the card', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.form).toBeVisible();
    });

    test('"Open full Wizard" button is visible in the topbar', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.openWizardButton).toBeVisible();
    });

    test('"Open full Wizard" button shows correct label', async ({ quickAuditPage }) => {
      const text = (await quickAuditPage.openWizardButton.textContent()) ?? '';
      expect(text).toMatch(/Open full Wizard/i);
    });
  });

  // ── UI: Form fields ────────────────────────────────────────────────────────

  test.describe('UI — Form Fields', () => {
    test('Audit select field is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.auditSelect).toBeVisible();
    });

    test('Audit select shows "Select audit" placeholder', async ({ quickAuditPage }) => {
      const placeholder = await quickAuditPage.getAuditSelectPlaceholder();
      expect(placeholder).toBe('Select audit');
    });

    test('Group / Location select field is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.groupSelect).toBeVisible();
    });

    test('Group / Location select shows "Select group" placeholder', async ({ quickAuditPage }) => {
      const placeholder = await quickAuditPage.getGroupSelectPlaceholder();
      expect(placeholder).toBe('Select group');
    });

    test('Auditor select field is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.auditorSelect).toBeVisible();
    });

    test('Auditor select shows "Select auditor" placeholder', async ({ quickAuditPage }) => {
      const placeholder = await quickAuditPage.getAuditorSelectPlaceholder();
      expect(placeholder).toBe('Select auditor');
    });

    test('Assigned Date picker is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.datePicker).toBeVisible();
    });

    test('Assigned Date picker shows "dd/mm/yyyy" placeholder', async ({ quickAuditPage }) => {
      const placeholder = await quickAuditPage.getDatePickerPlaceholder();
      expect(placeholder).toBe('dd/mm/yyyy');
    });

    test('optional divider is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.optionalDivider).toBeVisible();
    });

    test('optional divider shows "OPTIONAL" label', async ({ quickAuditPage }) => {
      const text = (await quickAuditPage.optionalDivider.textContent()) ?? '';
      expect(text).toMatch(/OPTIONAL/i);
    });

    test('Reviewer select field is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.reviewerSelect).toBeVisible();
    });

    test('Notes textarea is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.notesTextarea).toBeVisible();
    });

    test('Notes textarea shows correct placeholder', async ({ quickAuditPage }) => {
      const placeholder = await quickAuditPage.notesTextarea.getAttribute('placeholder');
      expect(placeholder).toMatch(/Optional context/i);
    });

    test('Shared audit toggle is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.sharedToggleLabel).toBeVisible();
    });

    test('required fields have a red asterisk indicator', async ({ quickAuditPage }) => {
      const count = await quickAuditPage.getRequiredFieldCount();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('field labels include Audit, Group, Auditor, and Assigned Date', async ({ quickAuditPage }) => {
      const labels = await quickAuditPage.getFieldLabelTexts();
      expect(labels.some(l => /Audit/i.test(l))).toBe(true);
      expect(labels.some(l => /Group/i.test(l))).toBe(true);
      expect(labels.some(l => /Auditor/i.test(l))).toBe(true);
      expect(labels.some(l => /Date/i.test(l))).toBe(true);
    });
  });

  // ── UI: Buttons ────────────────────────────────────────────────────────────

  test.describe('UI — Buttons', () => {
    test('Schedule Audit submit button is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.submitButton).toBeVisible();
    });

    test('Schedule Audit button shows correct label', async ({ quickAuditPage }) => {
      const text = (await quickAuditPage.submitButton.textContent()) ?? '';
      expect(text).toMatch(/Schedule audit/i);
    });

    test('Submit button is type="submit"', async ({ quickAuditPage }) => {
      const type = await quickAuditPage.submitButton.getAttribute('type');
      expect(type).toBe('submit');
    });

    test('Cancel button is visible', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.cancelButton).toBeVisible();
    });

    test('Cancel button is enabled', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.cancelButton).toBeEnabled();
    });

    test('Cancel button shows "Cancel" label', async ({ quickAuditPage }) => {
      const text = (await quickAuditPage.cancelButton.textContent()) ?? '';
      expect(text).toMatch(/Cancel/i);
    });
  });

  // ── Functionality: Form state & validation ─────────────────────────────────

  test.describe('Functionality — Form State & Validation', () => {
    test('form starts in an invalid state (required fields empty)', async ({ quickAuditPage }) => {
      const isValid = await quickAuditPage.isFormValid();
      expect(isValid).toBe(false);
    });

    test('clicking submit on an empty form marks it as submitted', async ({ quickAuditPage }) => {
      await quickAuditPage.clickSubmit();
      const submitted = await quickAuditPage.isFormSubmitted();
      expect(submitted).toBe(true);
    });

    test('after clicking submit on empty form page stays at /scheduling/quick', async ({ page, quickAuditPage }) => {
      await quickAuditPage.clickSubmit();
      expect(page.url()).toContain('/scheduling/quick');
    });

    test('empty required dropdowns show their placeholders after failed submit', async ({ quickAuditPage }) => {
      await quickAuditPage.clickSubmit();
      const auditPlaceholder = await quickAuditPage.getAuditSelectPlaceholder();
      expect(auditPlaceholder).toBe('Select audit');
    });
  });

  // ── Functionality: Audit dropdown ──────────────────────────────────────────

  test.describe('Functionality — Audit Dropdown', () => {
    test('clicking Audit select opens the dropdown panel', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditDropdown();
      await expect(quickAuditPage.dropdownPanel).toBeVisible();
    });

    test('Audit dropdown panel contains multiple options', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditDropdown();
      const count = await quickAuditPage.getDropdownOptionCount();
      expect(count).toBeGreaterThan(1);
    });

    test('Audit dropdown options show audit template names', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditDropdown();
      const firstOptionText = (await quickAuditPage.dropdownOptions.first().textContent())?.trim() ?? '';
      expect(firstOptionText.length).toBeGreaterThan(0);
    });

    test('selecting an audit option closes the dropdown panel', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await expect(quickAuditPage.dropdownPanel).not.toBeVisible({ timeout: 3000 });
    });

    test('selected audit name replaces the placeholder text', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditDropdown();
      const selected = await quickAuditPage.selectFirstDropdownOption();
      const placeholder = await quickAuditPage.getAuditSelectPlaceholder();
      // Placeholder disappears once a value is selected
      expect(placeholder).not.toBe('Select audit');
    });

    test('Audit dropdown trigger gains "open" class while panel is visible', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditDropdown();
      const isOpen = await quickAuditPage.isAuditSelectOpen();
      expect(isOpen).toBe(true);
    });
  });

  // ── Functionality: Group / Location dropdown ───────────────────────────────

  test.describe('Functionality — Group / Location Dropdown', () => {
    test('clicking Group select opens the dropdown panel', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await expect(quickAuditPage.dropdownPanel).toBeVisible();
    });

    test('Group dropdown has at least one option', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      const count = await quickAuditPage.getDropdownOptionCount();
      expect(count).toBeGreaterThan(0);
    });

    test('selecting a group option closes the dropdown', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await expect(quickAuditPage.dropdownPanel).not.toBeVisible({ timeout: 3000 });
    });

    test('selected group name replaces the "Select group" placeholder', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      const placeholder = await quickAuditPage.getGroupSelectPlaceholder();
      expect(placeholder).not.toBe('Select group');
    });
  });

  // ── Functionality: Auditor dropdown & filter dependency ────────────────────
  // The Auditor dropdown is filtered by Group — it is empty until a Group is selected.

  test.describe('Functionality — Auditor Dropdown & Filter', () => {
    test('clicking Auditor select opens the dropdown panel even with no group selected', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditorDropdown();
      await expect(quickAuditPage.dropdownPanel).toBeVisible();
    });

    test('Auditor dropdown is empty before a Group is selected (filter enforced)', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditorDropdown();
      const count = await quickAuditPage.getDropdownOptionCount();
      expect(count).toBe(0);
    });

    test('selecting a Group populates the Auditor dropdown (filter dependency)', async ({ quickAuditPage }) => {
      await quickAuditPage.closeOpenDropdown();

      // Select a group first
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();

      // Now auditor dropdown should have options
      await quickAuditPage.openAuditorDropdown();
      const countAfter = await quickAuditPage.getDropdownOptionCount();
      expect(countAfter).toBeGreaterThan(0);
    });

    test('Auditor dropdown has at least one option after group selection', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await quickAuditPage.openAuditorDropdown();
      const count = await quickAuditPage.getDropdownOptionCount();
      expect(count).toBeGreaterThan(0);
    });

    test('Auditor options show auditor names after group is selected', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await quickAuditPage.openAuditorDropdown();
      const firstAuditor = (await quickAuditPage.dropdownOptions.first().textContent())?.trim() ?? '';
      expect(firstAuditor.length).toBeGreaterThan(0);
    });

    test('selecting an auditor closes the dropdown', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await quickAuditPage.openAuditorDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await expect(quickAuditPage.dropdownPanel).not.toBeVisible({ timeout: 3000 });
    });

    test('selected auditor name replaces the "Select auditor" placeholder', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await quickAuditPage.openAuditorDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      const placeholder = await quickAuditPage.getAuditorSelectPlaceholder();
      expect(placeholder).not.toBe('Select auditor');
    });
  });

  // ── Functionality: Date picker ─────────────────────────────────────────────

  test.describe('Functionality — Date Picker', () => {
    test('clicking the date picker trigger opens a date panel', async ({ page, quickAuditPage }) => {
      await quickAuditPage.openDatePicker();
      // A date panel, calendar, or overlay should appear
      const datePanel = page.locator('.dp-panel, .cal-panel, [class*="date-panel"], [class*="datepicker"]').first();
      await expect(datePanel).toBeVisible({ timeout: 5000 });
    });

    test('date picker trigger is enabled', async ({ quickAuditPage }) => {
      await expect(quickAuditPage.datePicker).toBeEnabled();
    });

    test('date picker placeholder text is "dd/mm/yyyy"', async ({ quickAuditPage }) => {
      const placeholder = await quickAuditPage.getDatePickerPlaceholder();
      expect(placeholder).toBe('dd/mm/yyyy');
    });
  });

  // ── Functionality: Notes field ─────────────────────────────────────────────

  test.describe('Functionality — Notes Field', () => {
    test('Notes textarea accepts text input', async ({ quickAuditPage }) => {
      await quickAuditPage.fillNotes('Test notes for this audit');
      const value = await quickAuditPage.notesTextarea.inputValue();
      expect(value).toBe('Test notes for this audit');
    });

    test('Notes textarea can be cleared', async ({ quickAuditPage }) => {
      await quickAuditPage.fillNotes('some text');
      await quickAuditPage.fillNotes('');
      const value = await quickAuditPage.notesTextarea.inputValue();
      expect(value).toBe('');
    });

    test('Notes textarea is multi-line (rows >= 3)', async ({ quickAuditPage }) => {
      const rows = await quickAuditPage.notesTextarea.getAttribute('rows');
      expect(Number(rows)).toBeGreaterThanOrEqual(3);
    });
  });

  // ── Functionality: Shared audit toggle ────────────────────────────────────

  test.describe('Functionality — Shared Audit Toggle', () => {
    test('Shared audit toggle is unchecked by default', async ({ quickAuditPage }) => {
      const checked = await quickAuditPage.isSharedToggleChecked();
      expect(checked).toBe(false);
    });

    test('clicking the toggle enables the shared audit option', async ({ quickAuditPage }) => {
      await quickAuditPage.clickSharedToggle();
      const checked = await quickAuditPage.isSharedToggleChecked();
      expect(checked).toBe(true);
    });

    test('clicking the toggle twice returns it to unchecked', async ({ quickAuditPage }) => {
      await quickAuditPage.clickSharedToggle();
      await quickAuditPage.clickSharedToggle();
      const checked = await quickAuditPage.isSharedToggleChecked();
      expect(checked).toBe(false);
    });

    test('shared row shows descriptive label text', async ({ quickAuditPage }) => {
      const text = (await quickAuditPage.sharedRow.textContent()) ?? '';
      expect(text).toMatch(/Shared audit/i);
    });

    test('shared row shows "Multiple auditors" description', async ({ quickAuditPage }) => {
      const text = (await quickAuditPage.sharedDesc.textContent()) ?? '';
      expect(text).toMatch(/Multiple auditors/i);
    });
  });

  // ── Functionality: Navigation ──────────────────────────────────────────────

  test.describe('Functionality — Navigation', () => {
    test('Cancel button navigates away from /scheduling/quick', async ({ page, quickAuditPage }) => {
      await quickAuditPage.clickCancel();
      await page.waitForURL(url => !url.toString().includes('/scheduling/quick'), { timeout: 10000 });
      expect(page.url()).not.toContain('/scheduling/quick');
    });

    test('Open full Wizard navigates to the scheduling wizard', async ({ page, quickAuditPage }) => {
      await quickAuditPage.clickOpenWizard();
      await page.waitForURL(/\/scheduling/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/scheduling/);
    });
  });

  // ── Functionality: Complete required fields workflow ───────────────────────

  test.describe('Functionality — Complete Required Fields', () => {
    test('filling all three required dropdowns makes them non-empty', async ({ quickAuditPage }) => {
      const { audit, group, auditor } = await quickAuditPage.fillRequiredDropdowns();
      expect(audit.length).toBeGreaterThan(0);
      expect(group.length).toBeGreaterThan(0);
      expect(auditor.length).toBeGreaterThan(0);
    });

    test('after selecting an audit the trigger no longer shows placeholder', async ({ quickAuditPage }) => {
      await quickAuditPage.openAuditDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      const placeholder = await quickAuditPage.getAuditSelectPlaceholder();
      expect(placeholder).not.toBe('Select audit');
    });

    test('after selecting a group the trigger no longer shows placeholder', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      const placeholder = await quickAuditPage.getGroupSelectPlaceholder();
      expect(placeholder).not.toBe('Select group');
    });

    test('after selecting a group then an auditor the trigger no longer shows placeholder', async ({ quickAuditPage }) => {
      await quickAuditPage.openGroupDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      await quickAuditPage.openAuditorDropdown();
      await quickAuditPage.selectFirstDropdownOption();
      const placeholder = await quickAuditPage.getAuditorSelectPlaceholder();
      expect(placeholder).not.toBe('Select auditor');
    });
  });
});
