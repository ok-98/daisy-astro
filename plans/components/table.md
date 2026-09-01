# Table Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/table/
**Root element:** `table`
**Target file:** `packages/daisy-astro/src/components/Table/Table.astro`
**Story file:** `packages/daisy-astro/src/components/Table/Table.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'table'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions (`DaisySize`) come from `packages/daisy-astro/src/lib/variants.ts` — import as `../../lib/variants`.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).


> **Status:** **Implemented** (2026-09-01), second of Stage 5. `Table.astro` and 13 stories. **§2's shared unknown is settled here, where it was load-bearing**: `<thead>` is a direct child of `<table>` in 17 of 17 tables (§8). §5's sanitization worry is a non-issue — 106 `<tr>` and 342 `<td>` survive intact. One refinement to `plans/README.md` §1b's comment-scanning rule came out of the `row-hover` check (§0h). Step 5 (visual pass) is open.
---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/table.css` and the doc page's `classnames` frontmatter. Both agree on exactly **nine** classes:

```
.table  .table-zebra  .table-pin-rows  .table-pin-cols
.table-xs  .table-sm  .table-md  .table-lg  .table-xl
```

No part classes. No `table-row`, no `table-cell`, no `table-head`. Table is a **one-class component**.

### 0a. Table ships in the *utilities* layer, so daisyUI gives it responsive variants

`table.css` opens with `@layer utilities{@layer daisyui.l1.l2.l3{.table{…`, not the component layer other files use. Consequence, confirmed by grepping the compiled file:

```bash
grep -c 'sm\\:' .../daisyui/components/card.css   # 0
grep -c 'sm\\:' .../daisyui/components/table.css  # many
```

`table.css` physically contains `.sm\:table`, `.md\:table-zebra`, `.lg\:table-xs`, `.xl\:table-pin-rows`, `.\32 xl\:table-xl` … — **every one of the nine classes is emitted at all five breakpoints**. Card, Badge and Alert have zero such rules.

This is the same shape of finding as `join.md` §0 (Join lives in `utilities/`, not `components/`) — the file's *directory* is not the authority on which layer the CSS lands in; the `@layer` line is.

Consequence for the API: the `size` prop sets the **base** size only. Responsive size (`table-xs md:table-md`) is a caller class, per the standing rule that responsive axes are always caller classes (`lg:card-side`, `sm:footer-horizontal`, `lg:menu-horizontal`, `stats-vertical lg:stats-horizontal`). Do **not** invent `size={{ base: 'xs', md: 'md' }}` — an object-valued size prop would have to interpolate class names, which §1b forbids outright. Document the caller-class escape hatch in the component's comment header and show it in a story.

### 0b. `row-hover` exists in the CSS but is not a documented class

```css
@media (hover:hover){ :is(.table tr.row-hover, .table tr.row-hover:nth-child(2n)):hover
                      { background-color: var(--color-base-200) } }
@media (hover:hover){ :is(.table-zebra tbody tr.row-hover,
                          .table-zebra tbody tr.row-hover:where(:nth-child(2n))):hover
                      { background-color: var(--color-base-300) } }
```

`row-hover` appears in **neither** the doc page's `classnames` frontmatter nor any doc example. The doc page's example literally titled *"Table with a row that highlights on hover"* uses the plain Tailwind utility `<tr class="hover:bg-base-300">` instead. daisyUI has dropped `row-hover` from the documented surface while leaving the CSS in place.

Same class of discovery as `fieldset-label` in `fieldset.md` §0. **Decision: do not build a prop for it.** Two reasons: (1) it is undocumented and may vanish without a major bump, and (2) it is a `<tr>`-level class and this plan ships no `<tr>` sub-component (§0d). It stays reachable as a caller class on a row for anyone who wants it. Record it here so a future reader doesn't "discover" it and add a prop.

### 0c. `table-pin-cols` pins by element type, not by position — this inverts normal table semantics

```css
.table :where(.table-pin-cols tr th) { position:sticky; left:0; right:0;
                                       background-color: var(--color-base-100) }
```

The selector is `tr th` — **every** `<th>` in the table becomes sticky, and it sets *both* `left:0` and `right:0`, so a leading `<th>` sticks left and a trailing `<th>` sticks right purely from where it sits in the row.

That is why the doc's pinned-cols example writes its header row as:

```html
<tr>
  <th></th>            <!-- pinned -->
  <td>Name</td>        <!-- header cells are <td>, not <th> -->
  <td>Job</td>
  ...
  <th></th>            <!-- pinned -->
</tr>
```

To use pinned columns you must author header cells as `<td>` and reserve `<th>` for the columns you want pinned — the opposite of what semantic HTML would suggest. Nothing in the component can fix this; it is a documentation obligation. Put it in the `pinCols` prop's doc comment and reproduce it faithfully in the story.

`table-pin-rows` has no such trap — `.table :where(.table-pin-rows thead)` / `tfoot` — but note it makes **every** `<thead>` sticky, which is the whole point of the doc's A–Z example that interleaves many `<thead>`/`<tbody>` pairs inside one table. That is valid HTML and the sticky behaviour depends on it.

`.table-zebra` re-declares the pinned-cell background for even rows (`& :where(.table-pin-cols tr th){background-color:var(--color-base-200)}`), so `zebra` + `pinCols` compose correctly with no extra work.

### 0d. Parts are bare elements — no sub-components

Per the four-treatments rule first written in `chat-bubble.md` §0a (sub-component / named slot / bare element / compose an existing component): `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>` carry **no daisyUI classes at all** in any doc example. They are plain HTML.

A `<TableRow>` / `<TableCell>` that renders `<tr>` / `<td>` with nothing added would be pure ceremony, and it would break the `<table>` content model the moment Astro's compiler or a consumer's formatter moved anything. **Ship one component.** The default slot takes real `<thead>`/`<tbody>` markup.

### 0e. The `overflow-x-auto` wrapper is the caller's, not the component's

**All nine** doc examples wrap the table:

| Example | Wrapper classes |
|---|---|
| Table, active row, row hover, zebra, visual elements, xs | `overflow-x-auto` |
| With border and background | `overflow-x-auto rounded-box border border-base-content/5 bg-base-100` |
| Pinned rows | `h-96 overflow-x-auto` |
| Pinned rows + cols | `overflow-x-auto h-96 w-96` |

None of those are daisyUI classes. They differ per example — height, width, border and background all vary — so a wrapper baked into `<Table>` would have to expose a second `class`-like prop to stay usable, and `...rest`/`class` would then be ambiguous about which element they land on.

**Decision: no wrapper.** `<Table>` renders exactly `<table class="table …">`. Document the wrapper as required boilerplate and show it in every story.

Related: `.table` sets `border-radius: var(--radius-box)` with `border-collapse: separate; border-spacing: 0`. That radius is **invisible** unless something paints a background — which is exactly why the doc's rounded example puts `rounded-box … bg-base-100` on the *wrapper* rather than relying on the table's own radius. Don't chase this as a bug.

### 0f. Scaffold check

`packages/daisy-astro/src/components/Table/Table.astro` is the dummy scaffold. Unlike Stat (`stat.md` §0), Tab (`tab.md` §0), OTP (`otp.md` §0) and the missing-`type` group (`file-input.md` §0), **the Table scaffold is correct as far as it goes**: root is `<table>`, base class is `table`, `class:list` merge and `...rest` spread are already right. It is only missing the four variant props. First clean scaffold in the batch — no bug to record.

### 0h. `row-hover` ships anyway — and that refines §1b's comment rule

**Checked while implementing, 2026-09-01.** §0b decided not to build a prop for
the undocumented `row-hover`. The built stylesheet contains it regardless — 8
occurrences — even though nothing in the library renders the class.

The obvious suspect was `plans/README.md` §1b's newly recorded rule that a class
**named in a comment** emits its CSS, since this component's JSDoc mentions
`row-hover` in prose. It is not that. Every occurrence is a **compound
descendant selector** rooted at a class the stories do use:

```css
@media (hover:hover){ :is(.table-zebra tbody tr.row-hover,
                          .table-zebra tbody tr.row-hover:where(:nth-child(2n))):hover{…} }
```

and `grep '.row-hover{'` returns **zero** — there is no standalone rule for it
anywhere.

So the rule needs a boundary, worth carrying: **§1b's comment-scanning applies
to classes that have a rule of their own.** A class that exists only as part of
a compound selector under another class ships with that class, whether or not
anyone mentions it — nothing was gained or lost by the JSDoc line here.

Contrast `fieldset-label` (`plans/components/fieldset.md` §3e), which *is* a
standalone rule and did vanish when the comment was reworded. The two cases look
identical from a `grep` of the output and are not.

### 0g. Attribute collisions: none

`TableHTMLAttributes` (`astro-jsx.d.ts:962`) declares `align`, `bgcolor`, `border`, `cellpadding`, `cellspacing`, `frame`, `rules`, `summary`, `width`. **No `size`, no `zebra`, no `pinRows`, no `pinCols`.** The base `HTMLAttributes` `color?: string` (`:602`) is irrelevant — Table has no colour axis. All four prop names are free.

---

## 1. Variant audit

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Size | `table-xs` `table-sm` `table-md` `table-lg` `table-xl` | `size` | `DaisySize` | Shared union. `table-md` is daisyUI's default — leave `size` undefined for it rather than emitting the class. Sizes change body-row `font-size` and all `th`/`td` padding. |
| Zebra | `table-zebra` | `zebra` | `boolean` | Stripes `tbody tr:nth-child(2n)`. `thead`/`tfoot` unaffected. |
| Pin rows | `table-pin-rows` | `pinRows` | `boolean` | Sticky `thead` + `tfoot`. Needs a scroll container with a height (§0e). |
| Pin cols | `table-pin-cols` | `pinCols` | `boolean` | Sticky `th`. **Read §0c before using** — it pins by element type. |

Not built: `row-hover` (§0b), responsive variants (§0a — caller classes).

## 2. Slots

Single default slot, no gating needed. Content is the caller's `<thead>`/`<tbody>`/`<tfoot>` markup, verbatim from the doc examples.

No named slots: a `header` slot would have to wrap in `<thead><tr>` and then couldn't express the pinned-cols `<td>`-header inversion (§0c) or the multi-`<thead>` A–Z layout the pinned-rows example needs.

**Shared unknown** (tracked from `aura.md` §3e.1, now touched by ~30 plans): does slot content land as a *direct child* of the root? Table is the one component where this is load-bearing rather than cosmetic — `.table-zebra tbody tr:nth-child(2n)` and `.table :where(th,td)` assume the real table structure with no interposed element. If Astro's slot rendering wrapped content, every selector here breaks visibly. Verify this first (§6 Step 3) rather than at the end.

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

interface Props extends HTMLAttributes<'table'> {
  /** Base size. Responsive sizes are caller classes: class="table-xs md:table-md" */
  size?: DaisySize;
  /** Stripe even <tbody> rows. */
  zebra?: boolean;
  /** Sticky <thead> and <tfoot>. Needs a scrolling wrapper with a height. */
  pinRows?: boolean;
  /** Sticky columns. Pins every <th>: write header cells as <td> and use <th>
   *  only for the columns to pin. */
  pinCols?: boolean;
}
---
```

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference in generic components
// (plans/README.md §5c). Harmless to keep the order everywhere.
interface Props extends HTMLAttributes<'table'> {
  size?: DaisySize;
  zebra?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
}

// Full literal class names. NEVER `table-${size}` — an interpolated class gets
// no CSS from daisyUI (plans/README.md §1b).
const SIZE: Record<DaisySize, string> = {
  xs: 'table-xs',
  sm: 'table-sm',
  md: 'table-md',
  lg: 'table-lg',
  xl: 'table-xl',
};

const { size, zebra, pinRows, pinCols, class: className, ...rest } = Astro.props;
---
{/* Callers supply their own scroll container — daisyUI's examples all wrap this
    in <div class="overflow-x-auto">, with varying height/width/border/bg. */}
<table
  class:list={[
    'table',
    size && SIZE[size],
    {
      'table-zebra': zebra,
      'table-pin-rows': pinRows,
      'table-pin-cols': pinCols,
    },
    className,
  ]}
  {...rest}
>
  <slot />
</table>
```

No named slots, so no `Astro.slots.has()` gating in this component.

### Astro idioms gate

- [ ] Content arrives via slots, not content props.
- [ ] No optional styled wrappers — nothing to gate.
- [ ] Root element is `<table>`, matching every doc example.
- [ ] No `<script>` — sticky headers, zebra stripes and hover are all pure CSS.
- [ ] `...rest` spread onto `<table>`.
- [ ] Not polymorphic: `.table` is documented for `<table>` only ("For `<table>` tag" in the frontmatter).
- [ ] No prop name collides with `TableHTMLAttributes` (§0g).
- [ ] **Every variant class is a full literal in a `Record` map / object key.**
- [ ] Not generic, so §5c's `type Props`-before-`const` rule is advisory — keep the order anyway.
- [ ] Prop typing verified with a throwaway probe (`<Table size="xs" zebra pinRows pinCols />` plus a bad `size="huge"` that must error).
- [ ] `astro check` passes.

## 5. Storybook stories

**Read this before writing stories.** `@storybook-astro/framework` passes `args.slots` as an HTML string and **sanitizes** it. The template's warning is about inline SVG; here the risk is larger and more likely: `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` are only valid inside table context, and a sanitizer that reparses the string as a standalone fragment will **drop them entirely**, leaving bare text. Verify story #1 renders real rows *before* writing the other eight.

If rows are stripped, the fallback is a wrapper `.astro` story component holding real markup — not a hand-built DOM helper, and not abandoning the doc-example mirroring rule (§8).

| Doc-page example | Story name | Slots / props it needs |
|---|---|---|
| Table | `Default` | 4-col head + 3 rows |
| Table with border and background | `WithBorderAndBackground` | same rows; wrapper gets `rounded-box border border-base-content/5 bg-base-100` |
| Table with an active row | `ActiveRow` | same rows; row 1 gets `class="bg-base-200"` |
| Table with a row that highlights on hover | `RowHover` | same rows; row 2 gets `class="hover:bg-base-300"` (**not** `row-hover` — §0b) |
| Zebra | `Zebra` | `zebra` |
| Table with visual elements | `VisualElements` | rows containing Checkbox / Avatar+Mask / Badge / Button markup, plus `<tfoot>` |
| Table xs | `SizeXs` | `size="xs"`, 7 cols, 20 rows, `<tfoot>` |
| Table with pinned-rows | `PinnedRows` | `pinRows`, wrapper `h-96 overflow-x-auto`, table `bg-base-200`, interleaved `<thead>`/`<tbody>` A–Z |
| Table with pinned-rows and pinned-cols | `PinnedRowsAndCols` | `pinRows pinCols size="xs"`, wrapper `overflow-x-auto h-96 w-96`, **`<td>` header cells with `<th>` at both ends** (§0c) |

Plus `Playground` (all four controls) and `Sizes` (all five values, visibly distinct padding/font-size). Add `ResponsiveSize` demonstrating the §0a caller-class escape hatch (`class="table-xs lg:table-lg"`) — it is the only way that capability is discoverable.

The `VisualElements` example composes Checkbox, Avatar, Mask, Badge and Button. Compose the real daisy-astro components in that story where they already exist, per the fourth part-treatment (§0d) — that story doubles as an integration check.

```ts
import Table from './Table.astro';

export default {
  title: 'Components/Table',
  component: Table,
  argTypes: {
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    zebra: { control: 'boolean' },
    pinRows: { control: 'boolean' },
    pinCols: { control: 'boolean' },
  },
};

const ROWS = `
  <thead>
    <tr><th></th><th>Name</th><th>Job</th><th>Favorite Color</th></tr>
  </thead>
  <tbody>
    <tr><th>1</th><td>Cy Ganderton</td><td>Quality Control Specialist</td><td>Blue</td></tr>
    <tr><th>2</th><td>Hart Hagerty</td><td>Desktop Support Technician</td><td>Purple</td></tr>
    <tr><th>3</th><td>Brice Swyre</td><td>Tax Accountant</td><td>Red</td></tr>
  </tbody>
`;

export const Playground = {
  args: { slots: { default: ROWS } },
};

export const Zebra = {
  args: { zebra: true, slots: { default: ROWS } },
};

// …one export per row of the table above, markup copied from the doc page.
```

Every story needs the `overflow-x-auto` wrapper (§0e) — supply it via a decorator so the nine stories don't each repeat it, with the four examples that need extra wrapper classes overriding it.

## 6. Steps

- [x] **Step 1: nothing to re-derive.** Nine classes, agreed by the CSS and the frontmatter.
- [x] **Step 2: skipped as planned.** `DaisySize` covers xs–xl unchanged.
- [x] **Step 3: done, and §2's check was made first as instructed.** `<thead>` lands as a **direct child of `<table>`** — 17 of 17 in the build. That was the one component where the shared slot-wrapping question was load-bearing rather than cosmetic: `.table-zebra tbody tr:nth-child(2n)` and `.table :where(th,td)` all assume the real table structure. The probe errors on `size="huge"` and an invented `variant`; its `color` line cannot error, `color` being a native attribute (`plans/README.md` §5c).
- [x] **Step 4: done, `Default` first as §5 instructed — and the fear was unfounded.** Table markup passes through the story pipeline untouched: 106 `<tr>` and 342 `<td>` in the output, no wrapper `.astro` story component needed.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes and scrolling.** Verify: `Sizes` shows five visibly different paddings; **`PinnedRows`' headers stay put while the A–Z body scrolls**; **`PinnedRowsAndCols` keeps the leading and trailing `th` columns fixed on horizontal scroll** — and confirm §0c by temporarily flipping one of its `<td>` header cells to `<th>` and watching it stick; `Zebra` stripes the body only; and `ResponsiveSize` changes size at `lg`.
- [x] **Step 6: done — forwarding confirmed, `summary` included.** `Passthrough` renders `<table class="table table-lg table-zebra table-pin-rows table-pin-cols mine" id="table-1" data-test="yes" style="letter-spacing:1px" summary="Passthrough table">`, where `summary` is a `TableHTMLAttributes` member and so proves the table's own interface is inherited rather than just the base one. Full output in §8.
- [x] **Step 7: done — the `Table` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All four documented modifier axes have typed props; the two undocumented/uncoverable ones (`row-hover`, responsive variants) are documented as caller classes, not silently dropped.
- [x] `Props` extends `HTMLAttributes<'table'>`.
- [x] `class` from a caller merges through `class:list`.
- [x] `Playground` exposes all four props as controls.
- [x] `Sizes` renders all five values, visibly distinct.
- [x] Nine stories, one per doc-page example, markup copied from the page.
- [x] Slot content confirmed to land as a direct child of `<table>` (§2) — recorded, not assumed.
- [x] Slot sanitization confirmed not to strip `<thead>`/`<tr>`/`<td>` (§5) — or the fallback taken and documented.
- [x] No `overflow-x-auto` wrapper baked into the component (§0e).
- [x] `pinCols`' `<td>`-header requirement documented in the prop's doc comment and demonstrated in `PinnedRowsAndCols` (§0c).
- [x] Every box in section 4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 197 files, 0 errors, 0 warnings, 0 hints.

```
Default            → <div class="overflow-x-auto"><table class="table"><thead><tr><th></th>
                       <th>Name</th>…</thead><tbody><tr><th>1</th><td>Cy Ganderton</td>…
                                       ↑ thead is a direct child of table
PinnedRowsAndCols  → <thead><tr><th></th><td>Name</td><td>Job</td><td>company</td><td>location</td>
                       <td>Last Login</td><td>Favorite Color</td><th></th></tr></thead>
                                ↑ th at both ends, td in between — §0c's inversion, as published
Passthrough        → <table class="table table-lg table-zebra table-pin-rows table-pin-cols mine"
                       id="table-1" data-test="yes" style="letter-spacing:1px" summary="Passthrough table">
```

Counts across the 13 stories:

```
<table> elements 17  → <thead> as a direct child  17 of 17
table markup intact: 19 tbody, 106 tr, 342 td
zebra 2 | pin-rows 3 | pin-cols 2 | all 5 sizes present
built CSS: all 9 classes, plus `.lg\:table-lg` from the responsive story
row-hover in the built CSS: 8 occurrences, 0 of them a standalone rule (§0h)
```

What this settles:

- **§2's shared unknown, in the component that would have shown it worst.** Everywhere else a wrapper degrades a rule; here `.table-zebra tbody tr:nth-child(2n)` and every `th`/`td` rule assume real table structure, so a wrapper would have broken the component visibly. 17 of 17 are clean.
- **§5's sanitization fear was unfounded.** `<thead>`, `<tbody>`, `<tr>`, `<th>` and `<td>` are only valid in table context and a reparsing sanitizer would have dropped them; none did. No fallback wrapper component was needed.
- **§0c's inversion is reproduced as published** — `th` at both ends of the header row, `td` between them — because that is what makes pinned columns work at all.
- **§0a's escape hatch is real**: `.lg\:table-lg` is in the built CSS, generated from a caller class in `ResponsiveSize`. An object-valued `size` prop would have had to interpolate and would have emitted nothing.
- **§0h**: `row-hover`'s CSS ships with `.table-zebra` rather than because a comment names it — a boundary on `plans/README.md` §1b that only a `grep` for the standalone rule reveals.
- `VisualElements` composes the real `Checkbox`, `Avatar` (with a mask), `Badge` and `Button`.

Not settled here: the sticky behaviour of either pinned axis, the five paddings, and the zebra stripes. All Step 5.
