/* Single-file review preview of the landing redesign. Inlines the site's own
 * CSS (with a data-theme shim so an explicit viewer theme choice wins), embeds
 * the three changed pages' <main> content, rewrites links to the live site. */
const fs = require('fs'); const path = require('path');
const OUT = process.argv[2];
const LIVE = 'https://help.samvinas.com';

let theme = fs.readFileSync('assets/css/theme.css', 'utf8');
const base = fs.readFileSync('assets/css/base.css', 'utf8');
// data-theme shim: explicit light beats dark OS; explicit dark wins anywhere
const darkTokens = theme.match(/@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\}\s*\}/)[1];
theme = theme.replace('@media (prefers-color-scheme: dark) {\n  :root {',
                      '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {');
theme += `\n:root[data-theme="dark"] {${darkTokens}}\n`;

const PAGES = [
  ['index.html', 'The new landing page', 'landing',
   'help.samvinas.com — the three doors, then the map. Cards are keyboard-reachable, whole-card clickable, axe-clean.'],
  ['facilitator/option-explorer.html', 'New: Option Explorer', 'option-explorer',
   'The page the middle door opens — routes the design choice through the process table, the tool modes, the classic shape, and templates. This will grow into the recipe library (phase 2b).'],
  ['facilitator/index.html', 'Facilitator guide (one added entry)', 'facilitator-index',
   'Only change: Option Explorer added under Design and facilitate, and to the side rail.'],
];

const sections = PAGES.map(([rel, label, id, note]) => {
  const html = fs.readFileSync(path.join('dist', rel), 'utf8');
  let main = html.match(/<main class="page" id="main">([\s\S]*?)<\/main>/)[1];
  const dir = path.posix.dirname(rel);
  main = main.replace(/href="([^"]+)"/g, (m, h) => {
    if (/^(https?:|#|mailto:)/.test(h)) return `href="${h}" target="_blank" rel="noopener"`;
    const abs = path.posix.normalize(path.posix.join('/', dir === '.' ? '' : dir, h));
    if (abs.includes('option-explorer')) return 'href="#option-explorer"';
    if (abs === '/facilitator/index.html' || abs === '/facilitator/') return 'href="#facilitator-index"';
    return `href="${LIVE}${abs}" target="_blank" rel="noopener"`;
  });
  return `<section class="rv-section" id="${id}">
<div class="rv-label"><span class="rv-chip">${label}</span><p>${note}</p></div>
<div class="rv-sheet"><main class="page">${main}</main></div>
</section>`;
}).join('\n');

const out = `<title>Help landing redesign — preview</title>
<style>
${theme}
${base}
/* review chrome — deliberately not the site's register, so it can't be
   mistaken for page content */
body { padding-bottom: 60px; }
.rv-head { max-width: 720px; margin: 28px auto 8px; padding: 0 20px; }
.rv-head h1 { font-size: 1.25rem; margin: 0 0 .4em; }
.rv-head p { color: var(--text-dim); font-size: .95rem; margin: .3em 0; }
.rv-section { margin-top: 36px; }
.rv-label { max-width: 720px; margin: 0 auto 10px; padding: 0 20px; }
.rv-chip { display: inline-block; font-size: .72rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase; color: var(--text-dim);
  border: 1px solid var(--accent); border-radius: 999px; padding: 3px 12px; }
.rv-label p { color: var(--text-dim); font-size: .88rem; margin: .5em 0 0; }
.rv-sheet .page { border-radius: 8px; border: 1px solid var(--line); }
</style>
<div class="rv-head">
  <h1>help.samvinas.com — landing redesign</h1>
  <p>Held locally on <code>main</code> (commit <code>e7b2644</code>), not deployed. Links to pages that already exist open the live site; links to the new page jump within this preview.</p>
</div>
${sections}`;
fs.writeFileSync(OUT, out);
console.log('preview written', OUT, out.length, 'bytes');
