/* Generates a single-file review preview of the restructured facilitator pages.
 * Output: /tmp scratchpad preview.html. Not part of the site build. */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const OUT = process.argv[2];

const GROUPS = [
  ['Generating', ['brainstorm', 'brainwriting', 'tagged-brainstorm', 'rich-brainstorm', 'five-whys', 'elaboration', 'importer']],
  ['Focusing', ['voting', 'ranking', 'value-doability', 'evaluation-matrix']],
  ['Organising', ['clustering', 'stakeholder-map', 'wordcloud', 'tagging', 'soapbox', 'signup']],
  ['Development', ['ppco', 'alou', 'lco', 'pmi', 'backcasting']],
  ['Utility', ['breakout-groups', 'instructions', 'timer', 'raise-hand', 'event-info', 'workspace-launcher']],
];
const SLUGS = GROUPS.flatMap(([, s]) => s);

const dataUri = (p) => {
  const file = path.join(ROOT, p);
  if (!fs.existsSync(file)) return null;
  return 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
};

const pages = {};
const titles = {};
for (const slug of SLUGS) {
  let html = fs.readFileSync(path.join(DIST, 'facilitator', `${slug}.html`), 'utf8');
  const m = html.match(/<main class="page" id="main">([\s\S]*?)<\/main>/);
  let main = m[1];
  // <picture> → plain <img> (narrow variants don't matter in the preview)
  main = main.replace(/<picture>[\s\S]*?(<img [^>]*>)<\/picture>/g, '$1');
  // relative asset srcs → data URIs
  main = main.replace(/src="((?:\.\.\/)+)(assets\/[^"]+)"/g, (all, up, rest) => {
    const uri = dataUri(rest);
    return uri ? `src="${uri}"` : all;
  });
  pages[slug] = main;
  titles[slug] = (main.match(/<h1[^>]*>([^<]+)</) || [, slug])[1].replace(/ — for facilitators/, '');
}

// Theme CSS adapted to the artifact's three theme states.
let theme = fs.readFileSync(path.join(ROOT, 'assets/css/theme.css'), 'utf8');
const darkTokens = (theme.match(/@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\}\s*\}/) || [])[1] || '';
theme = theme.replace('@media (prefers-color-scheme: dark) {\n  :root {', '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {');
theme += `\n:root[data-theme="dark"] {${darkTokens}}\n`;

const base = fs.readFileSync(path.join(ROOT, 'assets/css/base.css'), 'utf8');
// tabs.js, adapted: init becomes callable per-container for page swaps
let tabs = fs.readFileSync(path.join(ROOT, 'assets/js/tabs.js'), 'utf8');
tabs = tabs.replace("document.querySelectorAll('[data-tabs]').forEach(init);",
  "window.__enhanceTabs = function (scope) { scope.querySelectorAll('[data-tabs]').forEach(init); };");

const navGroups = GROUPS.map(([label, slugs]) =>
  `<li class="pv-group"><span>${label}</span><ul>` +
  slugs.map(s => `<li><a href="#${s}" data-slug="${s}">${titles[s]}</a></li>`).join('') +
  '</ul></li>').join('');
const options = GROUPS.map(([label, slugs]) =>
  `<optgroup label="${label}">` + slugs.map(s => `<option value="${s}">${titles[s]}</option>`).join('') + '</optgroup>').join('');

const intro = `
<h1>Samvinas Help — tabbed tool pages</h1>
<p><strong>28 facilitator tool pages</strong> restructured into the three-tab format:
<em>Samvinas</em> (running it in the app) · <em>Paper and pen</em> (the analogue recipe) ·
<em>When &amp; why</em> (when to reach for it, why it works, what follows).</p>
<p>Pick any page from the list. The tabs are live — click them, arrow-key through them,
exactly as they'll behave on help.samvinas.com. Two pages stayed single-column on purpose
(CSV export, Event report — tabs made no sense there). Nothing has been deployed;
this preview is the review copy.</p>
<h2>Worth your eye during review</h2>
<ul>
<li><strong>Paper and pen tabs are new writing throughout</strong> — each is a runnable analogue recipe (materials, mechanic, harvest step, one failure mode). Check they match how you actually run these exercises.</li>
<li><strong>Personal Workspace:</strong> the old pages claimed a "gather results" feature that doesn't exist in the app (it belongs to Breakout Groups) — both pages now describe the real harvest pattern (bring your best item back; per-workspace report export). This fix touches one participant page too.</li>
<li><strong>App behaviour claims</strong> were checked against the Kelvin source where flagged (Source terminology, Ranking's lock, Word Cloud piping) — all confirmed.</li>
<li>URLs are unchanged everywhere — the app's <strong>?</strong> links keep working.</li>
</ul>`;

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Samvinas Help — tabbed pages preview</title>
<style>
${theme}
${base}
/* ---- preview shell (uses the site's own tokens) ---- */
body { margin: 0; }
.pv-bar { position: sticky; top: 0; z-index: 5; background: var(--bg-header);
  border-bottom: 1px solid var(--line); padding: .6em 1em; display: flex;
  gap: 1em; align-items: center; flex-wrap: wrap; }
.pv-bar strong { font-size: .95rem; }
.pv-bar .note { color: var(--text-dim); font-size: .8rem; }
.pv-wrap { display: grid; grid-template-columns: 230px minmax(0,1fr); gap: 1.5em;
  max-width: 1080px; margin: 0 auto; padding: 1em; align-items: start; }
.pv-nav { position: sticky; top: 3.6em; font-size: .88rem; max-height: calc(100vh - 5em); overflow-y: auto; }
.pv-nav ul { list-style: none; margin: 0; padding: 0; }
.pv-nav .pv-group > span { display: block; font-weight: 600; color: var(--text-dim);
  text-transform: uppercase; font-size: .72rem; letter-spacing: .06em; margin: 1em 0 .2em; }
.pv-nav a { display: block; padding: .18em .5em; border-radius: 4px;
  color: var(--link); text-decoration: none; }
.pv-nav a:hover { background: var(--surface); }
.pv-nav a[aria-current="page"] { background: var(--surface); color: var(--text); font-weight: 600; }
.pv-select { display: none; font: inherit; padding: .4em; max-width: 100%; }
main.page { background: var(--bg-content); border: 1px solid var(--line);
  border-radius: 8px; padding: 1.5em 2em; min-height: 60vh; }
@media (max-width: 880px) {
  .pv-wrap { grid-template-columns: 1fr; }
  .pv-nav { display: none; }
  .pv-select { display: block; }
  main.page { padding: 1.2em 1em; }
}
.pv-toast { position: fixed; bottom: 1em; left: 50%; transform: translateX(-50%);
  background: var(--text); color: var(--bg); padding: .5em 1em; border-radius: 6px;
  font-size: .85rem; opacity: 0; transition: opacity .2s; pointer-events: none; }
.pv-toast.show { opacity: 1; }
</style>
<div class="pv-bar"><strong>Samvinas Help — review preview</strong>
  <span class="note">local build · not deployed</span>
  <select class="pv-select" aria-label="Choose a page"><option value="">Overview</option>${options}</select>
</div>
<div class="pv-wrap">
  <nav class="pv-nav" aria-label="Preview pages"><ul>
    <li><a href="#" data-slug="">Overview &amp; review notes</a></li>
    ${navGroups}
  </ul></nav>
  <main class="page" id="pv-main" tabindex="-1"></main>
</div>
<div class="pv-toast" role="status" id="pv-toast"></div>
<script>
${tabs}
const PAGES = ${JSON.stringify(pages)};
const INTRO = ${JSON.stringify(intro)};
const mainEl = document.getElementById('pv-main');
const toast = document.getElementById('pv-toast');
let toastT;
function say(msg) { toast.textContent = msg; toast.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2600); }
function show(slug, focus) {
  mainEl.innerHTML = slug && PAGES[slug] ? PAGES[slug] : INTRO;
  window.__enhanceTabs(mainEl);
  document.querySelectorAll('.pv-nav a').forEach(a =>
    a.dataset.slug === (slug || '') ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  document.querySelector('.pv-select').value = slug || '';
  if (focus) { mainEl.focus({ preventScroll: true }); window.scrollTo(0, 0); }
}
document.querySelector('.pv-nav').addEventListener('click', e => {
  const a = e.target.closest('a[data-slug]'); if (!a) return;
  e.preventDefault(); show(a.dataset.slug, true);
});
document.querySelector('.pv-select').addEventListener('change', e => show(e.target.value, true));
mainEl.addEventListener('click', e => {
  const a = e.target.closest('a[href]'); if (!a) return;
  const href = a.getAttribute('href');
  const m = href.match(/facilitator\\/([\\w-]+)\\.html/);
  if (m && PAGES[m[1]]) { e.preventDefault(); show(m[1], true); return; }
  if (/^(\\.\\.\\/|\\/|participant|principles|facilitator)/.test(href) && !href.startsWith('#')) {
    e.preventDefault();
    say('That page is on the full site — this preview holds only the restructured tool pages.');
  }
});
show('', false);
</script>`;

fs.writeFileSync(OUT, html);
console.log(`preview written: ${OUT} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
