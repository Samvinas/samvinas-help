# Theming this help site

This site is designed so that an organisation can make it their own — colours,
logo, images, language — by touching a *small, well-marked set of files* and
without ever editing HTML or layout code. This page is the human guide; if you
are pointing an AI assistant at the repo, give it `THEMING-AI.md` instead
(same rules, written as a protocol).

## The five-minute re-brand

1. **Colours** — edit the hex values in `assets/css/theme.css`. That file
   contains every colour on the site, one commented token each. Nothing else
   defines colours.
2. **Logo** — replace `assets/brand/logo.svg` (shown 22 px tall in the header)
   and `assets/brand/favicon.svg` (the browser-tab icon).
3. **Name & footer** — edit `site.title` and `site.footer` in `tools.json`.
4. **Check yourself in** — run:

   ```
   npm install
   npm run build
   ```

   The build starts with an automatic contrast check (`check-theme`) and
   **fails if any colour pair is below WCAG 2.2 AA** — the accessibility
   standard this site ships at. If it fails it names the token and tells you
   which direction to adjust. This is deliberate: a themed copy of this site
   cannot silently become unreadable.

## What lives where

| Path | What it is | Edit it? |
|---|---|---|
| `assets/css/theme.css` | Every colour, as named tokens (light + dark scheme) | **Yes — this is the theming surface** |
| `assets/brand/` | Logo and favicon | **Yes — replace with your own** |
| `assets/images/diagrams/` | Concept diagrams (e.g. `diverge-converge.svg`) | **Yes — substitute your own versions** |
| `assets/images/screenshots/` | Screenshots of the Samvinas app | Usually no — they show the product, not your brand |
| `tools.json` | Site title, footer, language, tool list | Yes — text only |
| `content/**/*.md` | The help pages themselves (Markdown) | Yes — this is the content |
| `assets/css/base.css` | Layout, typography, structure | **No** — if you want to change a colour here, it should be a token in theme.css |
| `template.html` | The page shell: landmarks, skip link, header/footer | **No** — it carries the site's structural accessibility |
| `build.js`, `check-theme.js` | The build and its accessibility gate | No |

## Colours: how the tokens work

`theme.css` defines two blocks: the light scheme (`:root`) and the dark scheme
(inside `@media (prefers-color-scheme: dark)` — readers get it automatically
when their device is set to dark; delete the block if your brand is
light-only). Each token has one job:

| Token | Job | Contrast it must keep |
|---|---|---|
| `--bg` | page background | — |
| `--surface` | code blocks, tables, callout panels | — |
| `--text` | body text | ≥ 4.5:1 on `--bg` and `--surface` |
| `--text-dim` | secondary text (labels, footer, quotes) | ≥ 4.5:1 on `--bg` and `--surface` |
| `--link` | links | ≥ 4.5:1 on `--bg` and `--surface` |
| `--accent` | decorative accents (blockquote bar) | none — **never use it for text** |
| `--focus` | keyboard focus ring | ≥ 3:1 on `--bg` and `--surface` |
| `--line` | hairline rules and table borders | none (decorative) |

You never need to compute these yourself — `npm run check-theme` does it and
prints the full table. A practical tip when a pair fails: darken the
foreground (light scheme) or lighten it (dark scheme) a step at a time and
re-run; two or three iterations usually lands it.

## Logo

- Any SVG or PNG works; it renders 22 px tall next to the site title.
- The header follows the reader's light/dark preference, so your logo must
  read on both `--bg` values. The shipped `logo.svg` shows the trick: an SVG
  can carry its own `@media (prefers-color-scheme: dark)` rule internally and
  swap its fill colours. If your logo can't work on dark, the simplest fix is
  to delete the dark block from `theme.css` (light-only site).
- The favicon (`favicon.svg`) sits on the browser tab, not the page — a solid
  background tile (like the shipped one) works best at 16–32 px.

## Images in help pages

Two folders, split by *why the image would ever change*:

- **`assets/images/diagrams/`** — conceptual illustrations (the
  diverge/converge model, process pictures). These are the ones organisations
  most often want to replace with their own drawing, translation, or
  house style. Replacing a file **keeps the filename** so every page that uses
  it picks up your version with no content edits.
- **`assets/images/screenshots/`** — pictures of the Samvinas app itself.
  These track the product: update them when the app changes, not when your
  brand does.

Referencing an image from a Markdown page — always a site-root path, and
always with alt text that says what the image *means*:

```markdown
![Creative work alternates between diverging to generate options and
converging to make choices.](/assets/images/diagrams/diverge-converge.svg)
```

The build rewrites `/assets/…` paths to work wherever the site is hosted
(root domain or a sub-path). Two rules of house style:

1. **Alt text is required.** Describe the meaning, not the picture ("The
   diverge phase widens…", not "diagram of triangles"). Purely decorative
   images take an empty alt: `![](…)`.
2. **Diagrams carry their own background** (see the shipped SVG) so they stay
   readable when the page behind them switches to dark mode.

## Accessibility statement of intent

The shipped template conforms to WCAG 2.2 AA: computed contrast on every
colour pair (enforced at build time), semantic landmarks, a skip link, visible
keyboard focus, reduced-motion support, and no content that depends on
JavaScript. Your content keeps that promise as long as you write meaningful
headings in order (one `#` per page, `##` below it), give images real alt
text, and let the build's contrast check pass honestly.
