import { test, expect } from '../src/fixtures/fixtures';
import { urls, messages } from '../src/data/testData';

test.describe('Forgot Password', () => {
  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
  });

  // ── Page structure ─────────────────────────────────────────────────────────
  test('should load on the correct URL', async ({ page }) => {
    expect(page.url()).toContain(urls.forgotPassword);
  });

  test('should display the email input field', async ({ forgotPasswordPage }) => {
    expect(await forgotPasswordPage.isEmailInputVisible()).toBe(true);
  });

  test('should have correct email input placeholder', async ({ forgotPasswordPage }) => {
    expect(await forgotPasswordPage.getEmailInputPlaceholder()).toBe('your@email.com');
  });

  test('should display the Back to login link', async ({ page }) => {
    await expect(page.locator('a.back-link')).toBeVisible();
  });

  test('should display the Send reset link button', async ({ page }) => {
    await expect(page.locator('button.sign-in-btn[type="submit"]')).toBeVisible();
  });

  // ── Submit button state ────────────────────────────────────────────────────
  test('submit button should be disabled when email field is empty', async ({ forgotPasswordPage }) => {
    expect(await forgotPasswordPage.isSubmitDisabled()).toBe(true);
  });

  test('submit button should be disabled for invalid email format', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.enterEmail('notanemail');
    expect(await forgotPasswordPage.isSubmitDisabled()).toBe(true);
  });

  test('submit button should be enabled with a valid email format', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.enterEmail('test@example.com');
    expect(await forgotPasswordPage.isSubmitEnabled()).toBe(true);
  });

  test('submit button should become disabled after clearing a valid email', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.enterEmail('test@example.com');
    expect(await forgotPasswordPage.isSubmitEnabled()).toBe(true);
    await forgotPasswordPage.clearEmail();
    expect(await forgotPasswordPage.isSubmitDisabled()).toBe(true);
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  test('should show validation error for invalid email format after blur', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.enterEmail('notanemail');
    // Trigger blur so Angular shows the validation error
    await page.locator('#email').press('Tab');
    expect(await forgotPasswordPage.isFieldErrorVisible()).toBe(true);
    expect(await forgotPasswordPage.getFieldError()).toContain(messages.forgotPasswordFieldError);
  });

  test('should clear validation error when a valid email is entered', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.enterEmail('notanemail');
    await page.locator('#email').press('Tab');
    expect(await forgotPasswordPage.isFieldErrorVisible()).toBe(true);
    await forgotPasswordPage.enterEmail('valid@email.com');
    await expect(page.locator('.field-error')).not.toBeVisible();
  });

  // ── Success message ────────────────────────────────────────────────────────
  test('should show generic success message for unregistered email', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.enterEmail('notregistered@example.com');
    await forgotPasswordPage.submit();
    expect(await forgotPasswordPage.isSuccessMessageVisible()).toBe(true);
    expect(await forgotPasswordPage.getSuccessMessage()).toContain(messages.forgotPasswordSuccess);
  });

  test('should show same success message for registered email', async ({ forgotPasswordPage }) => {
    // App deliberately returns the same message regardless of whether the email exists
    await forgotPasswordPage.enterEmail('oa2@demo.local');
    await forgotPasswordPage.submit();
    expect(await forgotPasswordPage.isSuccessMessageVisible()).toBe(true);
    expect(await forgotPasswordPage.getSuccessMessage()).toContain(messages.forgotPasswordSuccess);
  });

  test('should remain on forgot-password page after form submission', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.enterEmail('test@example.com');
    await forgotPasswordPage.submit();
    await forgotPasswordPage.waitForSuccessMessage();
    expect(page.url()).toContain(urls.forgotPassword);
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  test('should navigate back to login when Back to login is clicked', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.clickBackToLogin();
    await page.waitForURL(`**${urls.login}`);
    expect(page.url()).toContain(urls.login);
  });

  test('should navigate to forgot password directly via URL', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    expect(page.url()).toContain(urls.forgotPassword);
    await expect(page.locator('#email')).toBeVisible();
  });
});
