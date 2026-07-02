const { chromium } = require('@playwright/test');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'https://qc.catclientportal.co.uk';
const TEST_EMAIL = process.env.TEST_EMAIL || 'oa2@demo.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Demo!Pass123';

const fs = require('fs');
const path = require('path');

let browser;
let page;

async function log(message) {
  console.log(message);
}

async function run() {
  try {
    log('Starting Monitor Page Exploration...\n');

    const screenshotDir = 'c:/CAT-Automation/screenshots';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    log('Navigating to login page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    log('Current URL: ' + page.url());

    const loginUrl = page.url();
    log('Login page URL: ' + loginUrl);

    // Inspect login page
    const loginPageInfo = await page.evaluate(() => {
      return {
        inputs: Array.from(document.querySelectorAll('input'))
          .map(i => ({ type: i.type, name: i.name, id: i.id, placeholder: i.placeholder })),
        buttons: Array.from(document.querySelectorAll('button'))
          .map(b => ({ text: b.textContent.trim(), type: b.type }))
      };
    });

    log('Login page info: ' + JSON.stringify(loginPageInfo, null, 2));

    // Try to login
    const emailInput = await page.$('input[name="email"], input[type="email"]');
    const passwordInput = await page.$('input[name="password"], input[type="password"]');

    if (emailInput && passwordInput) {
      log('Found login inputs');
      await emailInput.fill(TEST_EMAIL);
      await passwordInput.fill(TEST_PASSWORD);
      
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });
        log('Logged in successfully');
      }
    } else {
      log('Could not find login inputs');
    }

    await page.waitForTimeout(2000);

    // Navigate to monitor
    log('\nNavigating to /monitor');
    await page.goto(BASE_URL + '/monitor', { waitUntil: 'networkidle' });
    log('Monitor URL: ' + page.url());

    await page.screenshot({ path: 'c:/CAT-Automation/screenshots/01-monitor-page.png' });

    // Wait for rows
    await page.waitForSelector('.al-row', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Get row structure
    const rowInfo = await page.evaluate(() => {
      const row = document.querySelector('.al-row');
      if (!row) return null;

      return {
        selectors: {
          viewButton: '.al-primary-btn',
          overflowButton: '.al-overflow-btn',
          statusPill: '.al-cell-status .status-pill',
          auditName: '.al-cell-audit .al-audit-name'
        },
        viewButtonText: row.querySelector('.al-primary-btn')?.textContent.trim(),
        overflowButtonExists: !!row.querySelector('.al-overflow-btn'),
        statusText: row.querySelector('.al-cell-status .status-pill')?.textContent.trim(),
        auditNameText: row.querySelector('.al-cell-audit .al-audit-name')?.textContent.trim()
      };
    });

    log('\nRow structure: ' + JSON.stringify(rowInfo, null, 2));

    // Click View button
    log('\nClicking View button on first row');
    await page.click('.al-row .al-primary-btn');
    await page.waitForTimeout(1500);

    const detailUrl = page.url();
    log('After clicking View - URL: ' + detailUrl);

    await page.screenshot({ path: 'c:/CAT-Automation/screenshots/02-audit-detail.png' });

    const detailPageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3'))
          .map(h => ({ level: h.tagName, text: h.textContent.trim() }))
          .slice(0, 5),
        buttons: Array.from(document.querySelectorAll('button'))
          .map(b => ({ text: b.textContent.trim(), type: b.type, classes: Array.from(b.classList).slice(0, 3) }))
          .slice(0, 10),
        forms: Array.from(document.querySelectorAll('form'))
          .map(f => ({
            id: f.id,
            name: f.name,
            fieldCount: f.querySelectorAll('input, select, textarea').length
          }))
      };
    });

    log('Detail page info: ' + JSON.stringify(detailPageInfo, null, 2));

    // Save findings
    const findings = {
      loginUrl: loginUrl,
      monitorUrl: BASE_URL + '/monitor',
      detailUrl: detailUrl,
      rowStructure: rowInfo,
      detailPageStructure: detailPageInfo,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('c:/CAT-Automation/monitor-findings.json', JSON.stringify(findings, null, 2));
    log('\nFindings saved to monitor-findings.json');

  } catch (error) {
    log('Error: ' + error.message);
    console.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
