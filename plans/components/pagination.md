# Pagination Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/pagination/
**Root element:** none — **there is no Pagination component** (§0)
**Target files:** delete `packages/daisy-astro/src/components/Pagination/Pagination.astro`; keep `Pagination.stories.ts` (§0b)
**Story file:** `packages/daisy-astro/src/components/Pagination/Pagination.stories.ts`

**Global Constraints** (from `plans/README.md`): only §8 (stories mirror the doc examples) applies. There is no component, so the props, class-merging and variant rules have nothing to act on.

> **Status:** Planned, and **scoped to nothing** — read §0. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22` and the doc page source.


> **Status:** **Done** (2026-09-01) — and "done" here means **`Pagination.astro` is deleted** and 7 stories compose `Join` and `Button` instead (§0). §0's central claim re-verified: `grep -r pagination` across the installed package returns **zero** hits. One thing §0b could not have known: the story framework **requires** a `component` in the default export, so a story file with no component at all prerenders nothing, silently (§0c). Step 5 (visual pass) is open.
---

## 0. Pagination is the Join component with different content

The doc page's own frontmatter gives it away **[verified]**:

```yaml
source: .../packages/daisyui/src/utilities/join.css
classnames:
  component:
  - class: join
  part:
  - class: join-item
  direction:
  - class: join-vertical
  - class: join-horizontal
```

The `source` link points at **Join's** CSS, the class list **is** Join's class list, and the page opens with a note: *"For pagination, we use [join component] to show multiple links or buttons next to each other."*

There is no `pagination.css`, no `.pagination` class, and no `pagination` entry anywhere in `daisyui/components/` **[verified — `grep -r pagination daisyui/**/*.css` returns nothing]**. Every example on the page is `<div class="join">` wrapping `btn join-item` buttons.

**So there is no component to build.** Third component in this directory whose honest answer is "not what the checklist implies", after `plans/components/calendar.md` §0 (third-party theming) and `plans/components/collapse.md` §0a (the same seven classes as Accordion) — and the only one where the answer is *nothing at all*.

### 0a. What ships instead

```astro
<Join>
  <Button class="join-item">1</Button>
  <Button class="join-item" active>2</Button>
  <Button class="join-item">3</Button>
</Join>
```

`plans/components/join.md` already covers the container and the `join-item` class; `plans/components/button.md` covers `btn`, `btn-active`, `btn-disabled`, the sizes and `btn-outline`. **Nothing in this page's examples needs a class those two plans do not already expose.**

A `Pagination.astro` wrapping `Join` would add an import, an indirection, and a second name for the same thing — and it would have to re-export Join's `direction` plus Button's whole surface for the items. Ponytail rung 1: it does not need to exist.

### 0b. The stories stay

`plans/README.md` §8 wants one story per doc-page example, and these six are genuinely useful — they are the recipes a caller reaches for. They live in **`Pagination.stories.ts` with `title: 'Components/Pagination'`**, importing `Join` and `Button` and rendering compositions.

That keeps the sidebar entry and the examples with **zero component code**, which is the point. The file's header comment says so, so the missing `.astro` reads as a decision rather than an oversight.

**Delete `Pagination.astro`.** Leaving a dummy scaffold that renders `<div class="pagination">` would emit a class that matches no CSS at all — the exact silent failure `plans/README.md` §1b exists to prevent, and worse than Calendar's inert `<div class="cally">` (`plans/components/calendar.md` §0b) because the class does not exist in any form.

### 0c. A story file with no component prerenders nothing — silently

**Found while implementing, 2026-09-01.** §0b's plan was a story file with
"**zero component code**" — no `component` field, since there is no component to
name. The file indexed, the build succeeded, and **zero stories were
prerendered**. No warning, no error; the sidebar entry simply had nothing in it.

The framework's own source says why:

```
`Unable to prerender story "${options.story.id}". Missing component in ${options.story.importPath}.`
```

— `@storybook-astro/framework`'s `preset.js`. Every story file needs a
`component` in its default export, because that is what the prerenderer renders
through.

**Resolution: `component: Join`.** It is the honest answer — these compositions
*are* joins — and it keeps the sidebar entry under `Components/Pagination`
without inventing an `.astro` file. The story file says so where the field is
set, so the next reader does not take it as a leftover.

Worth carrying: **a story file that renders only compositions still needs to
name one component.** Any future stories-only entry (there is one more shape of
this, `plans/components/calendar.md` §0) hits the same rule, and the failure is
silent rather than loud.

## 1. Variant audit

| Axis | daisyUI class | Prop | Owner |
|---|---|---|---|
| — | *(none)* | — | — |

No classes. See `plans/components/join.md` §1 and `plans/components/button.md` §1 for the two real tables.

## 2. Slots

None — no component.

## 3. Three things worth recording

### 3a. `btn-active` marks the current page, and it is not an accessible state

Every example uses `class="join-item btn btn-active"` on the current page **[verified]**. That is visual only — `plans/components/button.md` §1 exposes it as `active`.

For a real pagination control the current page also needs **`aria-current="page"`**, exactly as `plans/components/breadcrumbs.md` §3b and `plans/components/dock.md` §3b concluded for their own active states. daisyUI's examples omit it; the stories add it, with a comment.

### 3b. The ellipsis is a disabled button, and `btn-disabled` has an accessibility caveat

The "with a disabled button" example uses `<button class="join-item btn btn-disabled">...</button>` for the gap **[verified]** — a real focusable `<button>` styled as disabled.

`plans/components/button.md` §3b already documents that `btn-disabled` on anything other than a `<button>`/`<input>` is **visual only** and needs `tabindex="-1" role="button" aria-disabled="true"`. Here the element *is* a `<button>`, so the native `disabled` attribute is the right call — and the ellipsis is better still as a non-interactive `<span class="join-item btn btn-disabled">` or plain text, since it is a label, not a control.

The story shows the doc markup and notes the improvement rather than silently diverging.

### 3c. Two of the six examples are not "pagination" at all

- **"Nex/Prev outline buttons with equal width"** uses `class="join grid grid-cols-2"` **[verified]** — a Tailwind grid on the join, which is how you get two equal-width items. Worth keeping because it is the one non-obvious trick on the page.
- **"Using radio inputs"** is the same shape as `plans/components/filter.md`'s options: `<input class="join-item btn btn-square" type="radio" aria-label="1">`, where **the visible text comes from `aria-label`** (`plans/components/filter.md` §3c). Its story must carry the labels or the buttons render empty.

Note the doc page's heading "Extra small buttons" sits above an example with **no size class at all** **[verified]** — a stale heading in daisyUI's docs. The story keeps the markup and names itself after what it shows (`PrevPageNext`), with a comment.

## 4. Component implementation

**None.** See §0.

The only implementation task is a deletion:

```
rm packages/daisy-astro/src/components/Pagination/Pagination.astro
```

`plans/README.md`'s "one directory per component" rule (§3b) still holds — the directory survives, holding only the story file.

## 5. Storybook stories

One file, `Pagination.stories.ts`, `title: 'Components/Pagination'`, importing `Join` and `Button`. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Notes |
|---|---|---|
| Pagination with an active button | `Default` | four buttons, second `active` — plus `aria-current="page"` (§3a) |
| Sizes | `Sizes` | five joins, one per Button size |
| With a disabled button | `WithEllipsis` | `...` as a disabled button, with §3b's note |
| Extra small buttons | `PrevPageNext` | `«` / `Page 22` / `»`; renamed, see §3c |
| Nex/Prev outline buttons with equal width | `EqualWidthPrevNext` | `class="join grid grid-cols-2"` (§3c) |
| Using radio inputs | `RadioInputs` | `aria-label` on each (§3c) |

Plus a `Playground` that varies the page count and the active index — the one thing a caller actually tunes.

No `Passthrough` story: there is no component to forward props through. That absence is itself worth the header comment.

## 6. Steps

- [x] **Step 1: confirmed.** `grep -rl pagination` across `daisyui@5.7.22` returns **0 files** — no `.pagination` class exists in any form.
- [x] **Step 2: nothing to do.**
- [x] **Step 3: `Pagination.astro` deleted**, and not replaced. The directory survives holding only the story file, per `plans/README.md` §3b.
- [x] **Step 4: done**, with §0c's correction. `Pagination.stories.ts`, 7 stories, composing the real `Join` and `Button`, plus a header comment explaining why there is no component.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Components/Pagination` appears in the sidebar; `Default` is one connected group with the second button highlighted; `Sizes` shows five heights; **`EqualWidthPrevNext` gives two exactly equal buttons**, which is the grid-on-the-join trick and the one non-obvious thing on the page; and `RadioInputs` shows its labels and behaves as a single radio group.
- [x] **Step 6: done.** `class="pagination"` appears **0 times** in the rendered stories — the assertion this plan exists for — and every story renders `div.join` around `btn join-item` children. Full output in §8.
- [x] **Step 7: done — the `Pagination` row in `plans/README.md` says "served by Join"**, not Implemented, since the checklist tracks daisyUI's doc pages and this one has no component behind it.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] `Pagination.astro` is deleted and not replaced (§0b).
- [x] No `pagination` class appears in any rendered story (§6 Step 6).
- [x] `Pagination.stories.ts` exists, titled `Components/Pagination`, composing `Join` and `Button`.
- [x] Its header comment explains why there is no component.
- [x] One story per doc-page example, with `aria-current="page"` added to the active button (§3a) and the ellipsis note recorded (§3b).
- [x] `plans/README.md`'s row says "served by Join", not "Implemented" (§6 Step 7).

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 197 files, 0 errors, 0 warnings, 0 hints.

```
Default   → <div class="join"><button class="btn join-item">1</button>
              <button aria-current="page" class="btn btn-active join-item">2</button>…
                        ↑ added by these stories; daisyUI's example has only btn-active (§3a)
Ellipsis  → …<button disabled class="btn join-item">...</button>…
                        ↑ the native attribute, not btn-disabled (§3b)
EqualWidth→ <div class="join grid grid-cols-2"><button class="btn btn-outline join-item">Previous page</button>…
Radio     → <input type="radio" name="pagination-options" autocomplete="off" aria-label="1" checked
              class="btn btn-square join-item"/> ×4
```

Counts across the 7 stories:

```
class="pagination" … 0        ← the assertion this plan exists for
div.join roots 11 | join-item buttons 14
aria-current="page" 7 | btn-active 7   — one of each per group, always together
```

What this settles:

- **§0**: nothing named `pagination` reaches the output, because nothing named `pagination` exists. The deleted scaffold would have emitted a class with no CSS behind it in any form — worse than an incomplete component, since it could never be finished.
- **§3a is applied rather than just noted**: every active page carries `aria-current="page"` beside `btn-active`, 7 of each. daisyUI's examples have only the visual half.
- **§3b**: the ellipsis renders `disabled` — the native attribute — rather than `btn-disabled`, because `Button`'s root here really is a `<button>`. The story records that a non-interactive `<span>` would be better still.
- **§3c's two oddities are both preserved**: the grid on the join, and `aria-label` carrying the visible text on the radio pager — without which those four render as empty squares.
- **§0c**: the file needs `component: Join` to prerender at all. With no `component` field the build succeeded and produced **0 stories**.

Not settled here: whether the two prev/next buttons are actually equal width, and whether the radio group behaves as one. Both Step 5.
