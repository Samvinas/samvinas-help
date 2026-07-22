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

marked.setOptions({ mangle: false, headerIds: false });

// Derive a page <title> from the first markdown heading, else the file name.
function titleOf(md, fallback) {
  const m = md.match(/^\s*#\s+(.+)\s*$/m);
  return m ? m[1].trim() : fallback;
}

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

function render(rel, md) {
  const prefix = homeHref(rel);
  // Authors write site-root paths (src="/assets/…", href="/participant/x.html");
  // rewrite them relative to this page's depth so the site works from any host
  // path (GitHub Pages project sites live under /<repo>/, not /).
  const html = marked.parse(md).replace(/(href|src)="\/(?!\/)/g, `$1="${prefix}`);
  const out = template
    .replaceAll('{{lang}}', site.lang || 'en')
    .replaceAll('{{siteTitle}}', site.title || 'Help')
    .replaceAll('{{title}}', `${titleOf(md, rel)} — ${site.title || 'Help'}`)
    .replaceAll('{{audienceSlot}}', audienceSlot(rel, prefix))
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

// 1) Every authored Markdown page.
for (const rel of walk(SRC)) {
  render(rel, fs.readFileSync(path.join(SRC, rel), 'utf8'));
  written.add(rel);
}

// 2) Fill in any missing tool pages with a starter.
let generated = 0;
for (const tool of cfg.tools || []) {
  for (const audience of ['participant', 'facilitator']) {
    const rel = `${audience}/${tool.slug}.md`;
    if (!written.has(rel)) { render(rel, starter(tool, audience)); generated++; }
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
  render(rel, md);
  generated++;
}

const authored = written.size;
console.log(`Built ${authored + generated} pages → dist/  (${authored} authored, ${generated} generated)`);
