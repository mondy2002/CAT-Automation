import { test, expect } from '../src/fixtures/fixtures';
import { users, messages, urls } from '../src/data/testData';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ── Existing core tests ────────────────────────────────────────────────────
  test('should redirect to dashboard after valid login', async ({ loginPage, page }) => {
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 10000 });
    expect(page.url()).toContain(urls.dashboard);
  });

  test('should show error with invalid credentials', async ({ loginPage }) => {
    await loginPage.login(users.invalidUser.email, users.invalidUser.password);
    expect(await loginPage.isErrorVisible()).toBe(true);
    expect(await loginPage.getErrorMessage()).toContain(messages.invalidCredentials);
  });

  test('should navigate to forgot password page', async ({ loginPage, page }) => {
    await loginPage.clickForgotPassword();
    await page.waitForURL(`**${urls.forgotPassword}`);
    expect(page.url()).toContain(urls.forgotPassword);
  });

  test('should toggle password visibility', async ({ loginPage }) => {
    expect(await loginPage.getPasswordInputType()).toBe('password');
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordInputType()).toBe('text');
  });

  test('should check remember me checkbox', async ({ loginPage }) => {
    expect(await loginPage.isRememberMeChecked()).toBe(false);
    await loginPage.checkRememberMe();
    expect(await loginPage.isRememberMeChecked()).toBe(true);
  });

  // ── Page structure ─────────────────────────────────────────────────────────
  test('should display the email input field', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
  });

  test('should display the password input field', async ({ page }) => {
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should have email input of type email', async ({ page }) => {
    const type = await page.locator('#email').getAttribute('type');
    expect(type).toBe('email');
  });

  test('should have password input of type password by default', async ({ page }) => {
    const type = await page.locator('#password').getAttribute('type');
    expect(type).toBe('password');
  });

  test('should display the sign-in submit button', async ({ page }) => {
    await expect(page.locator('button.sign-in-btn[type="submit"]')).toBeVisible();
  });

  test('should display the forgot password link', async ({ page }) => {
    await expect(page.locator('a.forgot-link')).toBeVisible();
  });

  test('should display the remember me label', async ({ page }) => {
    await expect(page.locator('label.remember-row')).toBeVisible();
  });

  test('should load on the correct URL', async ({ page }) => {
    expect(page.url()).toContain(urls.login);
  });

  // ── Validation & error handling ────────────────────────────────────────────
  test('should show error when submitting with wrong password only', async ({ loginPage }) => {
    await loginPage.login(users.validUser.email, 'WrongPassword999!');
    expect(await loginPage.isErrorVisible()).toBe(true);
    expect(await loginPage.getErrorMessage()).toContain(messages.invalidCredentials);
  });

  test('should show error when submitting with wrong email only', async ({ loginPage }) => {
    await loginPage.login('nobody@nowhere.invalid', users.validUser.password);
    expect(await loginPage.isErrorVisible()).toBe(true);
    expect(await loginPage.getErrorMessage()).toContain(messages.invalidCredentials);
  });

  test('should not log in when credentials are empty', async ({ page }) => {
    // Angular form silently blocks submission with empty fields — verify no navigation occurs
    await page.locator('button.sign-in-btn[type="submit"]').click();
    await page.waitForTimeout(1500);
    expect(page.url()).toContain(urls.login);
  });

  test('should stay on login page after failed login', async ({ loginPage, page }) => {
    await loginPage.login(users.invalidUser.email, users.invalidUser.password);
    await loginPage.isErrorVisible();
    expect(page.url()).toContain(urls.login);
  });

  test('should show error for invalid email format', async ({ loginPage, page }) => {
    await page.locator('#email').fill('notavalidemail');
    await page.locator('#password').fill('somepassword');
    await page.locator('button.sign-in-btn[type="submit"]').click();
    const serverError = await loginPage.isErrorVisible().catch(() => false);
    const fieldError = await page.locator('.field-error').isVisible().catch(() => false);
    expect(serverError || fieldError).toBe(true);
  });

  test('should hide password after toggling visibility twice', async ({ loginPage }) => {
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordInputType()).toBe('text');
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordInputType()).toBe('password');
  });

  test('should uncheck remember me after clicking twice', async ({ loginPage }) => {
    await loginPage.checkRememberMe();
    expect(await loginPage.isRememberMeChecked()).toBe(true);
    await loginPage.checkRememberMe();
    expect(await loginPage.isRememberMeChecked()).toBe(false);
  });
});
