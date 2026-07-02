const { chromium } = require("@playwright/test");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL || "https://qc.catclientportal.co.uk";
const TEST_EMAIL = process.env.TEST_EMAIL || "oa2@demo.local";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "Demo!Pass123";

async function run() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Login
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.fill("input[id='email']", TEST_EMAIL);
  await page.fill("input[id='password']", TEST_PASSWORD);
  await page.click("button[type='submit']");
  await page.waitForNavigation({ waitUntil: "networkidle" });

  // Go to monitor
  await page.goto(BASE_URL + "/monitor", { waitUntil: "networkidle" });
  await page.waitForSelector(".al-row", { timeout: 5000 });
  await page.waitForTimeout(500);

  console.log("About to click overflow button");

  // Right-click to see context menu
  await page.click(".al-overflow-btn");
  await page.waitForTimeout(1200);

  // Check what changed in DOM
  const info = await page.evaluate(() => {
    return {
      title: document.title,
      matMenuPanels: Array.from(document.querySelectorAll(".mat-menu-panel")).length,
      allOverlays: Array.from(document.querySelectorAll(".cdk-overlay-pane")).length,
      overflowBtnClasses: Array.from(document.querySelector(".al-overflow-btn")?.classList || []),
      // Check for any new elements added to body
      bodyChildren: document.body.children.length,
      lastChild: {
        tag: document.body.lastChild?.tagName,
        classes: Array.from(document.body.lastChild?.classList || []).join(" "),
        innerHTML: document.body.lastChild?.innerHTML?.substring(0, 500)
      }
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await page.screenshot({ path: "c:/CAT-Automation/screenshots/overflow2.png" });

  // Try to find any visible popup or menu
  const popups = await page.$$(".cdk-overlay-pane, .mat-menu-panel, [role='menu']");
  console.log(`\nFound ${popups.length} potential popups/menus`);

  for (let i = 0; i < popups.length; i++) {
    const content = await page.evaluate((index) => {
      const elem = document.querySelectorAll(".cdk-overlay-pane, .mat-menu-panel, [role='menu']")[index];
      if (!elem) return null;
      return {
        index: index,
        tag: elem.tagName,
        display: window.getComputedStyle(elem).display,
        visibility: window.getComputedStyle(elem).visibility,
        opacity: window.getComputedStyle(elem).opacity,
        innerHTML: elem.innerHTML.substring(0, 300),
        buttons: Array.from(elem.querySelectorAll("button, a, [role='menuitem']"))
          .map(b => ({ text: b.textContent.trim(), tag: b.tagName }))
          .slice(0, 10)
      };
    }, i);
    console.log(`\nMenu ${i}:`);
    console.log(JSON.stringify(content, null, 2));
  }

  await browser.close();
}

run().catch(console.error);
