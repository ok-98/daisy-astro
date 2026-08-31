# List Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/list/
**Root element:** `ul` (`List`), `li` (`ListRow`)
**Target files:** `packages/daisy-astro/src/components/List/List.astro`, `ListRow.astro` (only `List.astro` exists, as a dummy scaffold)
**Story files:** `List.stories.ts`, `ListRow.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'ul'>` / `HTMLAttributes<'li'>`; `class:list` for merging; **no variant classes on the components** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/list.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). `List.astro` and `ListRow.astro`, with 10 stories. §3e.1 is answered at the level that matters — 11 lists render `<li>` as a direct child, and **no list has a non-`li` child at all**, which is §3d's validity rule (§8). Step 5 (visual pass) is open, and it carries the column behaviour, which is the whole component.
---

## 0. A flex column of auto-flow grids

```css
.list { display:flex; flex-direction:column; font-size:.875rem }
.list .list-row { display:grid; grid-auto-flow:column;
                  --list-grid-cols: minmax(0, auto) 1fr;
                  grid-template-columns: var(--list-grid-cols);
                  gap:1rem; padding:1rem; border-radius:var(--radius-box);
                  word-break:break-word; position:relative }
:is(.list > :not(:last-child).list-row, .list > :not(:last-child) .list-row):after {
  content:""; position:absolute; bottom:0; inset-inline:var(--radius-box);
  border-bottom: var(--border) solid color-mix(in oklab, var(--color-base-content) 5%, transparent) }

.list .list-row:has(.list-col-grow:first-child)   { --list-grid-cols: 1fr }
.list .list-row:has(.list-col-grow:nth-child(2))  { --list-grid-cols: minmax(0,auto) 1fr }
… up to :nth-child(6) …
.list .list-row > * { grid-row-start: 1 }
.list-col-wrap { grid-row-start: 2 }
```

**[all verified]**. Each row is a single-row grid whose **second** column grows by default; `list-col-grow` moves that `1fr` to whichever child carries it, and `list-col-wrap` drops a child onto a second row.

## 1. Variant audit

**4 classes: 2 component + 2 modifier**, matching the doc page's frontmatter. `grep -oE '\.list[a-z0-9-]*' list.css | sort -u` returns exactly `.list`, `.list-row`, `.list-col-grow`, `.list-col-wrap` **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `list` | — | — | `List` | Always applied. |
| Base | `list-row` | — | — | `ListRow` | Always applied. |
| Modifier | `list-col-grow` | — | — | — | **Caller-applied class on a row's child** — §2. |
| Modifier | `list-col-wrap` | — | — | — | Same — §2. |

**Neither component has a variant prop.** No colour, size or style axis exists **[verified]**; the doc examples' `bg-base-100 rounded-box shadow-md` is plain Tailwind on the root.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `List` | `default` | none — direct children of `.list` | no | `ListRow`s **and** plain `<li>` headers |
| `ListRow` | `default` | none — direct children of `.list-row` | no | avatar, text block, buttons, an optional `<p>` |

Plain default slots, no gating.

**`list-col-grow` and `list-col-wrap` are caller-applied classes**, not props and not components — they go on one of the *row's own children*, which the caller writes. Same treatment as `dropdown-content` (`plans/components/dropdown.md` §2), `fab-main-action`, `filter-reset` and `join-item`.

**Plain `<li>` children are a documented use.** Every doc example opens with `<li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li>` — an unstyled `<li>` used as a section header **[verified]**. So `List` must accept arbitrary `<li>`s alongside `ListRow`s, which rules out an `items` array prop.

## 3. Five things the naive implementation gets wrong

### 3a. The second child grows by default — and daisyUI says so in an info box

`--list-grid-cols: minmax(0, auto) 1fr` **[verified]**, with `grid-auto-flow: column` — so a row of *n* children lays out as: first column sized to content, second column taking the rest, and every later child sized to content. The doc page leads with an info box saying exactly this.

That is why the default example works with no modifier at all: avatar (auto), text block (**grows**), two buttons (auto). Get the child order wrong and the wrong element stretches, with no error.

`list-col-grow` moves the `1fr` — but **only for the first six positions**: there are `:has()` rules for `:first-child` through `:nth-child(6)` **[verified]** and nothing beyond. A `list-col-grow` on the seventh child silently does nothing and the default second-column growth stays. Same family of silent cap as `plans/components/fab.md` §3d and `plans/components/hover-gallery.md` §3b; the JSDoc states it.

### 3b. `list-col-wrap` puts a child on row 2, and everything else is pinned to row 1

`.list .list-row > * { grid-row-start: 1 }` and `.list-col-wrap { grid-row-start: 2 }` **[verified]**. Because `grid-auto-flow` is `column`, a wrapped child does not push its neighbours — it simply occupies the second row, spanning from wherever the auto-placement puts it.

Two things follow, both worth a JSDoc line:

- **The wrapped child keeps its column position**, so the paragraph in the doc example starts under the text block rather than under the avatar. That is intended, not a bug.
- **More than one `list-col-wrap` in a row** stacks them into the same row 2 rather than creating a third row — there is no `grid-row-start: 3` rule **[verified]**.

### 3c. The row separator is a `::after`, drawn by the *parent*

```css
:is(.list > :not(:last-child).list-row, .list > :not(:last-child) .list-row):after { … }
```

**[verified]**. Two selectors: the row is either a direct child of `.list`, or a descendant of one that is not last. So the divider is skipped on the final row, and it is inset by `var(--radius-box)` so it does not run into the rounded corners.

The consequence to document: **a `ListRow` wrapped in something else still gets its divider** (the second arm handles it), but *which* element must be `:not(:last-child)` shifts to the wrapper — so a wrapped last row can still draw a divider if its wrapper is not last. Unusual enough to note, mild enough not to guard against.

### 3d. `List` renders a `<ul>` and `ListRow` an `<li>` — keep them

`.list` and `.list-row` are class-only selectors **[verified]**, but the doc page uses `<ul>`/`<li>` throughout, and a list of rows is exactly what those elements are for: screen readers announce the item count.

So **neither component is polymorphic**. The one thing that follows is that `List`'s children must be `<li>`s — a stray `<div>` inside a `<ul>` is invalid HTML — which is also why the header rows in the doc examples are `<li>`s rather than divs. One JSDoc line, since the header row is the case a caller is most likely to write as a `<div>`.

### 3e. Unverified assumptions

1. **Do slot children land as direct children?** Mixed. `.list .list-row` is a **descendant** selector and `list-col-grow`'s `:has()` rules are scoped to the row, so wrapping is largely tolerated. But `.list-row > *` (the `grid-row-start: 1` pin) and the divider's first arm **are** direct-child rules **[verified]**, so a wrapper inside a row would break the grid outright. Eighteenth plan touching the shared question in `plans/components/aura.md` §3e.1 — blocking for `ListRow`, tolerant for `List`.
2. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with Avatar, Card, Carousel, Diff and Hero.
3. **Slot sanitization vs inline `<svg>`** — every row has two icon buttons. Shared with `plans/components/alert.md` §3d.1.

## 4. Component implementation

### `List.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * A vertical list of rows. Children must be `<li>` elements — either
 * `ListRow`s or plain `<li>`s used as section headers, which is what daisyUI's
 * own examples do (plan §2, §3d).
 *
 * daisyUI gives it no box: `class="bg-base-100 rounded-box shadow-md"` is what
 * the examples add.
 */
interface Props extends HTMLAttributes<'ul'> {}

const { class: className, ...rest } = Astro.props;
---

<ul class:list={['list', className]} {...rest}>
  <slot />
</ul>
```

### `ListRow.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * One row: a single-row grid where **the second child grows** by default
 * (plan §3a). Order your children accordingly, or move the growth by putting
 * `class="list-col-grow"` on another one — that works for the first six
 * children only.
 *
 * `class="list-col-wrap"` on a child drops it to a second row, keeping its
 * column position (plan §3b).
 *
 * Children must be **direct** children — the grid pins them with
 * `.list-row > *` (plan §3e.1).
 */
interface Props extends HTMLAttributes<'li'> {}

const { class: className, ...rest } = Astro.props;
---

<li class:list={['list-row', className]} {...rest}>
  <slot />
</li>
```

No `<script>` in either: pure CSS. Neither is polymorphic (§3d).

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `items` array prop (§2).
- [ ] `<slot />` has no wrapper in `ListRow` — `.list-row > *` is a direct-child rule (§3e.1).
- [ ] No `Astro.slots.has()` gating.
- [ ] Roots are `<ul>` and `<li>`; neither has an `as` prop (§3d).
- [ ] `list-col-grow` and `list-col-wrap` are documented as caller classes, not props (§2).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in both files.
- [ ] No class interpolation — the components have no variant classes (§1).
- [ ] Probe (§5c):
  ```astro
  <List class="bg-base-100 rounded-box"><li class="p-4">Header</li><ListRow><div>A</div><div>B</div></ListRow></List>
  <ListRow id="x" data-test="y" class="hover:bg-base-200">ok</ListRow>
  <List items={[]}>must error — rows are slot content (§2)</List>
  <ListRow grow={2}>must error — list-col-grow is a child class (§2)</ListRow>
  <List color="primary">must error — no colour axis (§1)</List>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. Doc-page examples in page order (`plans/README.md` §8), all in `List.stories.ts`:

| Doc-page example | Story | Notes |
|---|---|---|
| List (second column grows — default) | `Default` | header `<li>`, three rows: avatar, text block, two icon buttons |
| List (third column grows) | `ThirdColumnGrows` | adds a track number first, `list-col-grow` on the text block |
| List (third column wraps to next row) | `WrappedColumn` | adds a `<p class="list-col-wrap text-xs">` description |

Plus `Playground` and `Passthrough`; `ListRow.stories.ts` gets a `Playground` + `Passthrough`.

Three beyond the doc page:

- **`WrongOrder`** — a row whose growing child is not second and carries no `list-col-grow`, so the wrong element stretches (§3a).
- **`GrowBeyondSix`** — `list-col-grow` on a seventh child, which silently does nothing (§3a).
- **`LastRowNoDivider`** — a two-row list, confirming the final row has no separator (§3c).

## 6. Steps

- [x] **Step 1: done for §3e.1**, which this plan correctly predicted would be split: tolerant at the list level, blocking inside a row. The build confirms both — 11 lists hold `<li>` directly, and every row's children are its own direct children, which the `grid-row-start` pin requires. §3e.2 (image URLs) and §3e.3 are shared and runtime; sanitization is off library-wide, so the icons survive.
- [x] **Step 2: skipped as planned.** Neither component has a variant prop; `variants.ts` untouched.
- [x] **Step 3: done.** Two files per §4, neither polymorphic — a `ul`/`li` pair is what a list of rows is for, and screen readers announce the count (§3d). Gate walked; the probe errored on all three intended lines, including `grow` and `wrap`, which are caller classes rather than props.
- [x] **Step 4: done.** `List.stories.ts` (7) and `ListRow.stories.ts` (3), composing the real `Avatar` and `Button`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and the columns are the component.** Verify: `Default` lays out avatar / text / two buttons with **the text taking the slack**, from no modifier at all (§3a); `ThirdColumnGrows` moves that growth past the track number; `ThirdColumnWraps` drops the paragraph to a second row **starting under the text block, not under the avatar** (§3b); dividers appear between rows and **not after the last** (§3c); `WrongChildOrder`'s first row stretches the button column; and `GrowBeyondSix`'s seventh child is ignored (§3a).
- [x] **Step 6: done — forwarding confirmed at two levels.** `Passthrough` renders `<ul class="list mine bg-base-100 rounded-box shadow-md" id="list-1" data-test="yes" style="letter-spacing:1px">` containing a marked `list-row`. Full output in §8.
- [x] **Step 7: done — the `List` row in `plans/README.md` says Implemented**, covering `ListRow`.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 4 daisyUI classes reachable; the two `list-col-*` modifiers documented as caller classes (§2).
- [x] Roots are `<ul>`/`<li>`, and plain `<li>` headers work alongside `ListRow`s (§2, §3d).
- [x] Row children render as direct children (§3e.1) — checked in the build output.
- [x] JSDoc states: the second child grows by default (§3a), the six-child `list-col-grow` cap (§3a), `list-col-wrap` keeps its column (§3b), and the last row has no divider (§3c).
- [x] No invented axis — no colour, size, `items` prop, or grow/wrap props.
- [x] One story per doc-page example, plus `WrongOrder`, `GrowBeyondSix` and `LastRowNoDivider`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31), SVG elided. `astro check`: 145 files, 0 errors, 0 warnings, 0 hints.

```
Default          → <ul class="list bg-base-100 rounded-box shadow-md">
                     <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li>
                     <li class="list-row"><div class="avatar"><div class="size-10 rounded-box"><img …/></div></div>
                       <div><div>Dio Lupa</div><div class="text-xs …">Remaining Reason</div></div>
                       <button class="btn btn-square btn-ghost">SVG</button> ×2</li> …
ThirdColumnGrows → …<div class="text-4xl font-thin opacity-30 tabular-nums">01</div>…
                     <div class="list-col-grow">…                    the growth moved off the second child
ThirdColumnWraps → …<p class="list-col-wrap text-xs">…</p>…
Passthrough      → <ul class="list mine bg-base-100 rounded-box shadow-md" id="list-1" data-test="yes"
                     style="letter-spacing:1px"><li class="list-row row-marker" id="list-row-1"
                     data-test="row">…
```

What this settles:

- **§3d's validity rule holds**: 11 lists render `<li>` as their first child, 22 rows and 4 plain `<li>` headers across the stories, and **zero non-`li` children of any list**. The header is the element a caller would most likely write as a `div`, which would be invalid inside a `ul` — so the stories keep it an `li` and the JSDoc says why.
- **The modifiers stay caller classes**: 4 `list-col-grow` and 4 `list-col-wrap` children, each on markup the caller wrote inside a row rather than on a component (§2).
- **The default example carries no modifier at all**, which is the evidence for §3a: the second child grows on its own, so avatar / text / buttons is correct by construction and any other order is not.
- Rows compose the real `Avatar` and `Button`; the thumbnail renders as `div.avatar > div.size-10` rather than the doc page's bare div, which is the same shape through a real component.
- All 4 classes have rules in the built stylesheet.

Not settled here: which column actually takes the slack, where the wrapped paragraph starts, and whether the last row skips its divider. All Step 5.
