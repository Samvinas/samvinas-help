/* Smoke test for the help-site tab enhancement (run from samvinas-help root).
 * Serves dist/ on a local port, walks the brainstorm page with a keyboard,
 * and checks the ARIA contract + no-JS fallback. */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve('dist');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(DIST, p);
  if (!file.startsWith(DIST) || !fs.existsSync(file)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); };

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();

  // 1) Enhanced page: ARIA contract
  const page = await browser.newPage();
  await page.goto(`${base}/facilitator/brainstorm.html`);
  const tabs = page.locator('[role="tab"]');
  check('3 tabs rendered', await tabs.count() === 3, `count=${await tabs.count()}`);
  check('tablist labelled', await page.locator('[role="tablist"][aria-label]').count() === 1);
  check('tab 1 selected', await tabs.nth(0).getAttribute('aria-selected') === 'true');
  const visiblePanels = page.locator('[role="tabpanel"]:not([hidden])');
  check('exactly 1 visible panel', await visiblePanels.count() === 1);
  check('labels correct', (await tabs.allTextContents()).join('|') === 'Samvinas|Paper and pen|When & why',
    (await tabs.allTextContents()).join('|'));

  // 2) Click activation
  await tabs.nth(1).click();
  check('click activates Paper and pen',
    await tabs.nth(1).getAttribute('aria-selected') === 'true'
    && await page.locator('#panel-paper-and-pen').isVisible()
    && await page.locator('#panel-samvinas').isHidden());

  // 3) Keyboard: arrows move+activate, Home/End jump, roving tabindex
  await tabs.nth(1).focus();
  await page.keyboard.press('ArrowRight');
  check('ArrowRight → When & why', await tabs.nth(2).getAttribute('aria-selected') === 'true'
    && await page.locator('#panel-when-why').isVisible());
  await page.keyboard.press('ArrowRight');
  check('ArrowRight wraps to first', await tabs.nth(0).getAttribute('aria-selected') === 'true');
  await page.keyboard.press('End');
  check('End → last', await tabs.nth(2).getAttribute('aria-selected') === 'true');
  await page.keyboard.press('Home');
  check('Home → first', await tabs.nth(0).getAttribute('aria-selected') === 'true');
  const tis = await Promise.all([0, 1, 2].map(i => tabs.nth(i).getAttribute('tabindex')));
  check('roving tabindex', tis.join(',') === '0,-1,-1', tis.join(','));

  // 4) Hash deep link opens the right tab
  const page2 = await browser.newPage();
  await page2.goto(`${base}/facilitator/brainstorm.html#paper-and-pen`);
  check('hash deep link opens tab',
    await page2.locator('[role="tab"]', { hasText: 'Paper and pen' }).getAttribute('aria-selected') === 'true'
    && await page2.locator('#panel-paper-and-pen').isVisible());

  // 5) No-JS fallback: all three sections stacked and visible
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page3 = await ctx.newPage();
  await page3.goto(`${base}/facilitator/brainstorm.html`);
  check('no-JS: no tablist', await page3.locator('[role="tablist"]').count() === 0);
  const h2s = await page3.locator('.tab-panel h2').allTextContents();
  check('no-JS: 3 stacked sections visible', h2s.length === 3
    && await page3.locator('.tab-panel').nth(2).isVisible(), h2s.join('|'));

  // 6) A page without tab headings is untouched
  const page4 = await browser.newPage();
  await page4.goto(`${base}/facilitator/getting-started.html`);
  check('non-tab page untouched', await page4.locator('[data-tabs]').count() === 0);

  await browser.close();
  server.close();
  let fail = 0;
  for (const r of results) { console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  (' + r.detail + ')' : ''}`); if (!r.ok) fail++; }
  console.log(fail ? `\n${fail} FAILURES` : '\nall green');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
