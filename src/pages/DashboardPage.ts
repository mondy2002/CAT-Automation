import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // ── Header ────────────────────────────────────────────────────────────────
  private readonly userMenuButton: Locator;
  private readonly userEmail: Locator;
  private readonly userRole: Locator;
  private readonly signOutButton: Locator;
  private readonly signOutConfirmButton: Locator;
  private readonly notificationsButton: Locator;
  private readonly notificationsBadge: Locator;
  private readonly themeToggleButton: Locator;
  private readonly orgSwitcherButton: Locator;
  private readonly groupSwitcherButton: Locator;
  private readonly groupSwitcherCount: Locator;
  private readonly orgName: Locator;

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  private readonly breadcrumbOrg: Locator;
  private readonly breadcrumbPage: Locator;

  // ── Sidebar ───────────────────────────────────────────────────────────────
  private readonly sidebarNav: Locator;

  // ── Page header ───────────────────────────────────────────────────────────
  private readonly pageTitle: Locator;
  private readonly pageSubtitle: Locator;

  // ── KPI cards ─────────────────────────────────────────────────────────────
  private readonly kpiGrid: Locator;
  private readonly kpiCards: Locator;
  private readonly alertKpiCards: Locator;

  // ── Overall score ─────────────────────────────────────────────────────────
  private readonly scoreRingPct: Locator;
  private readonly scoreLabelBand: Locator;
  private readonly scoreBarsRows: Locator;

  // ── CQC rating groups ─────────────────────────────────────────────────────
  private readonly cqcGrid: Locator;
  private readonly cqcCards: Locator;

  // ── Activity card ─────────────────────────────────────────────────────────
  private readonly activityItems: Locator;

  // ── Score bands ───────────────────────────────────────────────────────────
  private readonly scoreBandItems: Locator;

  // ── Group comparison table ────────────────────────────────────────────────
  private readonly groupComparisonCard: Locator;
  private readonly groupComparisonPaginationInfo: Locator;
  private readonly groupComparisonNextBtn: Locator;
  private readonly groupComparisonPrevBtn: Locator;

  // ── All Groups table ──────────────────────────────────────────────────────
  private readonly allGroupsCard: Locator;
  private readonly allGroupsManageBtn: Locator;
  private readonly allGroupsPaginationInfo: Locator;

  // ── All Users table ───────────────────────────────────────────────────────
  private readonly allUsersCard: Locator;
  private readonly allUsersManageBtn: Locator;
  private readonly allUsersPaginationInfo: Locator;

  constructor(page: Page) {
    super(page);

    // Header
    this.userMenuButton = this.locator('button.nav-btn-user');
    this.userEmail = this.locator('.user-email');
    this.userRole = this.locator('.user-role');
    this.signOutButton = this.locator('button[title="Sign out"]');
    this.signOutConfirmButton = this.getByRole('button', { name: 'Yes, sign out' });
    this.notificationsButton = this.locator('button[title="Notifications"]');
    this.notificationsBadge = this.locator('.notification-badge');
    this.themeToggleButton = this.locator('button.theme-toggle-btn');
    this.orgSwitcherButton = this.locator('button[title="Switch organisation"]');
    this.groupSwitcherButton = this.locator('button[title="Switch group"]');
    this.groupSwitcherCount = this.locator('.grp-trigger-count');
    this.orgName = this.locator('.org-trigger-name');

    // Breadcrumb
    this.breadcrumbOrg = this.locator('.breadcrumb-org');
    this.breadcrumbPage = this.locator('.breadcrumb-page');

    // Sidebar
    this.sidebarNav = this.locator('aside.sidebar nav');

    // Page header
    this.pageTitle = this.locator('h1.pg-title');
    this.pageSubtitle = this.locator('p.pg-subtitle');

    // KPI
    this.kpiGrid = this.locator('.kpi-grid');
    this.kpiCards = this.locator('.kpi-card');
    this.alertKpiCards = this.locator('.kpi-card--alert');

    // Score
    this.scoreRingPct = this.locator('.score-ring-pct');
    this.scoreLabelBand = this.locator('.score-label-band');
    this.scoreBarsRows = this.locator('.score-bar-row');

    // CQC
    this.cqcGrid = this.locator('.cqc-grid');
    this.cqcCards = this.locator('.cqc-card');

    // Activity
    this.activityItems = this.locator('.act-item');

    // Score bands
    this.scoreBandItems = this.locator('.band-item');

    // Group Comparison
    this.groupComparisonCard = this.locator('.card').filter({ hasText: 'Group Comparison' });
    this.groupComparisonPaginationInfo = this.locator('.gc-page-info');
    this.groupComparisonNextBtn = this.locator('.gc-nav-btn').filter({ hasText: 'Next' });
    this.groupComparisonPrevBtn = this.locator('.gc-nav-btn').filter({ hasText: 'Prev' });

    // All Groups
    this.allGroupsCard = this.locator('.card').filter({ hasText: 'All Groups' }).first();
    this.allGroupsManageBtn = this.allGroupsCard.locator('.manage-btn');
    this.allGroupsPaginationInfo = this.allGroupsCard.locator('.page-info');

    // All Users
    this.allUsersCard = this.locator('.card').filter({ hasText: 'All Users' });
    this.allUsersManageBtn = this.allUsersCard.locator('.manage-btn');
    this.allUsersPaginationInfo = this.allUsersCard.locator('.page-info');
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  async goto(): Promise<void> {
    await this.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  async navigateViaSidebar(linkText: string): Promise<void> {
    // Use sidebar-child-link to avoid strict-mode collision with most-visited section
    const link = this.sidebarNav
      .locator('a.sidebar-child-link')
      .filter({ hasText: linkText })
      .first();
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  async isLoggedIn(): Promise<boolean> {
    return this.userMenuButton.isVisible();
  }

  async getLoggedInEmail(): Promise<string> {
    return (await this.userEmail.textContent()) ?? '';
  }

  async getLoggedInRole(): Promise<string> {
    return (await this.userRole.textContent()) ?? '';
  }

  async getOrgName(): Promise<string> {
    return (await this.orgName.textContent()) ?? '';
  }

  async getGroupSwitcherCount(): Promise<number> {
    const text = (await this.groupSwitcherCount.textContent()) ?? '0';
    return parseInt(text.trim(), 10);
  }

  async getNotificationsBadgeText(): Promise<string> {
    return (await this.notificationsBadge.textContent())?.trim() ?? '';
  }

  async isNotificationsBadgeVisible(): Promise<boolean> {
    await this.notificationsBadge.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return this.notificationsBadge.isVisible();
  }

  async getThemeToggleLabel(): Promise<string | null> {
    return this.themeToggleButton.getAttribute('title');
  }

  async clickThemeToggle(): Promise<void> {
    await this.themeToggleButton.click();
  }

  async clickOrgSwitcher(): Promise<void> {
    await this.orgSwitcherButton.click();
  }

  async clickGroupSwitcher(): Promise<void> {
    await this.groupSwitcherButton.click();
  }

  async signOut(): Promise<void> {
    await this.signOutButton.waitFor({ state: 'visible' });
    await this.signOutButton.click();
    await this.signOutConfirmButton.waitFor({ state: 'visible' });
    await this.signOutConfirmButton.click();
  }

  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  async getBreadcrumbOrg(): Promise<string> {
    return (await this.breadcrumbOrg.textContent()) ?? '';
  }

  async getBreadcrumbPage(): Promise<string> {
    return (await this.breadcrumbPage.textContent()) ?? '';
  }

  // ── Page header ────────────────────────────────────────────────────────────
  async getPageTitle(): Promise<string> {
    return (await this.pageTitle.textContent()) ?? '';
  }

  async getPageSubtitle(): Promise<string> {
    return (await this.pageSubtitle.textContent()) ?? '';
  }

  // ── KPI cards ──────────────────────────────────────────────────────────────
  async getKpiCardCount(): Promise<number> {
    return this.kpiCards.count();
  }

  async getAlertKpiCardCount(): Promise<number> {
    return this.alertKpiCards.count();
  }

  async getKpiValue(label: string): Promise<string> {
    const card = this.kpiCards.filter({ hasText: label });
    return (await card.locator('.kpi-num').textContent())?.trim() ?? '';
  }

  async getKpiLabels(): Promise<string[]> {
    const labels = this.kpiCards.locator('.kpi-label');
    const count = await labels.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  async isKpiGridVisible(): Promise<boolean> {
    return this.kpiGrid.isVisible();
  }

  // ── Overall score ──────────────────────────────────────────────────────────
  async getOverallScorePct(): Promise<string> {
    return (await this.scoreRingPct.textContent())?.trim() ?? '';
  }

  async getOverallScoreBand(): Promise<string> {
    return (await this.scoreLabelBand.textContent())?.trim() ?? '';
  }

  async getScoreBarCount(): Promise<number> {
    return this.scoreBarsRows.count();
  }

  async getScoreBarCategories(): Promise<string[]> {
    const cats = this.scoreBarsRows.locator('.score-bar-cat');
    const count = await cats.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cats.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  // ── CQC rating groups ──────────────────────────────────────────────────────
  async getCqcCardCount(): Promise<number> {
    return this.cqcCards.count();
  }

  async getCqcCategories(): Promise<string[]> {
    const cats = this.cqcCards.locator('.cqc-cat');
    const count = await cats.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cats.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  async getCqcCardRating(category: string): Promise<string> {
    const card = this.cqcCards.filter({ hasText: category });
    return (await card.locator('.cqc-badge').textContent())?.trim() ?? '';
  }

  async getCqcCardPct(category: string): Promise<string> {
    const card = this.cqcCards.filter({ hasText: category });
    return (await card.locator('.cqc-ring-pct').textContent())?.trim().replace('%', '') ?? '';
  }

  // ── Activity card ──────────────────────────────────────────────────────────
  async getActivityItemCount(): Promise<number> {
    return this.activityItems.count();
  }

  async getActivityLabels(): Promise<string[]> {
    const labels = this.activityItems.locator('.act-lbl');
    const count = await labels.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  // ── Score bands ────────────────────────────────────────────────────────────
  async getScoreBandCount(): Promise<number> {
    return this.scoreBandItems.count();
  }

  async getScoreBandNames(): Promise<string[]> {
    const names = this.scoreBandItems.locator('.band-name');
    const count = await names.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await names.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  // ── Group comparison table ─────────────────────────────────────────────────
  async isGroupComparisonVisible(): Promise<boolean> {
    return this.groupComparisonCard.isVisible();
  }

  async getGroupComparisonHeaders(): Promise<string[]> {
    const headers = this.groupComparisonCard.locator('th');
    const count = await headers.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  async getGroupComparisonPaginationText(): Promise<string> {
    return (await this.groupComparisonPaginationInfo.textContent())?.trim() ?? '';
  }

  async clickGroupComparisonNext(): Promise<void> {
    await this.groupComparisonNextBtn.click();
  }

  async isGroupComparisonPrevDisabled(): Promise<boolean> {
    return (await this.groupComparisonPrevBtn.getAttribute('disabled')) !== null;
  }

  async getGroupComparisonRowCount(): Promise<number> {
    return this.groupComparisonCard.locator('tbody tr').count();
  }

  // ── All Groups table ───────────────────────────────────────────────────────
  async isAllGroupsVisible(): Promise<boolean> {
    return this.allGroupsCard.isVisible();
  }

  async getAllGroupsPaginationText(): Promise<string> {
    return (await this.allGroupsPaginationInfo.textContent())?.trim() ?? '';
  }

  async clickAllGroupsManage(): Promise<void> {
    await this.allGroupsManageBtn.click();
  }

  // ── All Users table ────────────────────────────────────────────────────────
  async isAllUsersVisible(): Promise<boolean> {
    return this.allUsersCard.isVisible();
  }

  async getAllUsersPaginationText(): Promise<string> {
    return (await this.allUsersPaginationInfo.textContent())?.trim() ?? '';
  }

  async getFirstUserName(): Promise<string> {
    const firstRow = this.allUsersCard.locator('tbody tr').first();
    return (await firstRow.locator('.td-bold').textContent())?.trim() ?? '';
  }

  async clickAllUsersManage(): Promise<void> {
    await this.allUsersManageBtn.click();
  }

  // ── Activity card (granular) ───────────────────────────────────────────────
  async getActivityItemTotal(label: string): Promise<number> {
    const item = this.activityItems.filter({ hasText: label });
    const text = (await item.locator('.act-num').textContent())?.trim() ?? '0';
    return parseInt(text, 10);
  }

  async getActivityItemPending(label: string): Promise<number> {
    const item = this.activityItems.filter({ hasText: label });
    const badge = (await item.locator('.act-badge').textContent())?.trim() ?? '0';
    return parseInt(badge, 10);
  }

  // ── Score bands (granular) ─────────────────────────────────────────────────
  async getScoreBandValue(bandName: string): Promise<number> {
    const item = this.scoreBandItems.filter({ hasText: bandName });
    const text = (await item.locator('.band-count').textContent())?.trim() ?? '0';
    return parseInt(text, 10);
  }

  // ── CQC card stats (yes / no / n/a counts) ─────────────────────────────────
  async getCqcCardYesCount(category: string): Promise<number> {
    const card = this.cqcCards.filter({ hasText: category });
    const text = (await card.locator('.cqc-stat--y .cqc-stat-val').textContent())?.trim() ?? '0';
    return parseInt(text, 10);
  }

  async getCqcCardNoCount(category: string): Promise<number> {
    const card = this.cqcCards.filter({ hasText: category });
    const text = (await card.locator('.cqc-stat--n .cqc-stat-val').textContent())?.trim() ?? '0';
    return parseInt(text, 10);
  }

  async getCqcCardNaCount(category: string): Promise<number> {
    const card = this.cqcCards.filter({ hasText: category });
    const text = (await card.locator('.cqc-stat--na .cqc-stat-val').textContent())?.trim() ?? '0';
    return parseInt(text, 10);
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  async getSidebarLinks(): Promise<string[]> {
    const links = this.sidebarNav.locator('a.sidebar-child-link');
    const count = await links.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).locator('.sidebar-label-text').textContent();
      if (text) labels.push(text.trim());
    }
    return labels;
  }
}
