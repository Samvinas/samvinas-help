# CLAUDE.md — samvinas-help

Template help-content site for Samvinas. Markdown in `content/` → static HTML in
`dist/` via `build.js` (uses `marked`). Zero framework.

## Codespace Setup

If working in a GitHub Codespace, first install Claude Code:

```bash
npm install -g @anthropic-ai/claude-code
claude
```

## The contract that must not break

Samvinas resolves per-tool help by **convention**, so the build MUST emit exactly:

```
dist/participant/<tool>.html
dist/facilitator/<tool>.html
```

`<tool>` is the Samvinas tool **slug** (see `tools.json` — keep it in sync with
the app's registered tools). Renaming these paths breaks the `?` links in the
product.

## How it works

- `tools.json` — tool list (slug/name/blurb) + site config (title, footer, lang).
- `template.html` — shared shell with `{{title}}`, `{{content}}`, `{{homeHref}}`,
  `{{assetsHref}}`, etc. Landmarks/skip link live here; **no CSS** — styles are in
  `assets/css/`.
- `assets/css/theme.css` — every colour as documented tokens (light + dark
  blocks); the org-customisation surface. `assets/css/base.css` — layout, not
  meant to be themed.
- `check-theme.js` — computes WCAG 2.2 AA contrast on the token pairs; runs
  first in `npm run build` and FAILS the build below AA. Never silence it by
  editing its PAIRS/minima — fix the colours (see THEMING-AI.md invariants).
- `assets/brand/` — logo.svg (22px header mark; internal dark-mode media query)
  + favicon.svg. `assets/images/diagrams/` — org-replaceable concept art;
  `assets/images/screenshots/` — app screenshots.
- `build.js` — renders every `content/**/*.md`, generates a starter page for any
  tool missing one, copies `assets/` → `dist/assets/`, and rewrites site-root
  paths (`href/src="/…"`) to depth-relative so sub-path hosting works. Writes
  `dist/` + `.nojekyll`.
- Hosting: GitHub Pages (Actions workflow) or Cloudflare Worker static assets
  (`npm run build`, output `dist`) — prod is help.samvinas.com on the Worker.

## Common tasks

- **Add real content for a tool:** create/edit `content/participant/<slug>.md`
  and `content/facilitator/<slug>.md`. Rebuild.
- **Add a new tool:** add it to `tools.json`; a starter page appears on next build.
- **Re-brand / change colours:** follow `THEMING-AI.md` (protocol + invariants);
  human edition `THEMING.md`. Short version: edit theme.css tokens only, then
  `npm run check-theme` must exit 0.
- **Add an image to a page:** put it under `assets/images/{diagrams,screenshots}/`,
  reference as `![meaningful alt](/assets/images/…)`.

## Notes

- `dist/` and `node_modules/` are gitignored — the site is built in CI / on the host.
- Content is author-trusted (each org hosts their own); the build does not sanitise.
