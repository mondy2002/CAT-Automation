const { chromium } = require("@playwright/test");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL || "https://qc.catclientportal.co.uk";
const TEST_EMAIL = process.env.TEST_EMAIL || "oa2@demo.local";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "Demo!Pass123";

const fs = require("fs");

async function run() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const findings = {};

  try {
    // Login
    console.log("Logging in...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.fill("input[id='email']", TEST_EMAIL);
    await page.fill("input[id='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // === TEST 1: QUESTIONS MENU ITEM ===
    console.log("\n=== TESTING QUESTIONS MENU ITEM ===");
    await page.goto(BASE_URL + "/monitor", { waitUntil: "networkidle" });
    await page.waitForSelector(".al-row", { timeout: 5000 });
    await page.waitForTimeout(300);

    // Get Scheduled audit
    const chips = await page.$$(".mon-chips .chip");
    for (const chip of chips) {
      const text = await chip.textContent();
      if (text.includes("Scheduled")) {
        await chip.click();
        await page.waitForTimeout(500);
        break;
      }
    }

    await page.waitForSelector(".al-row", { timeout: 3000 });

    const scheduledAudit = await page.evaluate(() => ({
      name: document.querySelector(".al-row .al-cell-audit .al-audit-name")?.textContent.trim()
    }));

    console.log(`Scheduled audit: "${scheduledAudit.name}"`);

    // Click overflow
    await page.click(".al-row .al-overflow-btn");
    await page.waitForTimeout(800);

    // Click Questions button
    const allItems = await page.$$(".action-menu-panel button");
    let foundQuestions = false;
    for (const item of allItems) {
      const text = await item.textContent();
      if (text.includes("Questions")) {
        console.log("Clicking Questions button...");
        await item.click();
        await page.waitForTimeout(1200);
        foundQuestions = true;
        break;
      }
    }

    if (foundQuestions) {
      await page.screenshot({ path: "c:/CAT-Automation/screenshots/action-questions.png" });

      const questionsResult = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        modal: !!document.querySelector("[role='dialog']"),
        navigation: !window.location.href.includes("/monitor"),
        mainContent: Array.from(document.querySelectorAll("h1, h2, h3, .content"))
          .map(e => e.textContent?.trim())
          .filter(t => t && t.length > 0)
          .slice(0, 5)
      }));

      findings.questionsMenuAction = questionsResult;
      console.log(`Result: ${JSON.stringify(questionsResult)}`);
    }

    // === TEST 2: REASSIGN MENU ITEM ===
    console.log("\n=== TESTING REASSIGN MENU ITEM ===");
    await page.goto(BASE_URL + "/monitor", { waitUntil: "networkidle" });
    await page.waitForSelector(".al-row", { timeout: 5000 });
    await page.waitForTimeout(300);

    // Get Scheduled audit
    const chips2 = await page.$$(".mon-chips .chip");
    for (const chip of chips2) {
      const text = await chip.textContent();
      if (text.includes("Scheduled")) {
        await chip.click();
        await page.waitForTimeout(500);
        break;
      }
    }

    await page.waitForSelector(".al-row", { timeout: 3000 });

    // Click overflow
    await page.click(".al-row .al-overflow-btn");
    await page.waitForTimeout(800);

    // Click Reassign button
    const allItems2 = await page.$$(".action-menu-panel button");
    let foundReassign = false;
    for (const item of allItems2) {
      const text = await item.textContent();
      if (text.includes("Reassign")) {
        console.log("Clicking Reassign button...");
        await item.click();
        await page.waitForTimeout(1200);
        foundReassign = true;
        break;
      }
    }

    if (foundReassign) {
      await page.screenshot({ path: "c:/CAT-Automation/screenshots/action-reassign.png" });

      const reassignResult = await page.evaluate(() => {
        const modal = document.querySelector("[role='dialog']");
        return {
          modalOpen: !!modal,
          url: window.location.href,
          title: modal?.querySelector("h1, h2, .mat-dialog-title")?.textContent?.trim(),
          formFields: Array.from(document.querySelectorAll("input, select, textarea, [contenteditable]"))
            .map(f => ({
              type: f.type || f.tagName,
              name: f.name,
              id: f.id,
              placeholder: f.placeholder,
              value: f.value,
              options: f.tagName === "SELECT" ? Array.from(f.options).map(o => o.text).slice(0, 5) : undefined
            })),
          buttons: Array.from(document.querySelectorAll("button"))
            .map(b => ({ text: b.textContent.trim(), disabled: b.disabled, type: b.type }))
            .filter(b => b.text.length > 0)
            .slice(0, 6),
          labels: Array.from(document.querySelectorAll("label"))
            .map(l => l.textContent.trim())
            .filter(t => t.length > 0)
            .slice(0, 5)
        };
      });

      findings.reassignMenuAction = reassignResult;
      console.log(`Result: ${JSON.stringify(reassignResult, null, 2)}`);
    }

    // Save findings
    fs.writeFileSync("c:/CAT-Automation/menu-actions-findings.json", JSON.stringify(findings, null, 2));
    console.log("\nFindings saved to menu-actions-findings.json");

  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.error(error);
  } finally {
    await browser.close();
  }
}

run();
