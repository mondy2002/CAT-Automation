# CAT Automation

End-to-end test automation suite for the CAT Client Portal, built with **Playwright** and **TypeScript** following the **Page Object Model (POM)** design pattern.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation & test runner |
| TypeScript | Strongly-typed test code |
| dotenv | Environment variable management |
| Page Object Model | Test architecture pattern |

---

## Project Structure

```
CAT-Automation/
├── src/
│   ├── pages/              # Page Object classes
│   │   ├── BasePage.ts           # Abstract base with shared helpers
│   │   ├── LoginPage.ts          # /auth/login
│   │   ├── ForgotPasswordPage.ts # /auth/forgot-password
│   │   ├── DashboardPage.ts      # /dashboard
│   │   └── MonitorPage.ts        # /monitor
│   ├── fixtures/
│   │   └── fixtures.ts     # Custom test fixtures (page object injection)
│   ├── data/
│   │   └── testData.ts     # Shared test data, URLs, and messages
│   └── utils/
│       ├── EmailClient.ts        # 1secmail disposable email client
│       └── MailinatorClient.ts   # (legacy — superseded by EmailClient)
├── tests/
│   ├── login.spec.ts           # Login page test cases
│   ├── forgot-password.spec.ts # Forgot password test cases
│   ├── dashboard.spec.ts       # Dashboard test cases
│   └── monitor.spec.ts         # Monitor page test cases
├── .env                    # Local credentials (gitignored)
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json           # TypeScript configuration
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install chromium
```

### 3. Configure environment variables

Create a `.env` file in the project root (already exists if cloned):

```env
BASE_URL=https://qc.catclientportal.co.uk
TEST_EMAIL=oa2@demo.local
TEST_PASSWORD=Demo!Pass123

# Optional — needed only to test the password reset email flow
# Register any @1secmail.com address as a user in the portal, then set it here
RESET_TEST_EMAIL=
```

> `.env` is gitignored — credentials are never committed to source control.

---

## Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all tests (Chrome + Mobile Chrome) |
| `npm run test:chromium` | Chrome only |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Step-through debugger |
| `npm run test:ui` | Playwright interactive UI |
| `npm run test:report` | Open the last HTML report |

### Run a specific spec

```bash
npx playwright test tests/login.spec.ts
npx playwright test tests/forgot-password.spec.ts
npx playwright test tests/dashboard.spec.ts
npx playwright test tests/monitor.spec.ts
```

### Run by test title (grep)

```bash
npx playwright test --grep "Data Accuracy"
npx playwright test --grep "KPI numbers match Monitor"
```

---

## Browsers

Tests run on **Chrome** and **Mobile Chrome (Pixel 5)** only.

Configured in `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
]
```

---

## Test Suites

### Login (`tests/login.spec.ts`) — 17 tests

| Category | Tests |
|---|---|
| Core auth | Valid login redirect, invalid credentials error |
| Page structure | Email/password fields visible, correct input types, submit button, forgot password link, remember me label |
| Validation | Wrong password, wrong email, empty credentials, invalid email format |
| UI behaviour | Password visibility toggle (on/off), remember me checkbox (check/uncheck) |

---

### Forgot Password (`tests/forgot-password.spec.ts`) — 16 tests

| Category | Tests |
|---|---|
| Page structure | URL, email input, placeholder text, submit button, back link |
| Submit button state | Disabled on empty, disabled on invalid format, enabled on valid email, disabled after clearing |
| Validation | Field error on invalid format, error clears on valid input |
| Success message | Generic message for unregistered email, same message for registered email, stays on page after submit |
| Navigation | Back to login link, direct URL access |

---

### Dashboard (`tests/dashboard.spec.ts`) — 90+ tests

| Describe block | What's tested |
|---|---|
| Header | Logged-in email, user role, org name, group switcher, notifications badge, theme toggle, sign-out flow |
| Breadcrumb | Organisation and page labels |
| Page Header | Title and subtitle text |
| KPI Cards | Card count, alert card count, correct labels displayed |
| Overall Score | Ring percentage, band label, score bar rows and categories |
| CQC Rating Groups | Card count, category names, per-card rating badge and percentage |
| Activity Card | Item count, correct labels |
| Score Bands | Band count, band names |
| Group Comparison Table | Visible, headers present, pagination, row count |
| All Groups Table | Visible, pagination text |
| All Users Table | Visible, pagination text, first user name |
| Sidebar | Links present, Monitor navigation, Reports navigation |
| **Data Accuracy** | KPI card numbers vs `/api/dashboard/stats` API (7 cards), overall score ring %, activity totals and pending badges, score band counts, CQC ring %, badges, yes/no/n-a counts |
| **KPI vs Monitor** | In Progress and Completed 30d counts match the Monitor page |

---

### Monitor (`tests/monitor.spec.ts`) — 112 tests

| Describe block | What's tested |
|---|---|
| Page Load | Correct URL, page wrapper, KPI grid, table card, audit list header, at least one row |
| KPI Cards | All 7 cards present by label, non-negative numbers, correct colour variants (danger/amber/blue/purple/rose) |
| Filter Chips | 7 chips displayed, "All" active by default, each chip count cross-checks KPI card values, each chip click activates it and deactivates "All", "All" resets correctly, status-based filters (In Progress / Scheduled / Completed / Pending Review) show matching rows |
| Tabs | 2 tabs (Audits + Tasks), Audits active by default, tab badges match KPI cards, tab switching activates/deactivates correctly |
| Search | Input visible with placeholder, empty on load, filters rows in real-time, no-match term returns zero rows, clearing restores full list, URL unchanged, case-insensitive |
| Filter Buttons | 4 buttons visible (Auditor / Group / Unarchived / Type), each click is handled client-side without navigation |
| Audit List Columns | Header row visible, all 7 named column headers in correct order |
| Audit List Rows | Non-empty audit name, valid status badge, DD/MM/YYYY due date, group tag, View and overflow buttons per row, all rows have valid statuses |
| Filter + Search Combined | Chip + search narrows further, clearing search restores chip count, tab switch shows separate list |
| **Data Accuracy – UI vs API** | "All"/"In Progress"/"Overdue" chip counts match their KPI cards, Tasks/Audits tab badges match KPI cards, Total Audits KPI matches `/api/audit-instances` response, Tasks Total KPI matches `/api/user-tasks` response |
| Navigation | Sidebar link navigates to /monitor, direct URL works, navigate-away-and-back reloads correctly, browser back/forward work |

---

## Architecture

### Page Object Model

Each page of the app is represented by a class in `src/pages/` that extends `BasePage`. Page objects encapsulate all locators and interactions — test files never contain raw selectors.

```typescript
// test file
await loginPage.login(email, password);
expect(await loginPage.isErrorVisible()).toBe(true);
```

### Custom Fixtures

`src/fixtures/fixtures.ts` extends Playwright's `test` with typed page object fixtures, so every test receives pre-instantiated page objects:

```typescript
test('example', async ({ loginPage, dashboardPage }) => { ... });
```

### Data Accuracy Tests

Dashboard data-accuracy tests intercept the `/api/dashboard/stats` API response during a page reload, then compare each displayed number against the corresponding API field — ensuring the UI never silently shows stale or incorrect data.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | Yes | App base URL |
| `TEST_EMAIL` | Yes | Login email for test user |
| `TEST_PASSWORD` | Yes | Login password for test user |
| `RESET_TEST_EMAIL` | No | A `@1secmail.com` address registered in the portal — enables password reset email tests |
