# Setting up an event

This page assumes you know what you want the session to *do*, and you are looking for guidance on how to configure Samvinas to do it.

## 1. Create the event

Sign in, choose **New event**, and give your event a name. You will be invited to either start from a blank flow or select one of
your saved templates. If this is the first time using the system, or you have never saved a previous event as a template, you will only have the blank event as an option.

Every event receives a randomly generated five-character **join code** and a QR code. Participants join the event by either entering the code, or snapping the QR code. This is important because it means that your colleagues need neither an account nor an app.

## 2. Build the flow

The flow is the ordered list of tools you want your session to move through — for example
**Brainstorm → Voting → Clustering**.  Flows are completely dynamic. You can add or remove tools as you go. 

Add tools with the **+** button. Each row shows the tool's icon, name, a live
item count, a **⚙** for settings and a **Focus** button. Clicking a tool's
*name* opens the participant's view of it, so you can see exactly what the room
will see before anyone joins.

![The flow list with three tools stacked in order — Ideas, Voting, Clustering. Each row has a drag handle, the tool's icon, its name, a live count of items, a gear button for settings and a Focus button. Small plus buttons sit between the rows for inserting another tool.](/assets/images/screenshots/flow-list.png)

Inside **⚙ → Basics**:

- **Name** — what participants see this step called.
- **Prompt** — the question they answer. The highest-leverage field on the
  page: a vague prompt produces vague ideas.
- **Source** and **Filters** — where this tool's items come from. That's the
  next section, and it's the one idea in Samvinas worth slowing down for.

## 3. Pipes: passing work from one tool to the next

By default a tool starts empty and collects its own items. But most of the time
you want the *next* step to work on what the *last* step produced — vote on the
ideas you just generated, cluster the ones that won the vote. That connection is
a **pipe**.

Think of it as handing a stack of cards to the next person in the room. The
Brainstorm collects the cards. Voting takes that same stack and puts stars on
them. Clustering takes the starred stack and sorts it into piles. Nobody
re-types anything, and nobody exports a spreadsheet in between.

Three things are worth knowing, because they're what make pipes different from
copy-and-paste:

**It's live, not a snapshot.** A pipe isn't a one-time import. Add an idea to
the Brainstorm while Voting is open and it appears in Voting. You don't have to
"finish" a step before wiring the next one up.

**It flows forward only.** A tool can draw from any tool *above* it in the
flow, never below. That's why the source list only offers earlier tools — and
why reordering your flow can disconnect a pipe.

**It chains.** If Clustering draws from Voting, and Voting draws from
Brainstorm, then Clustering can see the Brainstorm's ideas through Voting.
You don't need to connect Clustering to both.

### Setting a source

Open **⚙ → Basics** on the tool that should *receive* the items — the
downstream one — and pick from **Source**. A tool can have more than one
source, and they merge into a single incoming set.

![The Basics tab of a tool's settings. Below the Name and Prompt fields sits a SOURCE panel containing a chip reading "Voting" with a remove cross, and a "+ source" dropdown for adding another. Below that, a FILTERS panel shows one row reading "Voting: ≥2 votes".](/assets/images/screenshots/tool-basics-source-filter.png)

## 4. Filters: choosing what comes through

A pipe on its own passes everything. A **filter** is a sieve on that pipe —
it decides which of the upstream items arrive.

This is what turns a flow into a funnel. *Brainstorm → Voting → Clustering*
moves every idea forward at every step. Put a filter of **≥2 votes** on the
pipe into Clustering, and only the ideas the room actually backed get sorted —
so eighty ideas become the fifteen worth arranging.

Click a filter row (in **⚙ → Basics → Filters**) to open it. There are four
kinds of filter, and they stack — an item has to satisfy *all* of the ones you
set to come through:

![The filter dialog for a pipe from Voting. Minimum votes is set to 2. Below it: Maximum votes, a Sequence range with From and To boxes, "Contains any of these words" for comma-separated text matching, and "Only items tagged" for filtering by tag. Cancel, Clear All and Save buttons sit at the foot.](/assets/images/screenshots/pipe-filter-editor.png)

- **Minimum / maximum votes** — the workhorse. "Only what the group backed."
- **Sequence range** — by item number, so `1–10` takes the first ten. Note it
  counts the items that have already passed the *other* filters, not the first
  ten in the source: combine "≥2 votes" with "1–10" and you get the first ten
  of the ideas that got two votes.
- **Contains any of these words** — comma-separated. An item mentioning any one
  of them comes through, so this widens as you add words.
- **Only items tagged** — the fan-out filter. One Tagged Brainstorm can feed
  several downstream tools, each taking a different bucket: *Helps* into one
  view, *Hinders* into another. Leave it empty for all tags.

Anything you can set, you can loosen. **Clear All** returns the pipe to passing
everything.

> **Tightening a filter after items have already flowed:** the copies that no
> longer qualify have to go, or your downstream tool keeps work the filter
> excludes. Samvinas shows you the count and asks before removing them —
> widening a filter never prompts, because nothing is lost.

### A worked example

You want a session that generates broadly, narrows honestly, and ends with
something you can act on:

| Step | Tool | Source | Filter |
|---|---|---|---|
| 1 | Brainstorm | — | — |
| 2 | Voting | Brainstorm | — |
| 3 | Clustering | Voting | ≥2 votes |
| 4 | Value / Doability | Clustering | — |

Eighty ideas in at step 1. Everyone votes at step 2. Step 3 only sees the
backed ones, and turns fifteen into five themes. Step 4 scores those five
themes for value and do-ability. Each step does one job on the output of the
last — which is the whole idea.

## 5. Bring people in

Share the join code or project the QR. To put results on a big screen, open the
**Display** view — it follows whichever tool you have focused.

Two things worth setting before people arrive:

- **Visibility** — new tools stay hidden until you reveal them, so the room
  sees one step at a time.
- **Lock** — freezes a tool's responses without hiding what is already there.

## 6. Run it

Press **Focus** on a tool to make it the live step; everyone's screen follows.

Participants tap the **?** in the tool header for that tool's own help page —
the participant half of this site.

For small groups, add **Breakout Groups**: each group becomes its own
mini-event with a slice of the items (or the whole set), and **Gather Results**
brings their work back into the main flow for the next step.

## 7. Get the results out

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
