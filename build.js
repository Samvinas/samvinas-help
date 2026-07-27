#!/usr/bin/env node
/**
 * Samvinas Help — static build
 *
 * Wraps the Markdown in content/ in template.html and writes plain .html to
 * dist/, at the exact paths the Samvinas ? links expect:
 *   dist/participant/<slug>.html   dist/facilitator/<slug>.html
 * plus any standalone pages (index, facilitator/getting-started, …).
 *
 * Every tool in tools.json gets both a participant and a facilitator page. If a
 * content/<audience>/<slug>.md file exists it is used; otherwise a clean
 * starter page is generated from the tool's blurb so nothing 404s. To customise
 * a page, create/edit its Markdown file — you never touch HTML.
 *
 *   npm install && npm run build   →   dist/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools.json'), 'utf8'));
const site = cfg.site || {};
const template = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');

// Where site-rooted asset paths ("/assets/…") resolve on disk, and the width
// below which a screenshot gets its narrow variant if one exists.
const SRC_ROOT = ROOT;
const NARROW_BREAKPOINT = 640;

marked.setOptions({ mangle: false, headerIds: false });

/**
 * Heading ids. marked 12 no longer slugs headings, but the section rail links
 * to a page's own h2s, and readers deep-link to sections, so we add them here.
 * `pageHeadings` collects the h2s of the page currently being rendered — the
 * rail reads it after marked.parse() returns.
 */
let pageHeadings = [];
const slugify = (s) => s
  .replace(/<[^>]*>/g, '')        // heading text arrives as rendered inline HTML
  .replace(/&[a-z]+;|&#\d+;/gi, ' ')
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-');

const renderer = new marked.Renderer();
renderer.heading = function (text, level) {
  if (level < 2 || level > 3) return `<h${level}>${text}</h${level}>`;
  let id = slugify(text) || `section-${pageHeadings.length + 1}`;
  const taken = new Set(pageHeadings.map(h => h.id));
  if (taken.has(id)) {
    let n = 2;
    while (taken.has(`${id}-${n}`)) n++;
    id = `${id}-${n}`;
  }
  if (level === 2) pageHeadings.push({ id, text: text.replace(/<[^>]*>/g, '').trim() });
  return `<h${level} id="${id}">${text}</h${level}>`;
};
/* Responsive screenshots. A desktop-width screenshot is close to useless on a
 * phone — the reader gets a wall of unreadable chrome. So when an image has a
 * companion `<name>.narrow.png` beside it, emit a <picture> that serves the
 * narrow capture to narrow viewports.
 *
 * This is art direction, not resolution switching: the two files are different
 * captures of the same screen (phone layout vs desktop layout), not one image
 * at two sizes — which is exactly the case <picture media> exists for, where
 * srcset/sizes would be the wrong tool.
 *
 * Plain <img> when there is no variant, so nothing changes for the diagrams. */
renderer.image = function (href, title, text) {
  // `text` and `title` arrive from marked already HTML-escaped — running them
  // through escAttr again turns &quot; into &amp;quot;, which a screen reader
  // reads out literally. Only href needs escaping here.
  const ttl = title ? ` title="${title}"` : '';
  const img = `<img src="${escAttr(href)}" alt="${text || ''}"${ttl}>`;

  const m = /^(.*)(\.[a-z0-9]+)$/i.exec(href);
  if (!m) return img;
  const narrowHref = `${m[1]}.narrow${m[2]}`;
  // href is site-rooted ("/assets/…"); resolve against the assets tree on disk.
  if (!narrowHref.startsWith('/') || !fs.existsSync(path.join(SRC_ROOT, narrowHref.slice(1)))) return img;

  return `<picture>`
    + `<source media="(max-width: ${NARROW_BREAKPOINT}px)" srcset="${escAttr(narrowHref)}">`
    + `${img}</picture>`;
};

/* Wide tables scroll sideways rather than pushing the page past the viewport
 * (WCAG 1.4.10 reflow). Two things that needs, both of which were wrong:
 *
 * 1. The scroll container must be keyboard-reachable, or someone without a
 *    mouse cannot reach the columns off-screen — axe flags this as
 *    `scrollable-region-focusable`, and it was already failing at 390px on
 *    /principles/process-at-a-glance before this wrapper existed.
 * 2. The scrolling belongs on a wrapper, not on the <table> itself. Setting
 *    `display:block` on a table to make it scroll also drops its table
 *    semantics for some assistive tech — the rows stop being rows.
 */
renderer.table = function (header, body) {
  return '<div class="table-scroll" tabindex="0">'
    + `<table><thead>${header}</thead><tbody>${body}</tbody></table>`
    + '</div>';
};

marked.setOptions({ renderer });

// Derive a page <title> from the first markdown heading, else the file name.
function titleOf(md, fallback) {
  const m = md.match(/^\s*#\s+(.+)\s*$/m);
  return m ? m[1].trim() : fallback;
}

// House style: "CSV export — for facilitators" reads as "CSV export" in nav.
const shortTitle = (t) => String(t).split(' — ')[0].trim();

// The audience chip in the header. On facilitator pages it links back to the
// facilitator landing page (dist/facilitator/index.html — served at /facilitator/).
function audienceSlot(rel, prefix) {
  if (rel.startsWith('participant/')) return '<span class="aud">For participants</span>';
  if (rel === 'facilitator/index.md') return '<span class="aud">For facilitators</span>';
  if (rel.startsWith('facilitator/')) return `<a class="aud" href="${prefix}facilitator/">For facilitators</a>`;
  return '';
}

// How deep the page is, so relative links to the home page work at any host path.
function homeHref(rel) {
  const depth = rel.split('/').length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Breadcrumb trail (WAI-ARIA APG pattern: nav landmark, ol, aria-current).
 * Reflects the site hierarchy, not the visitor's journey:
 *   facilitator tool  → Home › Facilitator guide › <Mode index> › <Tool>
 *   facilitator page  → Home › Facilitator guide › <Page>
 *   participant tool  → Home › <Tool>
 *   principles page   → Home › Principles › <Page>
 * The root page gets no trail. Labels for authored pages come from the h1,
 * shortened at " — " (house style: "CSV export — for facilitators").
 */
function breadcrumb(rel, prefix, pageTitle) {
  if (rel === 'index.md') return '';
  const short = pageTitle.split(' — ')[0].trim();
  const toolBySlug = new Map((cfg.tools || []).map(t => [t.slug, t]));
  const page = rel.replace(/^(facilitator|participant|principles)\//, '').replace(/\.md$/, '');
  const crumbs = [{ label: 'Home', href: prefix }];

  if (rel.startsWith('facilitator/')) {
    if (page === 'index') crumbs.push({ label: 'Facilitator guide' });
    else {
      crumbs.push({ label: 'Facilitator guide', href: `${prefix}facilitator/` });
      const mode = page.match(/^tools-(\w+)$/)?.[1];
      const tool = toolBySlug.get(page);
      if (mode && cfg.modes?.[mode]) crumbs.push({ label: cfg.modes[mode].title });
      else if (tool?.mode && cfg.modes?.[tool.mode]) {
        crumbs.push({ label: cfg.modes[tool.mode].title, href: `${prefix}facilitator/tools-${tool.mode}.html` });
        crumbs.push({ label: tool.name });
      } else crumbs.push({ label: tool?.name || short });
    }
  } else if (rel.startsWith('participant/')) {
    crumbs.push({ label: toolBySlug.get(page)?.name || short });
  } else if (rel.startsWith('principles/')) {
    if (page === 'index') crumbs.push({ label: 'Principles' });
    else {
      crumbs.push({ label: 'Principles', href: `${prefix}principles/` });
      crumbs.push({ label: short });
    }
  } else crumbs.push({ label: short });

  const items = crumbs.map((c, i) =>
    i === crumbs.length - 1
      ? `<li aria-current="page">${escAttr(c.label)}</li>`
      : `<li><a href="${escAttr(c.href)}">${escAttr(c.label)}</a></li>`
  ).join('');
  return `<nav class="crumbs" aria-label="Breadcrumb"><div class="inner"><ol>${items}</ol></div></nav>`;
}

/**
 * Section rail — the pages that sit beside this one.
 *
 * The site is 60+ pages reached only by breadcrumbs and index pages; the rail
 * gives every page a persistent sense of where it sits. Which section a page
 * belongs to follows the same hierarchy as the breadcrumb:
 *   tool page (has a mode) → its mode group, in the page's own audience
 *   principles page        → Principles
 *   anything else          → the audience's guide (nav.facilitator / .participant)
 * Order comes from `nav` in tools.json (tool groups keep tools.json order), so
 * the rail can never drift from the generated index pages.
 *
 * On the current page's entry, its own h2s are nested underneath — but only
 * when there are ≥3. Most pages here are short; a two-item "on this page" list
 * is chrome, not structure.
 * Below 1100px the rail is hidden (base.css): nothing is only reachable
 * through it — breadcrumbs and the index pages carry the same links.
 */
const SUBHEADING_MIN = 3;

function navSection(rel) {
  if (rel === 'index.md') return null;
  const audience = rel.split('/')[0];
  const page = rel.replace(/^(facilitator|participant|principles)\//, '').replace(/\.md$/, '');
  const tool = (cfg.tools || []).find(t => t.slug === page);

  if (audience === 'principles') return { key: 'principles', audience, current: page };
  if (tool?.mode && cfg.modes?.[tool.mode]) return { key: `$${tool.mode}`, audience, current: page };
  if (audience === 'facilitator' || audience === 'participant') {
    const mode = page.match(/^tools-(\w+)$/)?.[1];
    return { key: audience, audience, current: mode ? `$${mode}` : page };
  }
  return null;
}

function sectionNav(rel, prefix, pageTitles) {
  const sec = navSection(rel);
  if (!sec) return '';
  const toolBySlug = new Map((cfg.tools || []).map(t => [t.slug, t]));
  let title, href, entries;

  if (sec.key.startsWith('$')) {
    // a tool-mode group, listed in the audience the reader is already in
    const mode = sec.key.slice(1);
    title = cfg.modes[mode].title;
    href = sec.audience === 'facilitator' ? `${prefix}facilitator/tools-${mode}.html` : null;
    entries = (cfg.tools || []).filter(t => t.mode === mode)
      .map(t => ({ id: t.slug, label: t.name, href: `${prefix}${sec.audience}/${t.slug}.html` }));
  } else {
    const conf = cfg.nav?.[sec.key];
    if (!conf) return '';
    title = conf.title;
    href = conf.href ? prefix + conf.href.replace(/^\//, '') : null;
    const dir = sec.key === 'principles' ? 'principles' : sec.audience;

    // An item is either a page slug, a "$mode" generated index, or a group:
    // { "group": "Utilities", "items": [...] }. Groups nest one level only —
    // deeper would out-structure the content it is navigating.
    const entryFor = (item) => {
      if (item.startsWith('$')) {                       // a generated mode index
        const mode = item.slice(1);
        return cfg.modes?.[mode]
          ? { id: item, label: cfg.modes[mode].title, href: `${prefix}facilitator/tools-${mode}.html` }
          : null;
      }
      const t = toolBySlug.get(item);
      const label = t ? t.name : shortTitle(pageTitles.get(`${dir}/${item}.md`) || item);
      return { id: item, label, href: `${prefix}${dir}/${item}.html` };
    };

    entries = (conf.items || []).map((item) => {
      if (typeof item === 'object' && item.group) {
        const children = (item.items || []).map(entryFor).filter(Boolean);
        return children.length ? { group: item.group, children } : null;
      }
      return entryFor(item);
    }).filter(Boolean);
  }
  if (!entries.length) return '';

  const subs = pageHeadings.length >= SUBHEADING_MIN
    ? `<ul class="sub">${pageHeadings.map(h =>
        `<li><a href="#${escAttr(h.id)}">${escAttr(h.text)}</a></li>`).join('')}</ul>`
    : '';

  const liFor = (e) => {
    const here = e.id === sec.current;
    return `<li${here ? ' class="here"' : ''}>` +
      `<a href="${escAttr(e.href)}"${here ? ' aria-current="page"' : ''}>${escAttr(e.label)}</a>` +
      `${here ? subs : ''}</li>`;
  };

  // A group is a plain <li> holding a label and a nested <ul>. The label is not
  // a link — there is no page behind it — so it is a <span>, and the nesting
  // does the announcing for screen readers rather than a heading would.
  const items = entries.map(e => e.group
    ? `<li class="group"><span class="section-nav__group">${escAttr(e.group)}</span>`
      + `<ul>${e.children.map(liFor).join('')}</ul></li>`
    : liFor(e)).join('');

  // On a section's own landing page (/facilitator/, /principles/) the title IS
  // the current page — mark it, or nothing in the rail would be marked at all.
  const titleIsHere = sec.current === 'index' && !sec.key.startsWith('$');
  const heading = href
    ? `<a class="section-nav__title" href="${escAttr(href)}"${titleIsHere ? ' aria-current="page"' : ''} id="section-nav-title">${escAttr(title)}</a>`
    : `<p class="section-nav__title" id="section-nav-title">${escAttr(title)}</p>`;
  return `<nav class="section-nav" aria-labelledby="section-nav-title">${heading}<ul>${items}</ul></nav>`;
}

function render(rel, md, pageTitles = new Map()) {
  const prefix = homeHref(rel);
  const pageTitle = titleOf(md, rel);
  // Authors write site-root paths (src="/assets/…", href="/participant/x.html");
  // rewrite them relative to this page's depth so the site works from any host
  // path (GitHub Pages project sites live under /<repo>/, not /).
  pageHeadings = [];   // the renderer fills this during parse; the rail reads it after
  // srcset is in here too: <picture> sources are site-rooted like src/href, and
  // a missed rewrite there fails only at narrow widths, where nobody looks.
  const html = marked.parse(md).replace(/(href|src|srcset)="\/(?!\/)/g, `$1="${prefix}`);
  // the rail needs pageHeadings, so it must be built after the parse above
  const nav = sectionNav(rel, prefix, pageTitles);
  const out = template
    .replaceAll('{{lang}}', site.lang || 'en')
    .replaceAll('{{siteTitle}}', site.title || 'Help')
    .replaceAll('{{title}}', `${pageTitle} — ${site.title || 'Help'}`)
    .replaceAll('{{audienceSlot}}', audienceSlot(rel, prefix))
    .replaceAll('{{breadcrumb}}', breadcrumb(rel, prefix, pageTitle))
    .replaceAll('{{sectionnav}}', nav)
    .replaceAll('{{bodyClass}}', nav ? 'has-rail' : '')
    .replaceAll('{{homeHref}}', prefix)
    .replaceAll('{{assetsHref}}', prefix)
    .replaceAll('{{footer}}', site.footer || '')
    .replaceAll('{{content}}', html);
  const dest = path.join(OUT, rel.replace(/\.md$/, '.html'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
  return dest;
}

// Default starter page for a tool page that has no Markdown file yet.
function starter(tool, audience) {
  const who = audience === 'participant' ? 'participants' : 'facilitators';
  return `# ${tool.name}

${tool.blurb}

> **This is a starter page.** Replace it with your own guidance for ${who} —
> create \`content/${audience}/${tool.slug}.md\` (or edit it if it already exists)
> and rebuild. You can write in any language.

## About this tool

Explain, in your own words, what ${tool.name} is for and when your groups use it.

## ${audience === 'participant' ? 'How to take part' : 'How to run it'}

Add your step-by-step guidance here.
`;
}

// Recursively collect every .md under content/.
function walk(dir, base = '') {
  const out = [];
  for (const entry of fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith('.md')) out.push(rel);
  }
  return out;
}

// Fresh output
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), ''); // serve dist/ as-is on GitHub Pages

// Static assets (stylesheets, brand files, images) are copied through verbatim.
fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });

const written = new Set();

// 0) Titles first: the section rail labels authored pages from their own h1,
//    so every title must be known before the first page is rendered.
const sources = new Map(walk(SRC).map(rel => [rel, fs.readFileSync(path.join(SRC, rel), 'utf8')]));
const pageTitles = new Map([...sources].map(([rel, md]) => [rel, titleOf(md, rel)]));

// 1) Every authored Markdown page.
for (const [rel, md] of sources) {
  render(rel, md, pageTitles);
  written.add(rel);
}

// 2) Fill in any missing tool pages with a starter.
let generated = 0;
for (const tool of cfg.tools || []) {
  for (const audience of ['participant', 'facilitator']) {
    const rel = `${audience}/${tool.slug}.md`;
    if (!written.has(rel)) { render(rel, starter(tool, audience), pageTitles); generated++; }
  }
}

// 3) Tool index pages, one per mode (facilitator side), generated from
//    tools.json so they can never drift from the tool list. Author a
//    content/facilitator/tools-<mode>.md to override one entirely.
for (const [mode, meta] of Object.entries(cfg.modes || {})) {
  const rel = `facilitator/tools-${mode}.md`;
  if (written.has(rel)) continue;
  const tools = (cfg.tools || []).filter(t => t.mode === mode);
  if (!tools.length) continue;
  const md = `# ${meta.title}\n\n${meta.intro}\n\n` +
    tools.map(t => `- **[${t.name}](/facilitator/${t.slug}.html)** — ${t.blurb}`).join('\n') +
    `\n\n---\n\n[← Back to the facilitator guide](/facilitator/)\n`;
  render(rel, md, pageTitles);
  generated++;
}

const authored = written.size;
console.log(`Built ${authored + generated} pages → dist/  (${authored} authored, ${generated} generated)`);
