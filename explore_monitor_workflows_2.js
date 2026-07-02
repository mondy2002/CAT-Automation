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
  log(`Screenshot: ${name}`);
}

async function exploreOverflowMenus() {
  log("\n=== EXPLORING OVERFLOW MENUS ===");
  
  const statusesToCheck = ["Scheduled", "In Progress", "Overdue", "Completed"];
  const overflowData = {};

  for (const status of statusesToCheck) {
    log(`\n--- Status: ${status} ---`);
    
    await navigateToMonitor();
    
    // Click filter chip
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
      log(`No chip found for ${status}`);
      continue;
    }

    // Wait for rows
    try {
      await page.waitForSelector(".al-row", { timeout: 3000 });
    } catch (e) {
      log(`No rows found for ${status}`);
      overflowData[status] = { error: "No rows found" };
      continue;
    }

    await page.waitForTimeout(300);

    const auditInfo = await page.evaluate(() => ({
      auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
      status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
    }));

    log(`Found: "${auditInfo.auditName}" (${auditInfo.status})`);

    // Click overflow button
    await page.click(".al-row .al-overflow-btn");
    await page.waitForTimeout(600);

    await captureScreenshot(`overflow-menu-${status}`);

    // Extract menu items
    const menuItems = await page.evaluate(() => {
      const items = [];
      
      // Try different selectors for menu items
      const menuElements = document.querySelectorAll(
        "[role='menuitem'], " +
        ".mat-menu-item, " +
        "[class*='menu-item'], " +
        ".ng-star-inserted button, " +
        ".ng-star-inserted a, " +
        "[class*='dropdown'] > *, " +
        ".cdk-overlay-pane *"
      );

      for (const elem of menuElements) {
        const style = window.getComputedStyle(elem);
        const text = elem.textContent?.trim();
        
        if (style.display !== "none" && 
            style.visibility !== "hidden" && 
            text && 
            text.length > 0 && 
            text.length < 150) {
          items.push({
            text: text,
            tagName: elem.tagName,
            classes: Array.from(elem.classList).slice(0, 3)
          });
        }
      }

      return items.slice(0, 20);
    });

    overflowData[status] = {
      auditName: auditInfo.auditName,
      menuItems: menuItems
    };

    log("Menu items:");
    menuItems.forEach(item => log(`  - ${item.text}`));

    // Close menu
    await page.press("Escape");
    await page.waitForTimeout(300);
  }

  findings.overflowMenus = overflowData;
}

async function exploreStartAuditWorkflow() {
  log("\n=== START AUDIT WORKFLOW ===");
  
  await navigateToMonitor();

  // Filter for Scheduled
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
    log("No Scheduled audits found");
    findings.startAuditWorkflow = { error: "No Scheduled audits" };
    return;
  }

  await page.waitForTimeout(300);

  const auditInfo = await page.evaluate(() => ({
    auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
    status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
  }));

  log(`Found Scheduled audit: "${auditInfo.auditName}"`);

  // Click overflow
  await page.click(".al-row .al-overflow-btn");
  await page.waitForTimeout(500);

  // Look for Start button
  const startButtonExists = await page.evaluate(() => {
    const items = document.querySelectorAll("[role='menuitem'], button, a");
    return Array.from(items).some(i => i.textContent.toLowerCase().includes("start"));
  });

  if (startButtonExists) {
    log("Found Start button in overflow menu");

    const items = await page.$$("[role='menuitem'], button, a");
    for (const item of items) {
      const text = await item.textContent();
      if (text.toLowerCase().includes("start")) {
        await item.click();
        await page.waitForTimeout(800);
        break;
      }
    }

    await captureScreenshot("start-audit-workflow");

    const workflowInfo = await page.evaluate(() => ({
      modalVisible: !!document.querySelector("[role='dialog']"),
      urlChanged: window.location.pathname !== "/monitor",
      title: document.querySelector("[role='dialog'] h1, [role='dialog'] h2, .modal-header")?.textContent.trim(),
      buttons: Array.from(document.querySelectorAll("button"))
        .map(b => ({ text: b.textContent.trim(), disabled: b.disabled, type: b.type }))
        .filter(b => b.text.length > 0)
        .slice(0, 5),
      inputs: Array.from(document.querySelectorAll("input, select, textarea"))
        .map(i => ({
          type: i.type || i.tagName,
          name: i.name,
          placeholder: i.placeholder
        }))
    }));

    findings.startAuditWorkflow = {
      audit: auditInfo,
      result: workflowInfo
    };

    log("Workflow Info: " + JSON.stringify(workflowInfo, null, 2));

    // Close without submitting
    await page.press("Escape");
    await page.waitForTimeout(300);
  } else {
    log("Start button not found in overflow menu");
    findings.startAuditWorkflow = { error: "Start button not found" };
  }
}

async function exploreContinueAuditWorkflow() {
  log("\n=== CONTINUE AUDIT WORKFLOW ===");
  
  await navigateToMonitor();

  // Filter for In Progress
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
    log("No In Progress audits found");
    findings.continueAuditWorkflow = { error: "No In Progress audits" };
    return;
  }

  await page.waitForTimeout(300);

  const auditInfo = await page.evaluate(() => ({
    auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
    status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
  }));

  log(`Found In Progress audit: "${auditInfo.auditName}"`);

  // Click View
  await page.click(".al-row .al-primary-btn");
  await page.waitForTimeout(1000);

  await captureScreenshot("continue-audit-form");

  const formInfo = await page.evaluate(() => ({
    url: window.location.href,
    urlPattern: window.location.pathname,
    questionnaire: Array.from(document.querySelectorAll("h2, [class*='question']"))
      .map(q => q.textContent.trim())
      .filter(t => t.length > 0)
      .slice(0, 5),
    formElements: Array.from(document.querySelectorAll("input, select, textarea, [contenteditable]"))
      .map(f => ({
        type: f.type || f.tagName,
        name: f.name,
        id: f.id,
        placeholder: f.placeholder
      }))
      .slice(0, 5),
    navButtons: Array.from(document.querySelectorAll("button"))
      .map(b => ({ text: b.textContent.trim(), type: b.type, disabled: b.disabled }))
      .filter(b => b.text.match(/save|submit|next|previous|back|continue|finish/i))
      .slice(0, 5),
    progressIndicators: Array.from(document.querySelectorAll("[class*='progress']"))
      .map(p => ({ text: p.textContent.trim(), classes: Array.from(p.classList).slice(0, 2) }))
  }));

  findings.continueAuditWorkflow = {
    audit: auditInfo,
    formStructure: formInfo
  };

  log("Form Info: " + JSON.stringify(formInfo, null, 2));
}

async function exploreReassignWorkflow() {
  log("\n=== REASSIGN AUDIT WORKFLOW ===");
  
  await navigateToMonitor();

  const auditInfo = await page.evaluate(() => ({
    auditName: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim(),
    status: document.querySelector(".al-row .al-cell-status .status-pill")?.textContent.trim()
  }));

  log(`Exploring reassign on: "${auditInfo.auditName}"`);

  // Try overflow menu first
  await page.click(".al-row .al-overflow-btn");
  await page.waitForTimeout(500);

  const reassignInMenu = await page.evaluate(() => {
    const items = document.querySelectorAll("[role='menuitem'], button, a");
    return Array.from(items).some(i => i.textContent.toLowerCase().includes("reassign"));
  });

  if (reassignInMenu) {
    log("Found Reassign in overflow menu");
    const items = await page.$$("[role='menuitem'], button, a");
    for (const item of items) {
      const text = await item.textContent();
      if (text.toLowerCase().includes("reassign")) {
        await item.click();
        await page.waitForTimeout(800);
        break;
      }
    }

    await captureScreenshot("reassign-modal");

    const reassignInfo = await page.evaluate(() => ({
      modalVisible: !!document.querySelector("[role='dialog']"),
      title: document.querySelector("[role='dialog'] h1, [role='dialog'] h2")?.textContent.trim(),
      fields: Array.from(document.querySelectorAll("input, select, textarea"))
        .map(f => ({
          type: f.type || f.tagName,
          name: f.name,
          placeholder: f.placeholder,
          label: f.parentElement?.querySelector("label")?.textContent?.trim()
        })),
      buttons: Array.from(document.querySelectorAll("button"))
        .map(b => ({ text: b.textContent.trim(), type: b.type }))
        .filter(b => b.text.length > 0)
        .slice(0, 5)
    }));

    findings.reassignWorkflow = {
      audit: auditInfo,
      foundInOverflowMenu: true,
      modalInfo: reassignInfo
    };

    log("Reassign Modal: " + JSON.stringify(reassignInfo, null, 2));
  } else {
    log("Reassign not found in overflow menu");
    findings.reassignWorkflow = { audit: auditInfo, foundInOverflowMenu: false };
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
    log("Logged in");
    await page.waitForTimeout(1000);

    // Run explorations
    await exploreOverflowMenus();
    await exploreStartAuditWorkflow();
    await exploreContinueAuditWorkflow();
    await exploreReassignWorkflow();

    // Save findings
    fs.writeFileSync("c:/CAT-Automation/monitor-workflows-findings.json", JSON.stringify(findings, null, 2));
    log("\nFindings saved to monitor-workflows-findings.json");

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
