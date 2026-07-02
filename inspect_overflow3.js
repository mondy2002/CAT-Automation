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

  console.log("Monitor page loaded");

  // Get overflow button
  const overflowBtn = await page.$(".al-overflow-btn");
  console.log("Overflow button found: " + !!overflowBtn);

  // Try hovering first
  await overflowBtn.hover();
  console.log("Hovered over overflow button");
  await page.waitForTimeout(500);

  // Try clicking
  await overflowBtn.click();
  console.log("Clicked overflow button");
  await page.waitForTimeout(1000);

  // Wait for any menu to appear
  await page.waitForTimeout(500);

  // Now check for menu
  const menuVis = await page.evaluate(() => {
    const elements = document.querySelectorAll("[role='menu'], [class*='popup'], [class*='dropdown'], [class*='menu'], .cdk-overlay-pane");
    const result = [];
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      result.push({
        tag: el.tagName,
        classes: Array.from(el.classList).slice(0, 3).join(" "),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        children: el.children.length
      });
    }
    return result;
  });

  console.log("\nAll potential menu elements:");
  console.log(JSON.stringify(menuVis, null, 2));

  // Look for any visible popup
  const hasVisibleMenu = await page.evaluate(() => {
    // Check for Material menu
    const menu = document.querySelector("[role='menu']");
    if (menu) {
      const style = window.getComputedStyle(menu);
      return {
        found: true,
        type: "role=menu",
        display: style.display,
        items: Array.from(menu.querySelectorAll("[role='menuitem']")).map(m => m.textContent.trim()).slice(0, 10)
      };
    }
    
    // Check for button menu in DOM
    const btns = Array.from(document.querySelectorAll(".al-overflow-btn")).map((btn, i) => ({
      index: i,
      nextSibling: btn.nextElementSibling?.tagName,
      nextClasses: btn.nextElementSibling?.className
    }));
    
    return { found: false, buttons: btns };
  });

  console.log("\nMenu visibility check:");
  console.log(JSON.stringify(hasVisibleMenu, null, 2));

  await page.screenshot({ path: "c:/CAT-Automation/screenshots/overflow3.png" });

  await browser.close();
}

run().catch(console.error);
