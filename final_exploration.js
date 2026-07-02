const { chromium } = require("@playwright/test");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL || "https://qc.catclientportal.co.uk";
const TEST_EMAIL = process.env.TEST_EMAIL || "oa2@demo.local";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "Demo!Pass123";

const fs = require("fs");

let browser, page;
const findings = {};

async function log(msg) {
  console.log(msg);
}

async function goToMonitor() {
  await page.goto(BASE_URL + "/monitor", { waitUntil: "networkidle" });
  await page.waitForSelector(".al-row", { timeout: 5000 });
  await page.waitForTimeout(300);
}

async function screenshotit(name) {
  await page.screenshot({ path: `c:/CAT-Automation/screenshots/${name}.png` });
}

async function run() {
  try {
    if (!fs.existsSync("c:/CAT-Automation/screenshots")) {
      fs.mkdirSync("c:/CAT-Automation/screenshots", { recursive: true });
    }

    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    log("Logging in...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.fill("input[id='email']", TEST_EMAIL);
    await page.fill("input[id='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle" });
    log("Logged in\n");
    await page.waitForTimeout(1000);

    // MONITOR PAGE STRUCTURE
    log("=== 1. MONITOR PAGE STRUCTURE ===");
    await goToMonitor();
    await screenshotit("01-monitor");

    findings.monitorPage = await page.evaluate(() => {
      const rows = document.querySelectorAll(".al-row");
      return {
        totalRows: rows.length,
        URL: window.location.href,
        filterChips: Array.from(document.querySelectorAll(".mon-chips .chip"))
          .map(c => ({ text: c.textContent.trim(), classes: Array.from(c.classList) })),
        rowSelectors: {
          row: ".al-row",
          viewButton: ".al-primary-btn",
          overflowButton: ".al-overflow-btn",
          statusPill: ".al-cell-status .status-pill",
          auditName: ".al-cell-audit .al-audit-name"
        },
        sampleRows: Array.from(rows).slice(0, 5).map(r => ({
          auditName: r.querySelector(".al-cell-audit .al-audit-name")?.textContent.trim(),
          status: r.querySelector(".al-cell-status .status-pill")?.textContent.trim()
        }))
      };
    });

    log(JSON.stringify(findings.monitorPage, null, 2));

    // VIEW BUTTON NAVIGATION
    log("\n=== 2. VIEW BUTTON NAVIGATION ===");
    const auditBefore = await page.evaluate(() => ({
      name: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
      status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
    }));

    log(`Clicking View on: "${auditBefore.name}" (${auditBefore.status})`);
    await page.click(".al-row .al-primary-btn");
    await page.waitForTimeout(1200);
    await screenshotit("02-detail");

    findings.viewButton = {
      audit: auditBefore,
      resultURL: page.url(),
      urlPattern: page.url().replace(BASE_URL, ""),
      isNavigation: !page.url().includes("/monitor")
    };

    const detailPage = await page.evaluate(() => {
      return {
        title: document.title,
        buttons: Array.from(document.querySelectorAll("button"))
          .map(b => ({
            text: b.textContent.trim(),
            classes: Array.from(b.classList).slice(0, 3),
            type: b.type
          }))
          .filter(b => b.text.length > 0 && b.text.length < 100)
          .slice(0, 20),
        formFields: Array.from(document.querySelectorAll("input, select, textarea, [contenteditable]"))
          .map(f => ({
            type: f.type || f.tagName,
            name: f.name,
            id: f.id
          })),
        tabs: Array.from(document.querySelectorAll("[role='tab'], .tab"))
          .map(t => ({ text: t.textContent.trim(), role: t.getAttribute("role") }))
      };
    });

    findings.detailPageStructure = detailPage;
    log(`URL: ${findings.viewButton.resultURL}`);

    // OVERFLOW MENU BY STATUS
    log("\n=== 3. OVERFLOW MENU EXPLORATION ===");
    const overflowByStatus = {};

    for (const status of ["Scheduled", "In Progress", "Overdue", "Completed", "Pending Review"]) {
      log(`\nStatus: ${status}`);
      await goToMonitor();

      const chips = await page.$$(".mon-chips .chip");
      let found = false;
      for (const chip of chips) {
        const text = await chip.textContent();
        if (text.includes(status)) {
          await chip.click();
          await page.waitForTimeout(500);
          found = true;
          break;
        }
      }

      if (!found) {
        continue;
      }

      try {
        await page.waitForSelector(".al-row", { timeout: 2000 });
      } catch {
        overflowByStatus[status] = { error: "No rows" };
        continue;
      }

      const auditInfo = await page.evaluate(() => ({
        name: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
        status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
      }));

      log(`  Audit: "${auditInfo.name}"`);

      await page.click(".al-row .al-overflow-btn");
      await page.waitForTimeout(800);
      await screenshotit(`03-overflow-${status}`);

      const menuItems = await page.evaluate(() => {
        const panel = document.querySelector(".action-menu-panel");
        const menu = document.querySelector(".action-menu");
        const container = panel || menu;

        if (!container) return [];

        const items = Array.from(container.querySelectorAll("*"))
          .filter(el => {
            const text = el.textContent?.trim();
            return text && text.length > 0 && text.length < 150;
          })
          .map(el => ({
            text: el.textContent.trim(),
            tagName: el.tagName,
            classes: Array.from(el.classList).slice(0, 2)
          }));

        const seen = new Set();
        return items.filter(item => {
          if (seen.has(item.text)) return false;
          seen.add(item.text);
          return true;
        });
      });

      overflowByStatus[status] = { audit: auditInfo, menuItems: menuItems };
      log(`  Menu: ${menuItems.map(m => m.text).join(", ")}`);

      await page.click("body", { position: { x: 100, y: 100 } });
      await page.waitForTimeout(300);
    }

    findings.overflowMenusByStatus = overflowByStatus;

    // START AUDIT WORKFLOW
    log("\n=== 4. START AUDIT WORKFLOW ===");
    await goToMonitor();

    const scheduledChips = await page.$$(".mon-chips .chip");
    for (const chip of scheduledChips) {
      const text = await chip.textContent();
      if (text.includes("Scheduled")) {
        await chip.click();
        await page.waitForTimeout(500);
        break;
      }
    }

    try {
      await page.waitForSelector(".al-row", { timeout: 2000 });
      
      const scheduledAudit = await page.evaluate(() => ({
        name: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
        status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
      }));

      log(`Found: "${scheduledAudit.name}"`);

      await page.click(".al-row .al-overflow-btn");
      await page.waitForTimeout(800);

      const hasStart = await page.evaluate(() => {
        const menu = document.querySelector(".action-menu-panel, .action-menu");
        if (!menu) return false;
        return menu.textContent.toLowerCase().includes("start");
      });

      if (hasStart) {
        log("Found Start option");

        const items = await page.$$(".action-menu-panel *, .action-menu *");
        for (const item of items) {
          const text = await item.textContent();
          if (text.toLowerCase().includes("start")) {
            await item.click();
            await page.waitForTimeout(1000);
            break;
          }
        }

        await screenshotit("04-start-workflow");

        const startResult = await page.evaluate(() => {
          const modal = document.querySelector("[role='dialog']");
          return {
            type: modal ? "modal" : "navigation",
            url: window.location.href,
            title: modal?.querySelector("h1, h2")?.textContent?.trim(),
            formFields: Array.from(document.querySelectorAll("input, select, textarea"))
              .map(f => ({ type: f.type, name: f.name, placeholder: f.placeholder })),
            buttons: Array.from(document.querySelectorAll("button"))
              .map(b => ({ text: b.textContent.trim(), disabled: b.disabled }))
              .filter(b => b.text.length > 0)
              .slice(0, 5)
          };
        });

        findings.startAuditWorkflow = { audit: scheduledAudit, result: startResult };
        log(`Result: ${JSON.stringify(startResult, null, 2)}`);

        await page.click("body", { position: { x: 100, y: 100 } });
        await page.waitForTimeout(300);
      } else {
        findings.startAuditWorkflow = { audit: scheduledAudit, error: "No Start option" };
      }
    } catch (e) {
      findings.startAuditWorkflow = { error: "No Scheduled audits" };
    }

    // CONTINUE AUDIT WORKFLOW
    log("\n=== 5. CONTINUE AUDIT WORKFLOW ===");
    await goToMonitor();

    const inProgressChips = await page.$$(".mon-chips .chip");
    for (const chip of inProgressChips) {
      const text = await chip.textContent();
      if (text.includes("In Progress")) {
        await chip.click();
        await page.waitForTimeout(500);
        break;
      }
    }

    try {
      await page.waitForSelector(".al-row", { timeout: 2000 });
      
      const inProgressAudit = await page.evaluate(() => ({
        name: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
        status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
      }));

      log(`Found: "${inProgressAudit.name}"`);

      await page.click(".al-row .al-primary-btn");
      await page.waitForTimeout(1200);
      await screenshotit("05-continue-workflow");

      const continueForm = await page.evaluate(() => {
        return {
          url: window.location.href,
          questions: Array.from(document.querySelectorAll("h2, [class*='question']"))
            .map(q => q.textContent.trim())
            .filter(t => t.length > 0)
            .slice(0, 3),
          navigationButtons: Array.from(document.querySelectorAll("button"))
            .map(b => b.textContent.trim())
            .filter(t => t.match(/prev|next|save|submit|back|finish|continue/i))
            .slice(0, 5),
          formPresent: !!document.querySelector("form"),
          inputFields: Array.from(document.querySelectorAll("input, select, textarea, [contenteditable]")).length
        };
      });

      findings.continueAuditWorkflow = { audit: inProgressAudit, form: continueForm };
      log(`Form: ${JSON.stringify(continueForm, null, 2)}`);
    } catch (e) {
      findings.continueAuditWorkflow = { error: "No In Progress audits" };
    }

    // REASSIGN AUDIT WORKFLOW
    log("\n=== 6. REASSIGN AUDIT WORKFLOW ===");
    await goToMonitor();

    const anyAudit = await page.evaluate(() => ({
      name: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
      status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
    }));

    log(`Testing: "${anyAudit.name}" (${anyAudit.status})`);

    await page.click(".al-row .al-overflow-btn");
    await page.waitForTimeout(800);

    const hasReassign = await page.evaluate(() => {
      const menu = document.querySelector(".action-menu-panel, .action-menu");
      if (!menu) return false;
      return menu.textContent.toLowerCase().includes("reassign");
    });

    if (hasReassign) {
      log("Found Reassign in overflow menu");

      const items = await page.$$(".action-menu-panel *, .action-menu *");
      for (const item of items) {
        const text = await item.textContent();
        if (text.toLowerCase().includes("reassign")) {
          await item.click();
          await page.waitForTimeout(1000);
          break;
        }
      }

      await screenshotit("06-reassign-modal");

      const reassignModal = await page.evaluate(() => {
        const modal = document.querySelector("[role='dialog']");
        return {
          open: !!modal,
          title: modal?.querySelector("h1, h2, .mat-dialog-title")?.textContent?.trim(),
          formFields: Array.from(document.querySelectorAll("input, select, textarea"))
            .map(f => ({
              type: f.type || f.tagName,
              name: f.name,
              placeholder: f.placeholder
            })),
          buttons: Array.from(document.querySelectorAll("button"))
            .map(b => ({ text: b.textContent.trim(), disabled: b.disabled }))
            .filter(b => b.text.length > 0)
            .slice(0, 5)
        };
      });

      findings.reassignWorkflow = { audit: anyAudit, modal: reassignModal };
      log(`Modal: ${JSON.stringify(reassignModal, null, 2)}`);
    } else {
      log("Reassign not in overflow menu");
      findings.reassignWorkflow = { audit: anyAudit, foundInOverflow: false };
    }

    fs.writeFileSync("c:/CAT-Automation/MONITOR_EXPLORATION_FINDINGS.json", JSON.stringify(findings, null, 2));
    log("\n=== SAVED: MONITOR_EXPLORATION_FINDINGS.json ===");

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
