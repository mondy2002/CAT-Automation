const { chromium } = require("@playwright/test");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL || "https://qc.catclientportal.co.uk";
const TEST_EMAIL = process.env.TEST_EMAIL || "oa2@demo.local";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "Demo!Pass123";

const fs = require("fs");

let browser;
let page;
const findings = {};

async function log(msg) {
  console.log(msg);
}

async function navigateToMonitor() {
  await page.goto(BASE_URL + "/monitor", { waitUntil: "networkidle" });
  await page.waitForSelector(".al-row", { timeout: 5000 });
  await page.waitForTimeout(300);
}

async function captureScreenshot(name) {
  const path = `c:/CAT-Automation/screenshots/${name}.png`;
  await page.screenshot({ path });
  log(`Captured: ${name}`);
}

async function run() {
  try {
    const screenshotDir = "c:/CAT-Automation/screenshots";
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Login
    log("Logging in...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.fill("input[id='email']", TEST_EMAIL);
    await page.fill("input[id='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle" });
    log("Logged in");
    await page.waitForTimeout(1000);

    // Monitor page structure
    log("\n=== MONITOR PAGE STRUCTURE ===");
    await navigateToMonitor();
    await captureScreenshot("01-monitor-page");

    const monitorPageInfo = await page.evaluate(() => {
      const rows = document.querySelectorAll(".al-row");
      const firstRow = rows[0];
      
      return {
        totalRows: rows.length,
        filters: {
          selector: ".mon-chips",
          chips: Array.from(document.querySelectorAll(".mon-chips .chip"))
            .map(c => ({ text: c.textContent.trim(), classes: Array.from(c.classList) }))
        },
        rowStructure: {
          viewButton: {
            selector: ".al-primary-btn",
            text: firstRow?.querySelector(".al-primary-btn")?.textContent.trim(),
            classes: Array.from(firstRow?.querySelector(".al-primary-btn")?.classList || [])
          },
          overflowButton: {
            selector: ".al-overflow-btn",
            classes: Array.from(firstRow?.querySelector(".al-overflow-btn")?.classList || [])
          },
          statusPill: {
            selector: ".al-cell-status .status-pill",
            text: firstRow?.querySelector(".al-cell-status .status-pill")?.textContent.trim(),
            classes: Array.from(firstRow?.querySelector(".al-cell-status .status-pill")?.classList || [])
          },
          auditName: {
            selector: ".al-cell-audit .al-audit-name",
            text: firstRow?.querySelector(".al-cell-audit .al-audit-name")?.textContent.trim()
          }
        },
        sampleRows: Array.from(rows).slice(0, 3).map(row => ({
          auditName: row.querySelector(".al-cell-audit .al-audit-name")?.textContent.trim(),
          status: row.querySelector(".al-cell-status .status-pill")?.textContent.trim()
        }))
      };
    });

    findings.monitorPage = monitorPageInfo;
    log(JSON.stringify(monitorPageInfo, null, 2));

    // View button test
    log("\n=== VIEW BUTTON NAVIGATION ===");
    const firstRowBefore = await page.evaluate(() => ({
      auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
      status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
    }));

    log(`Clicking View on: "${firstRowBefore.auditName}" (${firstRowBefore.status})`);
    await page.click(".al-row .al-primary-btn");
    await page.waitForTimeout(1000);

    const detailUrl = page.url();
    log(`Detail URL: ${detailUrl}`);
    await captureScreenshot("02-audit-detail-page");

    const detailPageInfo = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      
      return {
        url: window.location.href,
        urlPattern: window.location.pathname,
        pageTitle: document.title,
        headings: Array.from(main.querySelectorAll("h1, h2, h3, h4"))
          .map(h => ({ level: h.tagName, text: h.textContent.trim() }))
          .slice(0, 10),
        statusElement: {
          selector: ".status-pill",
          text: document.querySelector(".status-pill")?.textContent.trim(),
          classes: Array.from(document.querySelector(".status-pill")?.classList || [])
        },
        navigationButtons: Array.from(document.querySelectorAll("button, a[class*='back'], a[class*='nav']"))
          .map(b => ({
            text: b.textContent.trim(),
            tagName: b.tagName,
            classes: Array.from(b.classList).slice(0, 3),
            href: b.href,
            type: b.type
          }))
          .filter(b => b.text.length > 0)
          .slice(0, 15),
        forms: Array.from(document.querySelectorAll("form"))
          .map(f => ({
            id: f.id,
            method: f.method,
            fields: Array.from(f.querySelectorAll("input, select, textarea"))
              .map(field => ({
                type: field.type || field.tagName,
                name: field.name,
                placeholder: field.placeholder
              }))
          })),
        tabs: Array.from(document.querySelectorAll("[role='tab']"))
          .map(t => ({
            text: t.textContent.trim(),
            ariaSelected: t.getAttribute("aria-selected"),
            classes: Array.from(t.classList)
          })),
        questions: Array.from(document.querySelectorAll("[class*='question'], h2"))
          .map(q => q.textContent.trim())
          .filter(t => t.length > 0)
          .slice(0, 5)
      };
    });

    findings.detailPage = { auditName: firstRowBefore.auditName, ...detailPageInfo };
    log(JSON.stringify(detailPageInfo, null, 2));

    // Save findings
    fs.writeFileSync("c:/CAT-Automation/monitor-detailed-findings.json", JSON.stringify(findings, null, 2));
    log("\n\nFindings saved to monitor-detailed-findings.json");

  } catch (error) {
    log(`ERROR: ${error.message}`);
    console.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
