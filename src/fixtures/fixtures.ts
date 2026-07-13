import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { MonitorPage } from '@pages/MonitorPage';
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage';
import { AuditDetailPage } from '@pages/AuditDetailPage';
import { AuditCalendarPage } from '@pages/AuditCalendarPage';
import { QuickAuditPage } from '@pages/QuickAuditPage';
import { ReportsPage } from '@pages/ReportsPage';
import { GroupsPage } from '@pages/GroupsPage';
import { UsersPage } from '@pages/UsersPage';
import { ReviewQueuePage } from '@pages/ReviewQueuePage';
import { QuickAuditStartPage } from '@pages/QuickAuditStartPage';
import { SchedulingWizardPage } from '@pages/SchedulingWizardPage';
import { SchedulingPage } from '@pages/SchedulingPage';
import { UploadsPage } from '@pages/UploadsPage';
import { MessagingPage } from '@pages/MessagingPage';
import { SurveysPage } from '@pages/SurveysPage';
import { CustomQuestionsPage } from '@pages/CustomQuestionsPage';
import { QuestionOrderPage } from '@pages/QuestionOrderPage';
import { InitialAuditSetupPage } from '@pages/InitialAuditSetupPage';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  monitorPage: MonitorPage;
  forgotPasswordPage: ForgotPasswordPage;
  auditDetailPage: AuditDetailPage;
  auditCalendarPage: AuditCalendarPage;
  quickAuditPage: QuickAuditPage;
  reportsPage: ReportsPage;
  groupsPage: GroupsPage;
  usersPage: UsersPage;
  reviewQueuePage: ReviewQueuePage;
  quickAuditStartPage: QuickAuditStartPage;
  schedulingWizardPage: SchedulingWizardPage;
  schedulingPage: SchedulingPage;
  uploadsPage: UploadsPage;
  messagingPage: MessagingPage;
  surveysPage: SurveysPage;
  customQuestionsPage: CustomQuestionsPage;
  questionOrderPage: QuestionOrderPage;
  initialAuditSetupPage: InitialAuditSetupPage;
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
  reportsPage: async ({ page }, use) => {
    await use(new ReportsPage(page));
  },
  groupsPage: async ({ page }, use) => {
    await use(new GroupsPage(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
  reviewQueuePage: async ({ page }, use) => {
    await use(new ReviewQueuePage(page));
  },
  quickAuditStartPage: async ({ page }, use) => {
    await use(new QuickAuditStartPage(page));
  },
  schedulingWizardPage: async ({ page }, use) => {
    await use(new SchedulingWizardPage(page));
  },
  schedulingPage: async ({ page }, use) => {
    await use(new SchedulingPage(page));
  },
  uploadsPage: async ({ page }, use) => {
    await use(new UploadsPage(page));
  },
  messagingPage: async ({ page }, use) => {
    await use(new MessagingPage(page));
  },
  surveysPage: async ({ page }, use) => {
    await use(new SurveysPage(page));
  },
  customQuestionsPage: async ({ page }, use) => {
    await use(new CustomQuestionsPage(page));
  },
  questionOrderPage: async ({ page }, use) => {
    await use(new QuestionOrderPage(page));
  },
  initialAuditSetupPage: async ({ page }, use) => {
    await use(new InitialAuditSetupPage(page));
  },
});

export { expect } from '@playwright/test';
