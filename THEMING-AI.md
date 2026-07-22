# THEMING-AI.md — protocol for AI agents customising this site

You are working on a static help site: Markdown in `content/` → HTML in
`dist/` via `node build.js`, no framework. This file is the machine-oriented
counterpart of `THEMING.md`. Follow it exactly; where it conflicts with a user
request, tell the user which invariant blocks the request instead of silently
breaking it.

## Invariants — never violate

1. **Output contract:** the build must keep emitting
   `dist/participant/<slug>.html` and `dist/facilitator/<slug>.html` for every
   slug in `tools.json`. The Samvinas product deep-links these paths.
2. **Colours live only in `assets/css/theme.css`.** Never hard-code a colour in
   `base.css`, `template.html`, or inline in content. If a new colour role is
   genuinely needed, add a new documented token to theme.css AND a
   corresponding pair to `PAIRS` in `check-theme.js`.
3. **`npm run check-theme` must exit 0** after any change to theme.css. Never
   achieve this by removing/loosening entries in `PAIRS` or editing the
   minimum ratios — fix the colour values instead. The minima are WCAG 2.2 AA
   (4.5:1 normal text, 3:1 focus ring) and are law-derived, not preferences.
4. **Do not remove structural accessibility** from `template.html` or
   `base.css`: the skip link, `<main id="main">`, header/footer landmarks,
   `:focus-visible` outline, `prefers-reduced-motion` block, underlined
   content links, `lang` attribute.
5. **theme.css structure is parsed by machine:** light tokens in the first
   `:root` block; dark tokens in a `:root` block inside
   `@media (prefers-color-scheme: dark)`. Keep hex format (`#RRGGBB`). Do not
   move tokens into other files, selectors, or `var()` indirection.
6. Images referenced from Markdown use site-root paths (`/assets/images/…`)
   and must have meaningful alt text (or explicitly empty alt for pure
   decoration).

## Task recipes

### Change the colour scheme to brand colours X, Y, Z
1. Edit hex values in `assets/css/theme.css` only. Map the brand colours to
   token *roles* (read each token's comment): background(s), text, links,
   decorative accent, focus ring. A brand's "primary" is usually `--accent`
   and/or `--link`, not `--bg`.
2. Update both the light block and the dark block (or delete the dark block
   entirely for a light-only brand — that is supported).
3. Run `npm run check-theme`. If a pair fails, adjust the named foreground
   token darker (light scheme) / lighter (dark scheme) and re-run until exit 0.
   Preserve hue; change lightness. Report the final ratios to the user.
4. Update the ratio numbers in theme.css's comments to match the check output.
5. Run `npm run build`; confirm it reports the expected page count.

### Replace the logo / favicon
- Overwrite `assets/brand/logo.svg` (rendered 22px tall; must be legible on
  BOTH schemes' `--bg` — an internal `@media (prefers-color-scheme: dark)`
  style inside the SVG is the supported technique, see the shipped file) and
  `assets/brand/favicon.svg` (32×32 viewBox, self-backgrounded tile).
- Keep the filenames. Do not edit `template.html` to point elsewhere.

### Add or replace a diagram image
- Org-replaceable concept art → `assets/images/diagrams/<kebab-name>.svg`.
  App screenshots → `assets/images/screenshots/`.
- When replacing (e.g. an org's own diverge/converge drawing), keep the
  existing filename so pages update without content edits.
- SVG diagrams must carry their own background rectangle (dark-mode safety)
  and, if they contain text, use colours with ≥4.5:1 against that background.
- Reference from Markdown: `![<meaningful alt>](/assets/images/diagrams/<name>.svg)`.

### Add a tool page / new tool
- Add the tool to `tools.json` (slug must match the Samvinas app's tool slug);
  the next build generates starter pages. Author real content at
  `content/participant/<slug>.md` and `content/facilitator/<slug>.md`.

### Translate the site
- Set `site.lang` in `tools.json`; translate `site.title`, `site.footer`, and
  the Markdown in `content/`. Do not translate slugs or paths.

## Verification (run after every change)
```
npm run check-theme    # must exit 0 — paste the table into your report
npm run build          # must exit 0 — page count should be ≥ 2×(tool count)
```
There are no other test suites in this repo. If you changed template.html or
base.css (rare, see invariant 4), additionally confirm by inspection of a
built page in `dist/`: skip link first in body, one `<main>`, heading order
intact, stylesheet hrefs resolve.
