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
  await page.waitForTimeout(300);

  console.log("Monitor page loaded");

  // Click overflow button on first row
  await page.click(".al-row .al-overflow-btn");
  await page.waitForTimeout(800);

  console.log("Overflow menu clicked");

  // Try to find and list all menu items with different approaches
  const menuStructure = await page.evaluate(() => {
    const result = {
      cdk_overlay_pane: null,
      mat_menu_panel: null,
      visible_elements: [],
      all_buttons_in_viewport: []
    };

    // Check for cdk-overlay-pane
    const overlay = document.querySelector(".cdk-overlay-pane");
    if (overlay) {
      result.cdk_overlay_pane = {
        visible: window.getComputedStyle(overlay).display !== "none",
        innerHTML: overlay.innerHTML.substring(0, 500),
        children: Array.from(overlay.children).map(c => ({
          tag: c.tagName,
          classes: Array.from(c.classList),
          text: c.textContent.substring(0, 100)
        }))
      };

      const btns = overlay.querySelectorAll("button, a, [role='menuitem']");
      result.visible_elements = Array.from(btns).map(b => ({
        tag: b.tagName,
        text: b.textContent.trim(),
        role: b.getAttribute("role"),
        classes: Array.from(b.classList).slice(0, 2)
      }));
    }

    // Check for mat-menu-panel
    const matMenu = document.querySelector(".mat-menu-panel");
    if (matMenu) {
      result.mat_menu_panel = {
        visible: window.getComputedStyle(matMenu).display !== "none",
        innerHTML: matMenu.innerHTML.substring(0, 500)
      };
    }

    // Get all visible buttons
    const allButtons = document.querySelectorAll("button, [role='menuitem'], a");
    result.all_buttons_in_viewport = Array.from(allButtons)
      .filter(b => {
        const style = window.getComputedStyle(b);
        const rect = b.getBoundingClientRect();
        return style.display !== "none" && rect.width > 0 && rect.height > 0;
      })
      .map(b => ({
        tag: b.tagName,
        text: b.textContent.trim(),
        rect: { top: b.getBoundingClientRect().top, left: b.getBoundingClientRect().left },
        classes: Array.from(b.classList).slice(0, 2)
      }));

    return result;
  });

  console.log("\n=== MENU STRUCTURE ===");
  console.log(JSON.stringify(menuStructure, null, 2));

  await page.screenshot({ path: "c:/CAT-Automation/screenshots/inspect-overflow.png" });

  await browser.close();
}

run().catch(console.error);
