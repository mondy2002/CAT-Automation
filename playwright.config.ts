import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 3,
  timeout: 60000,

  reporter: [
    // Terminal: shows each test result live with duration
    ['list'],
    // HTML report: rich, interactive, opens automatically when any test fails
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
    // JUnit XML: consumed by CI (GitHub Actions, Jenkins, Azure DevOps)
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://qc.catclientportal.co.uk',

    // Required: the QC portal uses a certificate that headless Chrome rejects without this
    ignoreHTTPSErrors: true,

    // No screenshots or video — keeps the report lightweight and fast to load
    screenshot: 'off',
    video: 'off',

    // Trace retains a full timeline (DOM snapshots + network waterfall + actions)
    // on any failure without needing screenshots or video.
    // View with: npx playwright show-trace test-results/<path>/trace.zip
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
