# Samvinas Help

Template help‑content site for **Samvinas** events. It produces one page per tool
for **participants** and **facilitators**, plus a "setting up an event" guide.

Clone it, rewrite the words (in any language), host it, and point your Samvinas
account's **Help base URL** at it — every tool's `?` link then serves *your*
guidance.

## How Samvinas uses it

In Samvinas, an account's **Help base URL** resolves per‑tool links by convention:

```
<base>/participant/<tool>.html     ← the participant ? in the tool header
<base>/facilitator/<tool>.html     ← the facilitator ? in the tool picker
```

So if your base URL is `https://help.example.org`, the Brainstorm participant
page is `https://help.example.org/participant/brainstorm.html`. This repo builds
exactly those files.

> Precedence in Samvinas: a per‑tool override on a specific event wins; otherwise
> your base URL (these pages); otherwise the Samvinas default; otherwise no icon.

## Make it your own

1. **Use this template** (green button on GitHub) or clone the repo.
2. Edit the Markdown in **`content/`** — that's all the words. You never touch
   HTML; the shared look lives in `template.html`.
   - `content/participant/<tool>.md` and `content/facilitator/<tool>.md`
   - `content/facilitator/getting-started.md`, `content/index.md`
   - Any tool without a Markdown file gets a clean starter page automatically
     (see `tools.json` for the tool list) — create the file to customise it.
3. Translate freely — set `"lang"` in `tools.json` `site` and write in your
   language.
4. Tweak brand colour / title / footer in **`tools.json`**.

## Build locally

```bash
npm install
npm run build      # → dist/
# preview: open dist/index.html, or `npx serve dist`
```

## Host it (pick one)

**GitHub Pages** — Settings → Pages → Build and deployment → **GitHub Actions**.
The included workflow builds and publishes `dist/` on every push to `main`.
Your base URL will be `https://<owner>.github.io/<repo>`.

**Cloudflare Pages** — create a project from this repo with:

- Build command: `npm run build`
- Build output directory: `dist`

Your base URL is the Pages domain (or a custom domain you attach).

Any static host works — the build output in `dist/` is plain HTML/CSS, no
runtime dependencies.

## Structure

```
tools.json                  tool list + site config (title, colour, language)
template.html               shared page shell (inline CSS)
build.js                    Markdown → HTML into dist/
content/                    the words you edit (Markdown)
  index.md
  participant/<tool>.md
  facilitator/<tool>.md  +  facilitator/getting-started.md
.github/workflows/          GitHub Pages build + deploy
```

---

*Maintained by [Knowinnovation](https://knowinnovation.com) for
[Samvinas](https://samvinas.com).*
