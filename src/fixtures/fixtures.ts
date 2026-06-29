import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { MonitorPage } from '@pages/MonitorPage';
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  monitorPage: MonitorPage;
  forgotPasswordPage: ForgotPasswordPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  monitorPage: async ({ page }, use) => {
    await use(new MonitorPage(page));
  },
  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },
});

export { expect } from '@playwright/test';
