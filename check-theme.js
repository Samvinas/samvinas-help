#!/usr/bin/env node
/**
 * check-theme.js — computed WCAG 2.2 AA contrast check for theme.css
 *
 * "Accessibility is verified, not assumed." This script parses the colour
 * tokens out of assets/css/theme.css (light block + dark block) and computes
 * the WCAG contrast ratio for every foreground/background pair the site
 * actually uses. It runs automatically at the start of `npm run build`, so a
 * re-themed copy of this site cannot ship unreadable colours by accident.
 *
 *   npm run check-theme     — run it on its own
 *
 * If it fails: it names the token and the ratio it got. Fix by darkening the
 * foreground (light scheme) or lightening it (dark scheme) until the pair
 * passes, then re-run. Do NOT fix a failure by deleting the pair from the
 * PAIRS list below — the list encodes where each token is used in base.css,
 * not a preference.
 *
 * Minimum ratios (WCAG 2.2 AA):
 *   4.5:1  normal text          3.0:1  focus ring / non-text UI
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(ROOT, 'assets/css/theme.css'), 'utf8');

// Which foreground token must read against which background, at what minimum.
// This mirrors how base.css uses the tokens — update it only if base.css
// changes, never to silence a failing colour.
const PAIRS = [
  ['--text',     '--bg',      4.5, 'body text on page background'],
  ['--text',     '--surface', 4.5, 'text in code blocks / tables / callouts'],
  ['--text-dim', '--bg',      4.5, 'secondary text (audience label, footer, blockquotes)'],
  ['--text-dim', '--surface', 4.5, 'secondary text on raised panels'],
  ['--link',     '--bg',      4.5, 'links on page background'],
  ['--link',     '--surface', 4.5, 'links inside callouts / footer'],
  ['--focus',    '--bg',      3.0, 'keyboard focus ring on page background'],
  ['--focus',    '--surface', 3.0, 'keyboard focus ring on raised panels'],
  ['--bg',       '--text',    4.5, 'skip-link label (inverted colours)'],
];

// ---- parse the two token blocks -------------------------------------------
function tokensOf(block) {
  const out = {};
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) out[m[1]] = m[2];
  return out;
}
const darkMatch = css.match(/@media[^{]*prefers-color-scheme:\s*dark[^{]*\{([\s\S]*)\}/);
const lightBlock = darkMatch ? css.slice(0, darkMatch.index) : css;
const schemes = { light: tokensOf(lightBlock) };
if (darkMatch) schemes.dark = { ...schemes.light, ...tokensOf(darkMatch[1]) };

// ---- WCAG relative luminance / contrast ratio ------------------------------
function srgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}
function luminance(hex) {
  const [r, g, b] = srgb(hex).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ---- run -------------------------------------------------------------------
let failures = 0;
for (const [scheme, tokens] of Object.entries(schemes)) {
  console.log(`\n${scheme} scheme`);
  for (const [fg, bg, min, where] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      console.log(`  ✗ ${fg} or ${bg} missing from theme.css (${scheme})`);
      failures++;
      continue;
    }
    const ratio = contrast(tokens[fg], tokens[bg]);
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(
      `  ${ok ? '✓' : '✗'} ${fg} on ${bg}  ${ratio.toFixed(2)}:1  (min ${min}:1)  — ${where}` +
      (ok ? '' : `  → adjust ${fg} in the ${scheme} block`)
    );
  }
}

if (failures) {
  console.error(`\ncheck-theme: ${failures} contrast pair(s) below WCAG AA. Fix theme.css and re-run.`);
  process.exit(1);
}
console.log('\ncheck-theme: all contrast pairs pass WCAG 2.2 AA.');
