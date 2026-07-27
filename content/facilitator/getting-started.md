# Setting up an event

The mechanics, end to end. This page assumes you know what you want the session
to *do* — it covers how to make Samvinas do it.

## 1. Create the event

Sign in, choose **New event**, give it a name. Start from a blank flow or one of
your saved templates.

Every event gets a five-character **join code** and a QR code. Participants need
neither an account nor an app.

## 2. Build the flow

The flow is the ordered list of tools your session moves through — for example
**Brainstorm → Voting → Clustering**.

Add tools with the **+** button. Each row in the flow shows the tool's icon,
name, a live item count, its status, a **⚙** for settings and a **Focus**
button. Clicking a tool's *name* opens the participant's view of it, so you can
see exactly what the room will see before anyone joins.

Inside **⚙ → Basics**:

- **Name** — what participants see this step called.
- **Prompt** — the question they answer. The highest-leverage field on the
  page: a vague prompt produces vague ideas.
- **Source** and **Filters** — where this tool's items come from (below).

## 3. Pipe one tool into another

Most tools can pull live data from an earlier tool instead of starting empty.
Set a tool's **Source** to an earlier tool and its items flow forward.

**Filters** narrow what comes through — minimum votes, tags, a sequence range,
or words the text must contain. So *Brainstorm → Voting → (top ideas only) →
Clustering* is one flow, not three exports.

Pipes are transitive: a tool can draw from a tool that itself drew from
another. Tighten a filter after items have already flowed and Samvinas asks
before removing the copies that no longer qualify.

## 4. Bring people in

Share the join code or project the QR. To put results on a big screen, open the
**Display** view — it follows whichever tool you have focused.

Two things worth setting before people arrive:

- **Visibility** — new tools stay hidden until you reveal them, so the room
  sees one step at a time.
- **Lock** — freezes a tool's responses without hiding what is already there.

## 5. Run it

Press **Focus** on a tool to make it the live step; everyone's screen follows.

Participants tap the **?** in the tool header for that tool's own help page —
the participant half of this site.

For small groups, add **Breakout Groups**: each group becomes its own
mini-event with a slice of the items (or the whole set), and **Gather Results**
brings their work back into the main flow for the next step.

## 6. Get the results out

- **[The event report](/facilitator/event-report.html)** — the whole event as a
  single HTML file, formatted for reading and printing.
- **[CSV export](/facilitator/csv-export.html)** — per-tool data for
  spreadsheets.

Export reflects what is on screen, filters included — so what you export is
what the room actually worked on.

---

Designing the session rather than building it? Start with
[the process at a glance](/principles/process-at-a-glance.html) and
[facilitating the room](/facilitator/facilitating.html).
