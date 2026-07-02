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
}

async function exploreOverflowMenus() {
  log("\n=== EXPLORING OVERFLOW MENUS ===");
  
  const statusesToCheck = ["Scheduled", "In Progress", "Overdue", "Completed"];
  const overflowData = {};

  for (const status of statusesToCheck) {
    log(`\nStatus: ${status}`);
    
    await navigateToMonitor();
    
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
      await page.waitForSelector(".al-row", { timeout: 3000 });
    } catch (e) {
      overflowData[status] = { error: "No rows" };
      continue;
    }

    await page.waitForTimeout(300);

    const auditInfo = await page.evaluate(() => ({
      auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
      status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
    }));

    log(`  Found: "${auditInfo.auditName}"`);

    await page.click(".al-row .al-overflow-btn");
    await page.waitForTimeout(600);

    await captureScreenshot(`overflow-${status}`);

    const menuItems = await page.evaluate(() => {
      const menuArea = document.querySelector(".cdk-overlay-pane");
      if (!menuArea) return [];

      const items = [];
      const allElements = menuArea.querySelectorAll("button, [role='menuitem'], a");

      for (const elem of allElements) {
        const text = elem.textContent?.trim();
        if (text && text.length > 0 && text.length < 150) {
          items.push(text);
        }
      }

      return [...new Set(items)];
    });

    overflowData[status] = {
      auditName: auditInfo.auditName,
      menuItems: menuItems
    };

    log(`  Menu items: ${menuItems.join(", ")}`);

    await page.click("body", { position: { x: 100, y: 100 } });
    await page.waitForTimeout(300);
  }

  findings.overflowMenus = overflowData;
}

async function exploreStartAuditWorkflow() {
  log("\n=== START AUDIT WORKFLOW ===");
  
  await navigateToMonitor();

  const chips = await page.$$(".mon-chips .chip");
  for (const chip of chips) {
    const text = await chip.textContent();
    if (text.includes("Scheduled")) {
      await chip.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  try {
    await page.waitForSelector(".al-row", { timeout: 3000 });
  } catch (e) {
    findings.startAuditWorkflow = { error: "No Scheduled" };
    return;
  }

  await page.waitForTimeout(300);

  const auditInfo = await page.evaluate(() => ({
    auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
    status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
  }));

  log(`Scheduled: "${auditInfo.auditName}"`);

  await page.click(".al-row .al-overflow-btn");
  await page.waitForTimeout(500);

  const hasStart = await page.evaluate(() => {
    const menu = document.querySelector(".cdk-overlay-pane");
    if (!menu) return false;
    const items = menu.querySelectorAll("button, [role='menuitem'], a");
    return Array.from(items).some(i => i.textContent.toLowerCase().includes("start"));
  });

  if (hasStart) {
    log("  Found Start option");

    const items = await page.$$(".cdk-overlay-pane button, .cdk-overlay-pane [role='menuitem'], .cdk-overlay-pane a");
    for (const item of items) {
      const text = await item.textContent();
      if (text.toLowerCase().includes("start")) {
        await item.click();
        await page.waitForTimeout(800);
        break;
      }
    }

    await captureScreenshot("start-audit");

    const workflowInfo = await page.evaluate(() => {
      const modal = document.querySelector("[role='dialog']");
      const isNavigation = window.location.pathname !== "/monitor";
      
      return {
        type: modal ? "modal" : isNavigation ? "navigation" : "unknown",
        url: window.location.pathname,
        title: modal?.querySelector("h1, h2, [class*='title'], .mat-dialog-title")?.textContent?.trim(),
        formFields: Array.from(document.querySelectorAll("input, select, textarea"))
          .map(f => ({
            type: f.type || f.tagName,
            name: f.name,
            placeholder: f.placeholder
          }))
          .slice(0, 5),
        buttons: Array.from(document.querySelectorAll("button"))
          .map(b => ({ text: b.textContent.trim(), disabled: b.disabled }))
          .filter(b => b.text.length > 0 && b.text.length < 50)
          .slice(0, 5)
      };
    });

    findings.startAuditWorkflow = {
      audit: auditInfo,
      workflowInfo: workflowInfo
    };

    log(`  Result: ${JSON.stringify(workflowInfo, null, 2)}`);

    await page.click("body", { position: { x: 100, y: 100 } });
    await page.waitForTimeout(300);
  }
}

async function exploreContinueAuditWorkflow() {
  log("\n=== CONTINUE AUDIT WORKFLOW ===");
  
  await navigateToMonitor();

  const chips = await page.$$(".mon-chips .chip");
  for (const chip of chips) {
    const text = await chip.textContent();
    if (text.includes("In Progress")) {
      await chip.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  try {
    await page.waitForSelector(".al-row", { timeout: 3000 });
  } catch (e) {
    findings.continueAuditWorkflow = { error: "No In Progress" };
    return;
  }

  await page.waitForTimeout(300);

  const auditInfo = await page.evaluate(() => ({
    auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
    status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
  }));

  log(`In Progress: "${auditInfo.auditName}"`);

  await page.click(".al-row .al-primary-btn");
  await page.waitForTimeout(1000);

  await captureScreenshot("continue-audit");

  const formInfo = await page.evaluate(() => {
    const questions = Array.from(document.querySelectorAll("h2, [class*='question-text']"))
      .map(q => q.textContent.trim())
      .filter(t => t && t.length > 0)
      .slice(0, 3);

    const navButtons = Array.from(document.querySelectorAll("button"))
      .map(b => b.textContent.trim())
      .filter(t => t.match(/save|submit|next|previous|back|continue|finish/i))
      .slice(0, 5);

    return {
      url: window.location.pathname,
      questions: questions,
      navigationButtons: navButtons,
      hasForm: !!document.querySelector("form")
    };
  });

  findings.continueAuditWorkflow = {
    audit: auditInfo,
    formInfo: formInfo
  };

  log(`  Form: ${JSON.stringify(formInfo)}`);
}

async function exploreReassignWorkflow() {
  log("\n=== REASSIGN AUDIT WORKFLOW ===");
  
  await navigateToMonitor();

  const auditInfo = await page.evaluate(() => ({
    auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
    status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
  }));

  log(`Audit: "${auditInfo.auditName}"`);

  await page.click(".al-row .al-overflow-btn");
  await page.waitForTimeout(500);

  const hasReassign = await page.evaluate(() => {
    const menu = document.querySelector(".cdk-overlay-pane");
    if (!menu) return false;
    const items = menu.querySelectorAll("button, [role='menuitem'], a");
    return Array.from(items).some(i => i.textContent.toLowerCase().includes("reassign"));
  });

  findings.reassignWorkflow = { audit: auditInfo, foundInOverflow: hasReassign };

  if (hasReassign) {
    log("  Found Reassign in overflow menu");

    const items = await page.$$(".cdk-overlay-pane button, .cdk-overlay-pane [role='menuitem'], .cdk-overlay-pane a");
    for (const item of items) {
      const text = await item.textContent();
      if (text.toLowerCase().includes("reassign")) {
        await item.click();
        await page.waitForTimeout(800);
        break;
      }
    }

    await captureScreenshot("reassign");

    const modalInfo = await page.evaluate(() => {
      const modal = document.querySelector("[role='dialog']");
      return {
        open: !!modal,
        title: modal?.querySelector("h1, h2, .mat-dialog-title")?.textContent?.trim(),
        fields: Array.from(document.querySelectorAll("input, select, textarea"))
          .map(f => ({
            type: f.type || f.tagName,
            name: f.name,
            placeholder: f.placeholder
          })),
        buttons: Array.from(document.querySelectorAll("button"))
          .map(b => b.textContent.trim())
          .filter(t => t.length > 0)
          .slice(0, 5)
      };
    });

    findings.reassignWorkflow.modalInfo = modalInfo;
    log(`  Modal: ${JSON.stringify(modalInfo, null, 2)}`);
  } else {
    log("  Reassign not in overflow, checking detail page...");
  }
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

    log("Logging in...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.fill("input[id='email']", TEST_EMAIL);
    await page.fill("input[id='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle" });
    log("Logged in\n");

    await exploreOverflowMenus();
    await exploreStartAuditWorkflow();
    await exploreContinueAuditWorkflow();
    await exploreReassignWorkflow();

    fs.writeFileSync("c:/CAT-Automation/workflows-findings.json", JSON.stringify(findings, null, 2));
    log("\nSaved to workflows-findings.json");

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
