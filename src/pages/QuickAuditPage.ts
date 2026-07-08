import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class QuickAuditPage extends BasePage {
  // ── Page structure ────────────────────────────────────────────────────────
  readonly qsPage: Locator;
  readonly qsCard: Locator;
  readonly pageHeading: Locator;
  readonly pageSubtitle: Locator;
  readonly openWizardButton: Locator;

  // ── Required fields (cs-trigger indexed 0-2 + date picker) ───────────────
  readonly auditSelect: Locator;
  readonly groupSelect: Locator;
  readonly auditorSelect: Locator;
  readonly datePicker: Locator;

  // ── Optional fields ───────────────────────────────────────────────────────
  readonly reviewerSelect: Locator;
  readonly notesTextarea: Locator;
  readonly sharedToggle: Locator;
  readonly sharedToggleLabel: Locator;
  readonly sharedRow: Locator;
  readonly sharedDesc: Locator;
  readonly optionalDivider: Locator;

  // ── Dropdown panel (shared across all custom selects) ─────────────────────
  readonly dropdownPanel: Locator;
  readonly dropdownOptions: Locator;

  // ── Buttons ───────────────────────────────────────────────────────────────
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // ── Form / validation ─────────────────────────────────────────────────────
  readonly form: Locator;
  readonly fieldLabels: Locator;
  readonly requiredIndicators: Locator;

  constructor(page: Page) {
    super(page);

    this.qsPage = this.locator('.qs-page');
    this.qsCard = this.locator('.qs-card');
    this.pageHeading = this.locator('.qs-title');
    this.pageSubtitle = this.locator('.qs-subtitle');
    this.openWizardButton = this.locator('button.open-wizard-btn');

    // Four .cs-trigger buttons in DOM order: Audit(0), Group(1), Auditor(2), Reviewer(3)
    this.auditSelect = this.locator('button.cs-trigger').nth(0);
    this.groupSelect = this.locator('button.cs-trigger').nth(1);
    this.auditorSelect = this.locator('button.cs-trigger').nth(2);
    this.datePicker = this.locator('button.dp-trigger');
    this.reviewerSelect = this.locator('button.cs-trigger').nth(3);

    this.notesTextarea = this.locator('textarea.field-textarea');
    // Native checkbox is hidden; click .toggle-wrap to toggle
    this.sharedToggle = this.locator('input[type="checkbox"][formcontrolname="isShared"]');
    this.sharedToggleLabel = this.locator('.toggle-wrap');
    this.sharedRow = this.locator('.shared-row');
    this.sharedDesc = this.locator('.shared-desc');
    this.optionalDivider = this.locator('.optional-divider');

    this.dropdownPanel = this.locator('.cs-panel');
    this.dropdownOptions = this.locator('.cs-option');

    this.submitButton = this.locator('button.btn-submit');
    this.cancelButton = this.locator('button.btn-cancel');

    this.form = this.locator('.qs-card form');
    this.fieldLabels = this.locator('.field-label');
    this.requiredIndicators = this.locator('span.required');
  }

  async goto(): Promise<void> {
    await this.navigate('/scheduling/quick');
    await this.qsCard.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getPageHeading(): Promise<string> {
    return (await this.pageHeading.textContent())?.trim() ?? '';
  }

  async getPageSubtitle(): Promise<string> {
    return (await this.pageSubtitle.textContent())?.trim() ?? '';
  }

  // After a value is selected, .cs-placeholder is removed from the DOM.
  // Returns '' rather than timing out when the element is gone.
  private async _csPlaceholderText(trigger: Locator): Promise<string> {
    try {
      return (await trigger.locator('.cs-placeholder').textContent({ timeout: 2000 }))?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async getAuditSelectPlaceholder(): Promise<string> {
    return this._csPlaceholderText(this.auditSelect);
  }

  async getGroupSelectPlaceholder(): Promise<string> {
    return this._csPlaceholderText(this.groupSelect);
  }

  async getAuditorSelectPlaceholder(): Promise<string> {
    return this._csPlaceholderText(this.auditorSelect);
  }

  async getDatePickerPlaceholder(): Promise<string> {
    return (await this.datePicker.locator('.dp-placeholder').textContent())?.trim() ?? '';
  }

  async openAuditDropdown(): Promise<void> {
    await this.auditSelect.click();
    await this.dropdownPanel.waitFor({ state: 'visible', timeout: 5000 });
    await this.dropdownOptions.first().waitFor({ state: 'attached', timeout: 5000 });
  }

  async openGroupDropdown(): Promise<void> {
    await this.groupSelect.click();
    await this.dropdownPanel.waitFor({ state: 'visible', timeout: 5000 });
    await this.dropdownOptions.first().waitFor({ state: 'attached', timeout: 5000 });
  }

  async openAuditorDropdown(): Promise<void> {
    // Auditor options only populate AFTER a Group is selected.
    // This method just opens the panel — callers must select a group first if they need options.
    await this.auditorSelect.click();
    await this.dropdownPanel.waitFor({ state: 'visible', timeout: 5000 });
  }

  async openDatePicker(): Promise<void> {
    await this.datePicker.click();
    await this.page.waitForTimeout(500);
  }

  async closeOpenDropdown(): Promise<void> {
    // Press Escape to close any open panel
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async selectFirstDropdownOption(): Promise<string> {
    const firstOption = this.dropdownOptions.first();
    const text = (await firstOption.textContent())?.trim() ?? '';
    await firstOption.click();
    await this.page.waitForTimeout(400);
    return text;
  }

  async getDropdownOptionCount(): Promise<number> {
    return this.dropdownOptions.count();
  }

  async isDropdownPanelVisible(): Promise<boolean> {
    return this.dropdownPanel.isVisible();
  }

  async isAuditSelectOpen(): Promise<boolean> {
    const cls = (await this.auditSelect.getAttribute('class')) ?? '';
    return cls.includes('open');
  }

  async isFormValid(): Promise<boolean> {
    const cls = (await this.form.getAttribute('class')) ?? '';
    return cls.includes('ng-valid') && !cls.includes('ng-invalid');
  }

  async isFormSubmitted(): Promise<boolean> {
    const cls = (await this.form.getAttribute('class')) ?? '';
    return cls.includes('ng-submitted');
  }

  async getRequiredFieldCount(): Promise<number> {
    return this.requiredIndicators.count();
  }

  async getFieldLabelTexts(): Promise<string[]> {
    const count = await this.fieldLabels.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await this.fieldLabels.nth(i).textContent())?.trim().replace(/\*/g, '').trim() ?? '';
      if (text) texts.push(text);
    }
    return texts;
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForTimeout(600);
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickOpenWizard(): Promise<void> {
    await this.openWizardButton.click();
    await this.page.waitForTimeout(500);
  }

  async fillNotes(text: string): Promise<void> {
    await this.notesTextarea.fill(text);
  }

  async isSharedToggleChecked(): Promise<boolean> {
    return this.sharedToggle.isChecked();
  }

  async clickSharedToggle(): Promise<void> {
    await this.sharedToggleLabel.click();
    await this.page.waitForTimeout(300);
  }

  // Select audit, group, and auditor by picking the first available option from each.
  // Group must be selected before Auditor because the auditor list is filtered by group.
  async fillRequiredDropdowns(): Promise<{ audit: string; group: string; auditor: string }> {
    await this.openAuditDropdown();
    const audit = await this.selectFirstDropdownOption();

    await this.openGroupDropdown();
    const group = await this.selectFirstDropdownOption();

    // Auditor dropdown is now populated (filtered by selected group)
    await this.openAuditorDropdown();
    await this.dropdownOptions.first().waitFor({ state: 'attached', timeout: 5000 });
    const auditor = await this.selectFirstDropdownOption();

    return { audit, group, auditor };
  }
}
