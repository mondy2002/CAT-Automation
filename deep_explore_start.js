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

  try {
    // Login
    console.log("Logging in...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.fill("input[id='email']", TEST_EMAIL);
    await page.fill("input[id='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Go to monitor and filter for Scheduled
    await page.goto(BASE_URL + "/monitor", { waitUntil: "networkidle" });
    await page.waitForSelector(".al-row", { timeout: 5000 });
    await page.waitForTimeout(300);

    console.log("\nFiltering for Scheduled audits...");
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
    await page.waitForTimeout(300);

    // Click first row's overflow menu
    console.log("Opening overflow menu...");
    await page.click(".al-row .al-overflow-btn");
    await page.waitForTimeout(1000);

    // Log all visible items in the menu
    const allMenuItems = await page.evaluate(() => {
      const panel = document.querySelector(".action-menu-panel");
      if (!panel) return [];
      
      const buttons = Array.from(panel.querySelectorAll("button, a, div, span"));
      return buttons.map(b => ({
        text: b.textContent.trim(),
        tag: b.tagName,
        className: b.className,
        role: b.getAttribute("role"),
        onClick: !!b.onclick,
        innerHTML: b.innerHTML.substring(0, 100)
      }));
    });

    console.log("\nAll menu items found:");
    allMenuItems.forEach((item, i) => {
      if (item.text.length > 0 && item.text.length < 200) {
        console.log(`${i}: ${item.text}`);
      }
    });

    // Save detailed report
    const report = {
      allMenuItems: allMenuItems,
      menuStructure: await page.evaluate(() => {
        const panel = document.querySelector(".action-menu-panel");
        return {
          html: panel?.innerHTML?.substring(0, 1000),
          classes: Array.from(panel?.classList || []).join(" "),
          childCount: panel?.children.length
        };
      })
    };

    fs.writeFileSync("c:/CAT-Automation/start-menu-detailed.json", JSON.stringify(report, null, 2));
    console.log("\nReport saved to start-menu-detailed.json");

  } catch (error) {
    console.log(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

run();
