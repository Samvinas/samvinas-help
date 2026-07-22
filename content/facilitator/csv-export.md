# CSV export — for facilitators

Every flow tool can hand you its results as a **CSV file** — the
lingua-franca format that spreadsheets and analysis tools import natively.
Open a tool's ⚙ menu, choose the **Data** tab, and **Export CSV**. The file
downloads immediately, named `<EVENTCODE>-<Tool-name>.csv`.

(For a shareable, formatted write-up of the *whole event* — including charts
and sketches — use **[the event report](/facilitator/event-report.html)**
instead; CSV is for working with the data.)

## The file format

The files follow the standard CSV conventions (RFC 4180), so they open
cleanly without any settings-fiddling in most software:

- **First row = column headers**; every row after it is one record.
- **Comma-separated**, one line per record. Any idea text containing commas,
  quotes or line-breaks is safely quoted — a multi-line idea stays one
  record.
- **UTF-8 encoded** (with a byte-order mark), so accented characters and
  emoji survive — including in Excel, which historically mangles plain UTF-8.
- Averages use a decimal **point** with two places (e.g. `3.50`).

## Opening it

- **Google Sheets** — *File → Import → Upload*, or drag the file into Drive
  and open it. Everything is detected automatically.
- **Excel** — double-clicking works. If your Windows locale uses commas as
  the decimal separator and columns come in wrong, use
  *Data → From Text/CSV* and pick Comma as the delimiter.
- **Apple Numbers** — opens directly.
- **Anything else** (R, Python, a database): it's a standard UTF-8 CSV; no
  surprises.

## What the columns are, per tool

The layout mirrors what the tool shows on screen, flattened to
one-row-per-record so you can sort and filter:

| Tool | Columns |
|---|---|
| [Voting](/facilitator/voting.html) | Rank · Item · Author · Votes *(most votes first)* |
| [Ranking](/facilitator/ranking.html) | Position · Item · Avg Rank · Best Rank · Worst Rank · Responses |
| [Value / Doability](/facilitator/value-doability.html) | # · Item · both axis averages · Responses *(columns take your axis labels)* |
| [Stakeholder Map](/facilitator/stakeholder-map.html) | # · Item · both axis averages · Responses *(columns take your axis labels)* |
| [Clustering](/facilitator/clustering.html) | Cluster · Item · Author *(ungrouped items listed last)* |
| [Tagging](/facilitator/tagging.html) | Tag · Item · Author — or, in multi-user mode, Item · Consensus Tag · one tally column per category |
| [Tagged Brainstorming](/facilitator/tagged-brainstorm.html) | Bucket · Idea · Author |
| [Sign Up](/facilitator/signup.html) | Item · Sign-up *(one row per signature)* |
| [Word Cloud](/facilitator/wordcloud.html) | Word · Frequency *(the full list — the on-screen cloud shows only the top words)* |
| [Brain Writing](/facilitator/brainwriting.html) | # · Idea · Provocation · Author |
| [Five Whys](/facilitator/five-whys.html) | Level · Statement · In Response To · Root Cause *(the tree, flattened depth-first)* |
| [Elaboration](/facilitator/elaboration.html) | Item · Elaboration · Author |
| [PPCO](/facilitator/ppco.html) / [ALoU](/facilitator/alou.html) / [LCO](/facilitator/lco.html) / [PMI](/facilitator/pmi.html) | Idea · Attribute · Entry · Answers Concern · Author *(attribute names follow your custom labels)* |
| [Evaluation Matrix](/facilitator/evaluation-matrix.html) | # · Option · one average column per criterion · Total · Responses *(sorted best-first; columns take your criterion labels; unscored cells are blank, not zero)* |
| [Backcasting](/facilitator/backcasting.html) | Block · Step · Author · Comments *(latest block first; unplaced steps last)* |
| [Rich Brainstorm](/facilitator/rich-brainstorm.html) | # · Idea · Author · Sketches *(a count — the drawings themselves are in the HTML report)* |
| [Brainstorm](/facilitator/brainstorm.html) and any other tool | # · Idea · Author · Created |

Three tools have no CSV of their own:
[Breakout Groups](/facilitator/breakout-groups.html) and
[Personal Workspace](/facilitator/workspace-launcher.html) keep their data in
their child events (export from inside the group or workspace), and
[Instructions](/facilitator/instructions.html) has no data — its content
appears in the HTML report.

## One habit worth having

Export **before** you Reset or delete a tool. Undo exists, but a CSV on your
laptop is the copy nobody can take away.
