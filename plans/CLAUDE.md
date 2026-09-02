# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Scope: `plans/`. This directory is the **spec**, not notes — the components were built from it, and
their code comments cite it by section number. Treat it as source, keep it current.

## The three top-level documents

- **`README.md`** — the shared ruleset (§1–§8) plus the 68-component status checklist. Every convention
  the library follows is defined here once so 68 plans do not each reinvent it. Sections are cited from
  code (`plans/README.md §5c`), so **never renumber them**.
- **`IMPLEMENTATION-ORDER.md`** — the dependency graph, six stages, and the rules that stop a wrong
  order becoming silent debt. Its §6 is the per-component definition of done.
- **`TEMPLATE.md`** — copied to `components/<slug>.md` when work on a component starts. Its §4 Astro
  idioms gate is a real checklist, not decoration.

`components/` holds 68 plans, one per daisyUI doc page.

## How a rule gets into README.md

Rules are recorded **from measurement, with the measurement kept** — dated, with the actual bytes or
rendered HTML that proved it (see §1b's CSS-output table, §5d's three-line attribute probe). Several
existing rules replaced a plausible assumption that turned out wrong, and §7 documents its own
retraction. When adding a rule, include what you ran and what came back. Prose asserting a behaviour is
not the house style, and a bare "verified" with no output is how the wrong ones got in.

## Working the plans

1. Copy `TEMPLATE.md` to `components/<slug>.md`.
2. Fill it against the **real** daisyUI doc page (`daisyui.com/components/<slug>/`) and the `daisyui`
   MCP server — read the actual modifier list, do not infer axes from another component.
3. Prototype and render in Storybook **before** finalising the plan. Button's plan found two defects
   this way that were invisible from reading docs.
4. Mark the checklist row **Planned**, implement, then mark it **Implemented**.

Two rules that regularly get dropped:

- **Cross-plan amendments ship in the commit that triggers them** (`IMPLEMENTATION-ORDER.md` §5.4).
  A plan requiring edits to another plan or an already-built component pays that cost immediately.
- **`Validator.astro` and `Pagination.astro` must not exist** (§5.6). daisyUI has no `.pagination` class
  and `.validator` only sets a variable for other controls. The deliverables are `ValidatorHint`, a
  stories-only Pagination entry composing `Join` + `Button`, and JSDoc lines on eight form controls.
  Either file appearing in a diff means the order was followed but the plan was not read.

Also worth knowing before reordering anything: **no component imports another** (§1), so a wrong order
never breaks the build. What it costs is rework, a missed integration check, and dropped amendments.

## The status table

`README.md`'s checklist is the index of record: all 68 rows read **Implemented**, each with a
parenthetical carrying what the plan settled — story count, which daisyUI methods are covered, what was
deliberately left to the caller. Those parentheticals are the fastest way to find prior art for a
question like "how did we handle a component with three documented methods". Most rows still note the
visual pass as open; that is real outstanding work, not stale text.
