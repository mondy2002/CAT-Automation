const { chromium } = require('@playwright/test');
require('dotenv').config({ path: '/c/CAT-Automation/.env' });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('=== CAT MONITOR PAGE EXPLORATION ===\n');

    // LOGIN
    await page.goto('https://qc.catclientportal.co.uk/auth/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'oa2@demo.local');
    await page.fill('input[type="password"]', 'Demo!Pass123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Monitor page
    await page.goto('https://qc.catclientportal.co.uk/monitor', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // KPI CARDS
    console.log('1. KPI CARDS');
    const kpis = await page.locator('.kpi-card').all();
    for (let i = 0; i < kpis.length; i++) {
      const num = await kpis[i].locator('.kpi-num').first().textContent();
      const lbl = await kpis[i].locator('.kpi-label').first().textContent();
      const cls = await kpis[i].getAttribute('class');
      console.log(`  ${i+1}. "${lbl}" = ${num} [${cls}]`);
    }

    // CHIPS
    console.log('\n2. CHIPS');
    const ch = await page.locator('.chip').all();
    for (let i = 0; i < ch.length; i++) {
      const txt = await ch[i].textContent();
      const cls = await ch[i].getAttribute('class');
      const m = txt?.trim().match(/^([A-Za-z\s]+?)(\d+)$/);
      const lbl = m ? m[1].trim() : '';
      const cnt = m ? m[2] : '';
      console.log(`  ${i+1}. Label="${lbl}" Count=${cnt} Classes=${cls}`);
    }

    // TABS
    console.log('\n3. TABS');
    const tb = await page.locator('.tab').all();
    for (let i = 0; i < tb.length; i++) {
      const txt = await tb[i].textContent();
      const cls = await tb[i].getAttribute('class');
      console.log(`  ${i+1}. "${txt?.trim()}" [${cls}]`);
    }

    // SEARCH
    console.log('\n4. SEARCH');
    const srch = await page.locator('input[placeholder*="Search"]').first();
    if (await srch.count() > 0) {
      const ph = await srch.getAttribute('placeholder');
      const cls = await srch.getAttribute('class');
      console.log(`  Placeholder="${ph}" Classes="${cls}"`);
    }

    // FILTERS
    console.log('\n5. FILTER BUTTONS');
    const flt = await page.locator('.mon-filter-btn').all();
    for (let i = 0; i < flt.length; i++) {
      const txt = await flt[i].textContent();
      const icn = await flt[i].locator('.material-symbols-outlined').first().textContent();
      console.log(`  ${i+1}. Icon="${icn?.trim()}" Label="${txt?.trim()}"`);
    }

    // HEADERS
    console.log('\n6. TABLE HEADERS');
    const hdr = await page.locator('.al-header .al-h').all();
    for (let i = 0; i < hdr.length; i++) {
      const txt = await hdr[i].textContent();
      console.log(`  ${i+1}. "${txt?.trim()}"`);
    }

    // ROWS
    console.log('\n7. ROWS (first 3)');
    const rws = await page.locator('.al-row').all();
    console.log(`  Total: ${rws.length}`);
    for (let i = 0; i < Math.min(3, rws.length); i++) {
      const cls = await rws[i].locator('.al-cell-audit').first().textContent();
      const st = await rws[i].locator('.al-cell-status').first().textContent();
      console.log(`  ${i+1}. Audit="${cls?.substring(0,30)}..." Status="${st?.trim()}"`);
    }

    // BUTTONS ON ROW
    console.log('\n8. ROW BUTTONS (first row)');
    const btns = await rws[0].locator('button').all();
    for (let i = 0; i < btns.length; i++) {
      const txt = await btns[i].textContent();
      const cls = await btns[i].getAttribute('class');
      console.log(`  ${i+1}. Text="${txt?.trim()}" Classes="${cls}"`);
    }

  } finally {
    await browser.close();
  }
})().catch(console.error);
