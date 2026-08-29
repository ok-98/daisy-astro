# Implementation Order

Derived from all 68 plans in `plans/components/`. This document exists because
the plans cross-reference each other heavily and several say *"raw markup in
the stories until X lands"* — a fallback that quietly becomes debt if X lands
later and nobody goes back.

Read §1 before writing any component. It changes what "blocked" means here.

---

## 1. The single most important fact: no component imports another

Every component in this library emits daisyUI class names and accepts slots.
**Not one of them imports another component's `.astro` file** — verified across
all 68 plans. Where a plan says a component "composes" another, it means:

- its **stories** render the other component, and/or
- its **JSDoc** points at the other component as the intended partner.

So a wrong order **never breaks a build**. What it costs is:

1. **Rework.** A story written with raw `<button class="btn">` markup while
   Button was unimplemented has to be rewritten when Button lands — or it
   silently stays raw forever, testing daisyUI's CSS instead of this library.
2. **A missed integration check.** Several plans call their composed story
   "the widest integration check in the library" (`validator.md` §5) precisely
   because it is the only place two components meet.
3. **Stale cross-plan amendments.** Some plans require *edits to other plans or
   to already-implemented components* when they land (§6). Those are easy to
   drop if the order is arbitrary.

Three components are the exception, where order is genuinely **hard**:

| Component | Why it is hard-blocked |
|---|---|
| **Accordion** | `collapse.md` §0a supersedes `AccordionItem`. There is no `accordion` class. Accordion cannot be implemented before Collapse decides its `trigger` union — and once Collapse lands, Accordion is a **plan amendment plus stories**, not a component. |
| **Pagination** | `pagination.md`: daisyUI has no `.pagination` class. The deliverable is a deleted component plus a stories-only entry composing `Join` + `Button`. Both must exist first. |
| **Validator** | `validator.md` §0a: `.validator` only sets `--input-color` for other controls. `Validator.astro` is deleted; the deliverable is `ValidatorHint` plus a JSDoc line on **eight** form controls (§6). Those eight should exist first, or the edits get queued and forgotten. |

---

## 2. Tier 0 — prerequisites, before any component

These are not components and they gate everything. Do them first, in order.

- [ ] **0.1 — `lib/variants.ts` is already correct.** `DaisyColor` (8 values) and
      `DaisySize` (xs–xl) exist and are complete. **Do not add to it** without a
      plan calling for it: `text-input.md` §6 Step 2, `text-rotate.md`,
      `toast.md` and `tooltip.md` all deliberately keep their unions local, and
      `tooltip.md` §0d derives its seven-colour union with
      `Exclude<DaisyColor, 'neutral'>` rather than adding a second colour type.

- [ ] **0.2 — Enable the themes the stories name.** `.storybook/preview.css` is
      currently `@plugin "daisyui";` with no `themes` option, which in daisyUI 5
      means **light and dark only**. `theme-controller.md` §5 names `synthwave`,
      `retro`, `cyberpunk`, `valentine` and `aqua`; without them every Theme
      Controller story renders a control that does nothing, and §0a says that
      failure is *silent*. Enable them before Theme Controller, and note in the
      story descriptions that the set is build-dependent.

- [ ] **0.3 — Settle the three open probes.** Roughly 35 plans defer to these.
      Settle each once, record the answer in `aura.md` §3e.1, and stop
      re-asking:

  | Probe | Question | Decisive plan |
  |---|---|---|
  | **Slot wrapping** | Does slot content land as a *direct child* of the component root? | `timeline.md` §2 (`.timeline > li`, `hr:first-child`) and `text-rotate.md` §2 (`:has(> :nth-child(n))` — animation dies outright) |
  | **Slot sanitization: SVG** | Does the framework strip inline `<svg>` from `args.slots`? | `text-input.md` §5 (`SearchWithIcon`), `toggle.md` §5 (`IconsInside` — icons are `:nth-child`-addressed, so a dropped one reindexes the other) |
  | **Slot sanitization: table elements** | Do `<thead>`/`<tr>`/`<td>` survive being passed as a slot string? | `table.md` §5 |
  | **Astro components nested via `slots`** | Can a story nest `<CardBody>` inside `<Card>` through `args.slots`? | `card.md` §3f.4, `accordion.md` §3d.1, `chat-bubble.md`, `dock.md`, `timeline.md` §5 |

  The last one decides whether multi-part components can have honest stories at
  all, or whether every one of them needs a wrapper `.astro` story component.
  Answer it before Card, and the pattern is settled for Chat, Dock, Timeline,
  Menu, Tabs, Fieldset and Stat.

---

## 3. The dependency graph

Edges are `A → B`, "A's stories or JSDoc need B". Extracted from the plans'
own `compose the real X` / `raw markup until X lands` statements.

Re-derive it at any time:

```bash
cd plans/components
grep -inE 'compos(e|es|ing|ition)|raw markup|until (those|they|it) (land|are implemented)' *.md
```

**Fan-in — the components worth building first, by how many others want them:**

| Component | Wanted by |
|---|---|
| **Button** | 22 — alert, card, drawer, dropdown, fab, fieldset, filter, footer, hero, indicator, join, list, modal, navbar, pagination, stat, swap, table, text-input, theme-controller, tooltip, validator |
| **Avatar** | 6 — chat-bubble, indicator, list, navbar, stat, table |
| **Badge** | 6 — card, indicator, list, menu, navbar, table |
| **Card** | 5 — dropdown, hero, indicator, navbar, stack |
| **Menu** | 4 — drawer, dropdown, megamenu, navbar |
| **Join** | 4 — file-input, footer, pagination, text-input |

Button alone unblocks a third of the library. Build it first.

### 3a. The form-control cycle

`Label → TextInput → Fieldset → Label` is a genuine cycle, and so is
`Join → TextInput → Join`:

- `label.md` — *"Every example nests `input`, `select` or `textarea`"*
- `text-input.md` §5 — `WithFieldsetLegend`, `WithFieldsetLabel` compose Fieldset + Label
- `fieldset.md` §2 — its slot content *is* labels, inputs, joins and buttons
- `textarea.md`, `select.md`, `checkbox.md`, `toggle.md` — all compose Fieldset + Label
- `join.md` — *"every example joins `btn`, `input`, `select` or radio inputs"*

**No topological order exists for these.** Handle them as one cluster (§4,
stage 4) with an explicit two-pass rule (§5.3).

---

## 4. The order

Each stage depends only on stages above it. Within a stage, order is free.

### Stage 1 — Leaves (no dependencies at all)

Build **Button first**; the rest of this stage is unordered.

`button` · `avatar` · `badge` · `mask` · `kbd` · `link` · `status` · `loading`
· `skeleton` · `divider` · `progress` · `radial-progress` · `countdown` ·
`diff` · `breadcrumbs` · `carousel` · `steps` · `tab` · `dock` · `timeline` ·
`text-rotate` · `aura` · `hover-3d-card` · `hover-gallery` · `otp` · `radio` ·
`range` · `collapse` · `browser-mockup` · `window-mockup` · `phone-mockup` ·
`code-mockup`

Notes:
- **`collapse` before `accordion`** — `collapse.md` §0a supersedes `AccordionItem`, and §6 Step 1 says confirm that decision *before writing code*.
- **`mask` before `rating`** — `rating.md` §0: the star shape is `mask mask-star-2`; the two halves of the half-star behaviour live in the two plans and are cross-referenced both ways.
- **`tab`, `dock`, `timeline`** are multi-part; they depend on probe 0.3's last row, not on another component.

### Stage 2 — Depend only on Stage 1

`alert` (Button) · `card` (Button, Badge) · `menu` (Badge, Kbd) ·
`swap` (Button) · `tooltip` (Button) · `modal` (Button) · `fab` (Button) ·
`filter` (Button) · `rating` (Mask) · `list` (Button, Avatar, Badge) ·
`stat` (Avatar, Button) · `chat-bubble` (Avatar) · `accordion` (Collapse)

Notes:
- **`fab` and `filter` are Button-shaped by definition.** `fab.md` §1: *"Every button in every example is styled with Button's own classes."* `filter.md` §2 shows `<Filter><Button as="input" type="radio" …/></Filter>` as the API. Writing their stories with raw `btn` markup defeats the point.
- **`accordion` is a plan amendment, not a new component** — see §1.

### Stage 3 — Depend on Stage 2

`toast` (Alert) · `stack` (Card) · `drawer` (Menu, Button) ·
`dropdown` (Menu, Button, Card)

### Stage 4 — The form cluster (cyclic — see §5.3)

`label` · `text-input` · `textarea` · `select` · `checkbox` · `toggle` ·
`file-input` · `fieldset` · `join` · `validator`

Two-pass rule applies. Suggested within-cluster order for pass 1 —
implementation-only, stories raw:

1. `join` (its own implementation needs nothing; four components want it)
2. `label`, `fieldset` (the wrappers everything else nests in)
3. `text-input`, `textarea`, `select`, `checkbox`, `toggle`, `file-input`
4. `validator` — **last in the cluster.** `validator.md` §6 Step 7 requires a
   JSDoc line on all eight controls above; doing it last makes that one edit
   pass instead of eight deferred ones.

### Stage 5 — Depend on the form cluster

`calendar` (Dropdown) · `pagination` (Join + Button — **stories-only entry**) ·
`table` (Checkbox, Avatar, Mask, Badge, Button) ·
`indicator` (Badge, Status, Button, Card, TextInput, Avatar, Tab) ·
`footer` (Link, TextInput, Join, Button) ·
`hero` (Card, Fieldset, Label, TextInput, Link, Button) ·
`theme-controller` (Swap, Toggle, Fieldset, Join, Dropdown, Radio, Checkbox, Button)

Note: **`theme-controller` also needs Tier 0.2** (themes enabled), not just the
components.

### Stage 6 — Last, because they want almost everything

`navbar` (Button, Menu, Dropdown, Avatar, Indicator, Badge, Card, TextInput, Collapse)
· `megamenu` (Menu, Navbar)

`navbar.md` §5 names itself: *"the component whose stories will look most like
a missing integration."* Build it when nothing is missing.

---

## 5. Rules that prevent wrong-order damage

### 5.1 — Check dependencies before starting a component

```bash
# What does the component you are about to build want?
grep -inE 'compos(e|es|ing)|raw markup|until (those|they|it) (land|are implemented)' \
  plans/components/<slug>.md
```

If it names a component that is not yet **Implemented** in
`plans/README.md`'s checklist, you are early. Either move up the order, or
accept the fallback under §5.2 — deliberately, not by accident.

### 5.2 — Raw-markup fallbacks must be findable and must expire

The plans permit raw markup when a partner component does not exist yet. That
permission is only safe if the debt is greppable. **Every raw-markup fallback
gets this exact marker**, on the line above it:

```ts
// TODO(daisy-astro): compose <Button> here once it is implemented — see plans/components/filter.md §5
```

Audit at any time:

```bash
grep -rn 'TODO(daisy-astro)' packages/daisy-astro/src
```

**The checklist row is the trigger.** When a component's row flips to
**Implemented**, grep for `TODO(daisy-astro)` mentioning it and clear every
hit in the same commit. A fallback with no marker is the failure mode this
whole document exists to prevent.

### 5.3 — Cyclic clusters get two passes, never a guessed order

For Stage 4 (and any future cycle):

- **Pass 1 — implementation.** Build every component in the cluster. Stories
  use raw markup for the other cluster members, each marked per §5.2. Do not
  try to find a "least bad" order; there isn't one.
- **Pass 2 — story backfill.** One commit per component, replacing every
  in-cluster `TODO(daisy-astro)` with the real component. The cluster is not
  done until `grep` returns nothing for its members.

Pass 2 is where the integration checks actually happen. Skipping it leaves ten
components whose stories never render each other.

### 5.4 — Cross-plan amendments ship with the component that triggers them

Several plans require edits **elsewhere** when they land. These are not
optional cleanup; they are part of that component's definition of done. Make
the edit in the **same commit** as the component.

| When you implement | You must also |
|---|---|
| **Collapse** | Amend `accordion.md` — no `AccordionItem`, one `Collapse` with `trigger: 'focus' \| 'checkbox' \| 'radio' \| 'details'` (`collapse.md` §0a, §6 Step 3) |
| **Join** | Drop Collapse's `join` boolean in favour of `class="join-item"` (`join.md` §2, §6 Step 7) |
| **Card** | Fix `plans/README.md` §5 (`card.md`) |
| **Filter** | Amend `button.md` with the `aria-label`-as-visible-text rule (`filter.md`) |
| **Text Input** | Nothing left — the missing-`type` audit note in `file-input.md` §0a is already written |
| **Theme Controller** | Nothing left in README — §254 and §2b are already corrected. Still needs Tier 0.2 |
| **Validator** | Delete `Validator.astro`; add the `validator`-is-a-caller-class JSDoc line to TextInput, Select, Textarea, Checkbox, Toggle, Radio, FileInput **and** Range (`validator.md` §6 Step 7) |
| **Pagination** | Delete `Pagination.astro`; the entry is stories-only (`pagination.md`) |
| **Swap** | Re-check whether it needs script; `plans/README.md` §7 flags it as the last unverified member of the old script-backed list |
| **any component** | Flip its row in `plans/README.md`'s checklist to **Implemented** — that row is what §5.2's audit keys off |

### 5.5 — Do not reorder around a scaffold bug

Seven scaffold defects are already documented and each is fixed by its own
plan's Step 3 — the missing-`type` group (`file-input.md` §0a's log), OTP's
root element, Textarea's whitespace, Text Rotate's `<div>`, Stat's and Tab's
class level. **None of them is a reason to promote a component up the order.**
They are one-line fixes inside work that is already scheduled.

### 5.6 — Two components must not be built at all

`Validator.astro` and `Pagination.astro` are **deleted**, not implemented
(§1). If either shows up in a diff as an implemented component, the order was
followed but the plan was not read.

---

## 6. Definition of done, per component

A component is Implemented when all of these hold — not before:

- [ ] `.astro` file matches its plan's §4, and every box in that plan's Astro idioms gate is ticked.
- [ ] `astro check` passes (`tsc` does not read `.astro` — `plans/README.md` §5b).
- [ ] Stories exist, one per doc-page example (`plans/README.md` §8), plus `Playground` and one per variant axis.
- [ ] Every story that *can* compose a real component does — no unmarked raw markup (§5.2).
- [ ] Any cross-plan amendment from §5.4 is in the same commit.
- [ ] The `plans/README.md` checklist row says **Implemented**.
- [ ] `grep -rn 'TODO(daisy-astro)' packages/daisy-astro/src` shows no hit naming this component.
