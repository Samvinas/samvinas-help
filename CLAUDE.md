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

- `tools.json` — tool list (slug/name/blurb) + site config.
- `template.html` — shared shell with `{{title}}`, `{{content}}`, `{{homeHref}}`,
  etc. All presentation lives here so content edits can't break layout.
- `build.js` — renders every `content/**/*.md`, then generates a starter page for
  any tool missing a `content/<audience>/<slug>.md`. Writes `dist/` + `.nojekyll`.
- Hosting: GitHub Pages (Actions workflow) or Cloudflare Pages (`npm run build`,
  output `dist`).

## Common tasks

- **Add real content for a tool:** create/edit `content/participant/<slug>.md`
  and `content/facilitator/<slug>.md`. Rebuild.
- **Add a new tool:** add it to `tools.json`; a starter page appears on next build.
- **Change the look:** edit `template.html` (inline CSS).

## Notes

- `dist/` and `node_modules/` are gitignored — the site is built in CI / on the host.
- Content is author-trusted (each org hosts their own); the build does not sanitise.
