import { test, expect } from '../src/fixtures/fixtures';
import { users, urls } from '../src/data/testData';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.validUser.email, users.validUser.password);
    await page.waitForURL(`**${urls.dashboard}`, { timeout: 20000 });
    // Wait for the Angular components to finish rendering their API-driven content
    await page.locator('.kpi-grid').waitFor({ state: 'visible', timeout: 15000 });
  });

  // ── Auth & Header ──────────────────────────────────────────────────────────
  test.describe('Header', () => {
    test('should display the logged-in user email', async ({ dashboardPage }) => {
      expect(await dashboardPage.getLoggedInEmail()).toBe(users.validUser.email);
    });

    test('should display the logged-in user role', async ({ dashboardPage }) => {
      const role = await dashboardPage.getLoggedInRole();
      expect(role.length).toBeGreaterThan(0);
    });

    test('should display the organisation name', async ({ dashboardPage }) => {
      const org = await dashboardPage.getOrgName();
      expect(org.length).toBeGreaterThan(0);
    });

    test('should show the group switcher with group count', async ({ dashboardPage }) => {
      const count = await dashboardPage.getGroupSwitcherCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should show the notifications badge', async ({ dashboardPage }) => {
      expect(await dashboardPage.isNotificationsBadgeVisible()).toBe(true);
      const badge = await dashboardPage.getNotificationsBadgeText();
      expect(badge.length).toBeGreaterThan(0);
    });

    test('should display the theme toggle button', async ({ dashboardPage }) => {
      const label = await dashboardPage.getThemeToggleLabel();
      expect(label).toBeTruthy();
    });

    test('should sign out and redirect to login', async ({ dashboardPage, page }) => {
      await dashboardPage.signOut();
      await page.waitForURL(/\/auth\/login/, { timeout: 20000 });
      expect(page.url()).toContain(urls.login);
    });
  });

  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  test.describe('Breadcrumb', () => {
    test('should display the organisation in the breadcrumb', async ({ dashboardPage }) => {
      const org = await dashboardPage.getBreadcrumbOrg();
      expect(org.length).toBeGreaterThan(0);
    });

    test('should display the page context in the breadcrumb', async ({ dashboardPage }) => {
      const pg = await dashboardPage.getBreadcrumbPage();
      expect(pg.length).toBeGreaterThan(0);
    });
  });

  // ── Page Header ────────────────────────────────────────────────────────────
  test.describe('Page Header', () => {
    test('should display "Dashboard" as the page title', async ({ dashboardPage }) => {
      expect(await dashboardPage.getPageTitle()).toBe('Dashboard');
    });

    test('should display the page subtitle', async ({ dashboardPage }) => {
      const subtitle = await dashboardPage.getPageSubtitle();
      expect(subtitle.length).toBeGreaterThan(0);
    });
  });

  // ── KPI Cards ──────────────────────────────────────────────────────────────
  test.describe('KPI Cards', () => {
    test('should display 7 KPI cards', async ({ dashboardPage }) => {
      expect(await dashboardPage.getKpiCardCount()).toBe(7);
    });

    test('should display 2 alert (overdue) KPI cards', async ({ dashboardPage }) => {
      expect(await dashboardPage.getAlertKpiCardCount()).toBe(2);
    });

    test('should display all expected KPI labels', async ({ dashboardPage }) => {
      const labels = await dashboardPage.getKpiLabels();
      expect(labels.some(l => l.includes('Due in 7 Days'))).toBe(true);
      expect(labels.some(l => l.includes('Due Today'))).toBe(true);
      expect(labels.some(l => l.includes('In Progress'))).toBe(true);
      expect(labels.some(l => l.includes('Audits Overdue'))).toBe(true);
      expect(labels.some(l => l.includes('Completed'))).toBe(true);
      expect(labels.some(l => l.includes('Open Tasks'))).toBe(true);
      expect(labels.some(l => l.includes('Overdue Tasks'))).toBe(true);
    });

    test('should show a numeric value on each KPI card', async ({ dashboardPage }) => {
      for (const label of ['Due in 7 Days', 'Due Today', 'In Progress', 'Open Tasks']) {
        const value = await dashboardPage.getKpiValue(label);
        expect(Number.isNaN(parseInt(value, 10))).toBe(false);
      }
    });

    test('KPI grid should be visible', async ({ dashboardPage }) => {
      expect(await dashboardPage.isKpiGridVisible()).toBe(true);
    });
  });

  // ── Overall Score ──────────────────────────────────────────────────────────
  test.describe('Overall Score', () => {
    test('should display the overall score percentage', async ({ dashboardPage }) => {
      const pct = await dashboardPage.getOverallScorePct();
      expect(pct).toMatch(/\d+%/);
    });

    test('should display the overall score band', async ({ dashboardPage }) => {
      const band = await dashboardPage.getOverallScoreBand();
      expect(band.length).toBeGreaterThan(0);
    });

    test('should display 5 CQC score category bars', async ({ dashboardPage }) => {
      expect(await dashboardPage.getScoreBarCount()).toBe(5);
    });

    test('should display the correct CQC score bar categories', async ({ dashboardPage }) => {
      const cats = await dashboardPage.getScoreBarCategories();
      expect(cats).toContain('Safe');
      expect(cats).toContain('Effective');
      expect(cats).toContain('Well-Led');
      expect(cats).toContain('Responsive');
      expect(cats).toContain('Caring');
    });
  });

  // ── CQC Rating Groups ──────────────────────────────────────────────────────
  test.describe('CQC Rating Groups', () => {
    test('should display 5 CQC rating group cards', async ({ dashboardPage }) => {
      expect(await dashboardPage.getCqcCardCount()).toBe(5);
    });

    test('should display the 5 correct CQC categories', async ({ dashboardPage }) => {
      const cats = await dashboardPage.getCqcCategories();
      expect(cats).toContain('Safe');
      expect(cats).toContain('Effective');
      expect(cats).toContain('Well-Led');
      expect(cats).toContain('Responsive');
      expect(cats).toContain('Caring');
    });

    test('each CQC card should show a rating badge', async ({ dashboardPage }) => {
      for (const cat of ['Safe', 'Effective', 'Well-Led', 'Responsive', 'Caring']) {
        const rating = await dashboardPage.getCqcCardRating(cat);
        expect(rating.length).toBeGreaterThan(0);
      }
    });

    test('each CQC card should show a numeric percentage', async ({ dashboardPage }) => {
      for (const cat of ['Safe', 'Effective', 'Well-Led', 'Responsive', 'Caring']) {
        const pct = await dashboardPage.getCqcCardPct(cat);
        expect(Number.isNaN(parseInt(pct, 10))).toBe(false);
      }
    });
  });

  // ── Activity Card ──────────────────────────────────────────────────────────
  test.describe('Activity Card', () => {
    test('should display 3 activity items', async ({ dashboardPage }) => {
      expect(await dashboardPage.getActivityItemCount()).toBe(3);
    });

    test('should show the expected activity labels', async ({ dashboardPage }) => {
      const labels = await dashboardPage.getActivityLabels();
      expect(labels).toContain('Automatic Tasks');
      expect(labels).toContain('Manual Tasks');
      expect(labels).toContain('Auditors with Data');
    });
  });

  // ── Score Bands ────────────────────────────────────────────────────────────
  test.describe('Score Bands', () => {
    test('should display 4 compliance score bands', async ({ dashboardPage }) => {
      expect(await dashboardPage.getScoreBandCount()).toBe(4);
    });

    test('should display all compliance band names', async ({ dashboardPage }) => {
      const names = await dashboardPage.getScoreBandNames();
      expect(names).toContain('Outstanding');
      expect(names).toContain('Good');
      expect(names).toContain('Requires Improvement');
      expect(names).toContain('Inadequate');
    });
  });

  // ── Group Comparison Table ─────────────────────────────────────────────────
  test.describe('Group Comparison Table', () => {
    test('should display the group comparison section', async ({ dashboardPage }) => {
      expect(await dashboardPage.isGroupComparisonVisible()).toBe(true);
    });

    test('should have the correct column headers', async ({ dashboardPage }) => {
      const headers = await dashboardPage.getGroupComparisonHeaders();
      expect(headers).toContain('Group');
      expect(headers).toContain('Manager');
      expect(headers).toContain('Safe');
      expect(headers).toContain('Effective');
      expect(headers).toContain('Well-Led');
      expect(headers).toContain('Responsive');
      expect(headers).toContain('Caring');
    });

    test('should show pagination text', async ({ dashboardPage }) => {
      const text = await dashboardPage.getGroupComparisonPaginationText();
      expect(text).toMatch(/Showing\s+\d+–\d+\s+of\s+\d+/);
    });

    test('should disable the Prev button on the first page', async ({ dashboardPage }) => {
      expect(await dashboardPage.isGroupComparisonPrevDisabled()).toBe(true);
    });

    test('should display 5 rows on the first page', async ({ dashboardPage }) => {
      expect(await dashboardPage.getGroupComparisonRowCount()).toBe(5);
    });

    test('should navigate to the next page and show different rows', async ({ dashboardPage }) => {
      const firstPagePagination = await dashboardPage.getGroupComparisonPaginationText();
      await dashboardPage.clickGroupComparisonNext();
      const secondPagePagination = await dashboardPage.getGroupComparisonPaginationText();
      expect(secondPagePagination).not.toBe(firstPagePagination);
    });
  });

  // ── All Groups Table ───────────────────────────────────────────────────────
  test.describe('All Groups Table', () => {
    test('should display the All Groups section', async ({ dashboardPage }) => {
      expect(await dashboardPage.isAllGroupsVisible()).toBe(true);
    });

    test('should show pagination with group count', async ({ dashboardPage }) => {
      const text = await dashboardPage.getAllGroupsPaginationText();
      expect(text).toMatch(/\d+–\d+ of \d+/);
    });

    test('should navigate to Groups & Structure when Manage is clicked', async ({ dashboardPage, page }) => {
      await dashboardPage.clickAllGroupsManage();
      await page.waitForURL(/\/setup\/groups/, { timeout: 10000 });
      expect(page.url()).toContain('/setup/groups');
    });
  });

  // ── All Users Table ────────────────────────────────────────────────────────
  test.describe('All Users Table', () => {
    test('should display the All Users section', async ({ dashboardPage }) => {
      expect(await dashboardPage.isAllUsersVisible()).toBe(true);
    });

    test('should show pagination with user count', async ({ dashboardPage }) => {
      const text = await dashboardPage.getAllUsersPaginationText();
      expect(text).toMatch(/\d+–\d+ of \d+/);
    });

    test('should show the current user at the top of the list', async ({ dashboardPage }) => {
      const firstName = await dashboardPage.getFirstUserName();
      expect(firstName.length).toBeGreaterThan(0);
    });

    test('should navigate to User Management when Manage is clicked', async ({ dashboardPage, page }) => {
      await dashboardPage.clickAllUsersManage();
      await page.waitForURL(/\/setup\/users/, { timeout: 10000 });
      expect(page.url()).toContain('/setup/users');
    });
  });

  // ── Sidebar Navigation ─────────────────────────────────────────────────────
  test.describe('Sidebar', () => {
    test('should display sidebar navigation links', async ({ dashboardPage }) => {
      const links = await dashboardPage.getSidebarLinks();
      expect(links.length).toBeGreaterThan(0);
      expect(links).toContain('Dashboard');
    });

    test('should navigate to Monitor via sidebar', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateViaSidebar('Monitor');
      await page.waitForURL(/\/monitor/, { timeout: 10000 });
      expect(page.url()).toContain('/monitor');
    });

    test('should navigate to Reports via sidebar', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateViaSidebar('Reports');
      await page.waitForURL(/\/reports/, { timeout: 10000 });
      expect(page.url()).toContain('/reports');
    });
  });

  // ── Data Accuracy ──────────────────────────────────────────────────────────
  // Each test reloads the page and captures /api/dashboard/stats before asserting,
  // so the UI value and the API value are read from the same server snapshot.
  test.describe('Data Accuracy – numbers match the API', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiStats: any;

    test.beforeEach(async ({ page }) => {
      const statsPromise = page.waitForResponse(
        (r) => r.url().includes('/api/dashboard/stats') && r.status() === 200,
      );
      await page.reload();
      const statsResponse = await statsPromise;
      apiStats = await statsResponse.json();
      await page.locator('.kpi-grid').waitFor({ state: 'visible', timeout: 15000 });
    });

    // ── KPI cards ──────────────────────────────────────────────────────────────
    test.describe('KPI Cards', () => {
      test('Due in 7 Days matches API', async ({ dashboardPage }) => {
        const ui = parseInt(await dashboardPage.getKpiValue('Due in 7 Days'), 10);
        expect(ui).toBe(apiStats.kpi.auditsDue7Days);
      });

      test('Due Today matches API', async ({ dashboardPage }) => {
        const ui = parseInt(await dashboardPage.getKpiValue('Due Today'), 10);
        expect(ui).toBe(apiStats.kpi.auditsDueToday);
      });

      test('In Progress matches API', async ({ dashboardPage }) => {
        const ui = parseInt(await dashboardPage.getKpiValue('In Progress'), 10);
        expect(ui).toBe(apiStats.kpi.auditsInProgress);
      });

      test('Audits Overdue matches API', async ({ dashboardPage }) => {
        const ui = parseInt(await dashboardPage.getKpiValue('Audits Overdue'), 10);
        expect(ui).toBe(apiStats.kpi.auditsOverdue);
      });

      test('Completed 30d matches API', async ({ dashboardPage }) => {
        const ui = parseInt(await dashboardPage.getKpiValue('Completed 30d'), 10);
        expect(ui).toBe(apiStats.kpi.completed30Days);
      });

      test('Open Tasks matches API', async ({ dashboardPage }) => {
        const ui = parseInt(await dashboardPage.getKpiValue('Open Tasks'), 10);
        expect(ui).toBe(apiStats.kpi.openTasks);
      });

      test('Overdue Tasks matches API', async ({ dashboardPage }) => {
        const ui = parseInt(await dashboardPage.getKpiValue('Overdue Tasks'), 10);
        expect(ui).toBe(apiStats.kpi.overdueTasks);
      });
    });

    // ── Overall score ring ─────────────────────────────────────────────────────
    test.describe('Overall Score Ring', () => {
      test('score ring percentage matches API', async ({ dashboardPage }) => {
        const raw = await dashboardPage.getOverallScorePct();
        const ui = parseInt(raw.replace('%', ''), 10);
        expect(ui).toBe(Math.round(apiStats.kpi.overallCompliance));
      });
    });

    // ── Activity card ──────────────────────────────────────────────────────────
    test.describe('Activity Card', () => {
      test('Automatic Tasks total matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getActivityItemTotal('Automatic Tasks');
        expect(ui).toBe(apiStats.actions.correctiveActionTasks);
      });

      test('Automatic Tasks pending badge matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getActivityItemPending('Automatic Tasks');
        expect(ui).toBe(apiStats.actions.correctiveActionPending);
      });

      test('Manual Tasks total matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getActivityItemTotal('Manual Tasks');
        expect(ui).toBe(apiStats.actions.manualTasks);
      });

      test('Manual Tasks pending badge matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getActivityItemPending('Manual Tasks');
        expect(ui).toBe(apiStats.actions.manualTasksPending);
      });

      test('Auditors with Data total matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getActivityItemTotal('Auditors with Data');
        expect(ui).toBe(apiStats.actions.auditorsWithData);
      });
    });

    // ── Score bands ────────────────────────────────────────────────────────────
    test.describe('Score Bands', () => {
      test('Outstanding count matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getScoreBandValue('Outstanding');
        expect(ui).toBe(apiStats.scoreBands.outstanding);
      });

      test('Good count matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getScoreBandValue('Good');
        expect(ui).toBe(apiStats.scoreBands.good);
      });

      test('Requires Improvement count matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getScoreBandValue('Requires Improvement');
        expect(ui).toBe(apiStats.scoreBands.requiresImprovement);
      });

      test('Inadequate count matches API', async ({ dashboardPage }) => {
        const ui = await dashboardPage.getScoreBandValue('Inadequate');
        expect(ui).toBe(apiStats.scoreBands.inadequate);
      });
    });

    // ── CQC rating cards ──────────────────────────────────────────────────────
    test.describe('CQC Rating Cards', () => {
      const cqcCategories = ['Safe', 'Effective', 'Well-Led', 'Responsive', 'Caring'];

      for (const category of cqcCategories) {
        test(`${category} – score ring matches API`, async ({ dashboardPage }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiCard = apiStats.cqcRatings.find((r: any) => r.category === category);
          const ui = parseInt(await dashboardPage.getCqcCardPct(category), 10);
          expect(ui).toBe(Math.round(apiCard.currentlyScore));
        });

        test(`${category} – rating badge matches API`, async ({ dashboardPage }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiCard = apiStats.cqcRatings.find((r: any) => r.category === category);
          const ui = await dashboardPage.getCqcCardRating(category);
          expect(ui.toLowerCase()).toBe(apiCard.band.toLowerCase());
        });

        test(`${category} – Yes count matches API`, async ({ dashboardPage }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiCard = apiStats.cqcRatings.find((r: any) => r.category === category);
          const ui = await dashboardPage.getCqcCardYesCount(category);
          expect(ui).toBe(apiCard.currentlyYesCount);
        });

        test(`${category} – No count matches API`, async ({ dashboardPage }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiCard = apiStats.cqcRatings.find((r: any) => r.category === category);
          const ui = await dashboardPage.getCqcCardNoCount(category);
          expect(ui).toBe(apiCard.currentlyNoCount);
        });

        test(`${category} – N/A count matches API`, async ({ dashboardPage }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiCard = apiStats.cqcRatings.find((r: any) => r.category === category);
          const ui = await dashboardPage.getCqcCardNaCount(category);
          expect(ui).toBe(apiCard.currentlyNaCount);
        });
      }
    });
  });

  // ── Cross-page consistency ─────────────────────────────────────────────────
  // Each test reads the dashboard value then navigates to Monitor and reads the
  // same metric there, asserting both pages show the same number.
  // Note: "Open Tasks" is not present on the Monitor page and is intentionally
  // omitted. "Audits Overdue" is labelled "Overdue Audits" on the Monitor page.
  test.describe('KPI numbers match Monitor page', () => {
    test('In Progress count matches Monitor', async ({ dashboardPage, monitorPage, page }) => {
      const dashValue = parseInt(await dashboardPage.getKpiValue('In Progress'), 10);

      await dashboardPage.navigateViaSidebar('Monitor');
      await page.waitForURL(/\/monitor/, { timeout: 15000 });
      await monitorPage.waitForLoad();

      const monitorValue = await monitorPage.getKpiValue('In Progress');
      expect(monitorValue).toBe(dashValue);
    });

    test('Audits Overdue count matches Monitor', async ({ dashboardPage, monitorPage, page }) => {
      const dashValue = parseInt(await dashboardPage.getKpiValue('Audits Overdue'), 10);

      await dashboardPage.navigateViaSidebar('Monitor');
      await page.waitForURL(/\/monitor/, { timeout: 15000 });
      await monitorPage.waitForLoad();

      // On Monitor the same metric is labelled "Overdue Audits"
      const monitorValue = await monitorPage.getKpiValue('Overdue Audits');
      expect(monitorValue).toBe(dashValue);
    });

    test('Completed 30d count matches Monitor', async ({ dashboardPage, monitorPage, page }) => {
      const dashValue = parseInt(await dashboardPage.getKpiValue('Completed 30d'), 10);

      await dashboardPage.navigateViaSidebar('Monitor');
      await page.waitForURL(/\/monitor/, { timeout: 15000 });
      await monitorPage.waitForLoad();

      // On Monitor this is shown as a chip "Completed N" rather than a KPI card
      const monitorValue = await monitorPage.getCompletedCount();
      expect(monitorValue).toBe(dashValue);
    });

    test('Overdue Tasks count matches Monitor', async ({ dashboardPage, monitorPage, page }) => {
      const dashValue = parseInt(await dashboardPage.getKpiValue('Overdue Tasks'), 10);

      await dashboardPage.navigateViaSidebar('Monitor');
      await page.waitForURL(/\/monitor/, { timeout: 15000 });
      await monitorPage.waitForLoad();

      const monitorValue = await monitorPage.getKpiValue('Overdue Tasks');
      expect(monitorValue).toBe(dashValue);
    });
  });
});
