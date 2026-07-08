import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { MonitorPage } from '@pages/MonitorPage';
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage';
import { AuditDetailPage } from '@pages/AuditDetailPage';
import { AuditCalendarPage } from '@pages/AuditCalendarPage';
import { QuickAuditPage } from '@pages/QuickAuditPage';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  monitorPage: MonitorPage;
  forgotPasswordPage: ForgotPasswordPage;
  auditDetailPage: AuditDetailPage;
  auditCalendarPage: AuditCalendarPage;
  quickAuditPage: QuickAuditPage;
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
  auditDetailPage: async ({ page }, use) => {
    await use(new AuditDetailPage(page));
  },
  auditCalendarPage: async ({ page }, use) => {
    await use(new AuditCalendarPage(page));
  },
  quickAuditPage: async ({ page }, use) => {
    await use(new QuickAuditPage(page));
  },
});

export { expect } from '@playwright/test';
