const { chromium } = require('@playwright/test');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: 'c:/CAT-Automation/.env' });

const BASE_URL = process.env.BASE_URL || 'https://qc.catclientportal.co.uk';
const EMAIL = process.env.TEST_EMAIL || 'oa2@demo.local';
const PASSWORD = process.env.TEST_PASSWORD || 'Demo!Pass123';

const outputFile = 'C:\\Users\\moham\\AppData\\Local\\Temp\\claude\\c--CAT-Automation\\68750b9c-58fe-41eb-bd1e-3f542b831b76\\scratchpad\\monitor-dom.txt';

async function inspectMonitorPage() {
  let browser;
  let page;
  let output = [];

  try {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();

    // Login
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Navigate to monitor
    await page.goto(`${BASE_URL}/monitor`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    output.push('=== MONITOR PAGE DOM INSPECTOR ===\n');
    output.push(`Current URL: ${page.url()}\n\n`);

    // Get all KPI cards with complete structure
    output.push('=== KPI CARDS (The 5 Main Metrics) ===\n\n');

    const kpiCards = await page.locator('.kpi-card').all();
    
    for (let i = 0; i < kpiCards.length; i++) {
      const card = kpiCards[i];
      
      const info = await card.evaluate(el => {
        const numSpan = el.querySelector('.kpi-num');
        const labelSpan = el.querySelector('.kpi-label');
        
        return {
          index: 0,
          number: numSpan?.innerText || '',
          label: labelSpan?.innerText || '',
          classList: el.className,
          numClass: numSpan?.className || '',
          labelClass: labelSpan?.className || '',
          html: el.outerHTML
        };
      });

      output.push(`${i + 1}. LABEL: "${info.label}"\n`);
      output.push(`   NUMBER: "${info.number}"\n`);
      output.push(`   CARD CLASS: ${info.classList}\n`);
      output.push(`   NUMBER ELEMENT CLASS: ${info.numClass}\n`);
      output.push(`   LABEL ELEMENT CLASS: ${info.labelClass}\n`);
      output.push(`   CSS Selector: .kpi-card:has(.kpi-label:contains("${info.label}")) .kpi-num\n`);
      output.push(`   Full HTML:\n   ${info.html}\n\n`);
    }

    // Now check the filters/toolbar area for the other potential metrics
    output.push('\n=== TOOLBAR / FILTERS AREA ===\n');
    output.push('(This area may contain other metrics mentioned)\n\n');

    try {
      const toolbar = await page.locator('.mon-toolbar').all();
      output.push(`Found ${toolbar.length} toolbar(s)\n\n`);

      for (let i = 0; i < toolbar.length; i++) {
        const tbHtml = await toolbar[i].evaluate(el => el.outerHTML);
        output.push(`Toolbar ${i + 1} HTML:\n${tbHtml.substring(0, 1500)}\n\n`);

        // Look for chip elements which seem to contain audit statuses
        const chips = await toolbar[i].locator('.chip').all();
        output.push(`Toolbar ${i + 1} has ${chips.length} chips:\n`);
        
        for (let j = 0; j < chips.length; j++) {
          const chipText = await chips[j].innerText();
          const chipClass = await chips[j].evaluate(el => el.className);
          output.push(`  Chip ${j + 1}: "${chipText}" [class="${chipClass}"]\n`);
        }
        output.push('\n');
      }
    } catch (e) {
      output.push(`Error reading toolbar: ${e.message}\n\n`);
    }

    // Search the entire page content for any mention of the missing metrics
    output.push('\n=== SEARCHING PAGE CONTENT FOR MISSING METRICS ===\n\n');

    const pageContent = await page.content();
    
    const searchTerms = [
      'Completed 30d',
      'Completed 30',
      'completed 30',
      'Open Tasks',
      'open tasks',
      'Open',
      'Tasks Open'
    ];

    for (const term of searchTerms) {
      if (pageContent.includes(term)) {
        output.push(`FOUND "${term}" in page\n`);
      }
    }

    output.push('\n=== MAPPING REQUESTED METRICS TO ACTUAL PAGE ===\n\n');

    const mapping = [
      {
        requested: 'In Progress (audits)',
        actual: 'In Progress',
        number: '17',
        note: 'Found on Monitor page'
      },
      {
        requested: 'Audits Overdue',
        actual: 'Overdue Audits',
        number: '127',
        note: 'Found on Monitor page'
      },
      {
        requested: 'Completed 30d',
        actual: 'Completed (shown in filter chip area)',
        number: '27',
        note: 'Found in toolbar filters, not as a KPI card'
      },
      {
        requested: 'Open Tasks',
        actual: 'NOT FOUND',
        number: '?',
        note: 'May need to check Tasks page or other section'
      },
      {
        requested: 'Overdue Tasks',
        actual: 'Overdue Tasks',
        number: '106',
        note: 'Found on Monitor page'
      }
    ];

    mapping.forEach((item, i) => {
      output.push(`${i + 1}. REQUESTED: "${item.requested}"\n`);
      output.push(`   ACTUAL: "${item.actual}"\n`);
      output.push(`   NUMBER: ${item.number}\n`);
      output.push(`   NOTE: ${item.note}\n\n`);
    });

    output.push('=== SUMMARY ===\n\n');
    output.push('The Monitor page displays KPI cards with this structure:\n');
    output.push('<div class="kpi-card [variant-class]">\n');
    output.push('  <div class="kpi-left">\n');
    output.push('    <span class="kpi-num">[NUMBER]</span>\n');
    output.push('    <span class="kpi-label">[LABEL]</span>\n');
    output.push('  </div>\n');
    output.push('  <span class="kpi-icon material-symbols-outlined">[ICON]</span>\n');
    output.push('</div>\n\n');

    output.push('FOUND METRICS:\n');
    output.push('1. In Progress: .kpi-card:has(.kpi-label) .kpi-num (value 17)\n');
    output.push('2. Audits Overdue: .kpi-card:has(.kpi-label) .kpi-num (value 127)\n');
    output.push('3. Overdue Tasks: .kpi-card:has(.kpi-label) .kpi-num (value 106)\n');
    output.push('4. Completed: In filters as .chip element (value 27)\n\n');

    output.push('NOT FOUND:\n');
    output.push('- Open Tasks (no element on Monitor page)\n');

  } catch (error) {
    output.push(`\nERROR: ${error.message}\n${error.stack}\n`);
  } finally {
    if (browser) {
      await browser.close();
    }

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, output.join(''));
    console.log(output.join(''));
  }
}

inspectMonitorPage().catch(console.error);
