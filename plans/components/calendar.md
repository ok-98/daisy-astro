# Calendar Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/calendar/
**Root element:** `calendar-date` (a Cally custom element) — **not** a `div`; see §0
**Target file:** `packages/daisy-astro/src/components/Calendar/Calendar.astro` (currently a dummy scaffold that is actively wrong — §0b)
**Story file:** `packages/daisy-astro/src/components/Calendar/Calendar.stories.ts`

**Global Constraints** (from `plans/README.md`): most of them do not bite here, because this component has no variant classes and no daisyUI markup. The ones that do:
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b) — and it is load-bearing here, since a custom element needs a type declaration (§3c).
- **`plans/README.md` §2b's "no runtime dependencies" rule is the constraint that shapes this entire plan** (§0a, §3a).

> **Status:** Planned, and **scoped down on purpose** — read §0a before implementing. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/calendar.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/calendar/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified** — this plan has more unverified than any other so far, because the behaviour lives in a third-party library rather than in daisyUI.


> **Status:** **Implemented** (2026-09-01) at **§0a option 2 — Cally only**, which is the scope decision §6 Step 1 asked to confirm. `Calendar.astro`, a first-of-its-kind custom-element declaration in `src/env.d.ts`, `cally` as an optional peer, and 6 stories. **§3f.1 is answered from Cally's own `dist/cally.d.ts`**, not from this plan's guesses (§3g), and **§3f.2 and §3f.3 are both clear**: `slot="previous"` reaches the output in 6 of 6 calendars (§8). Step 5 (visual pass) is open and matters more here than usual — nothing in the build proves the calendar *renders*.
---

## 0. daisyUI's "Calendar" is not a component — it is a theme for three other people's calendars

The doc page says so in its own subtitle: *"Calendar includes styles for different calendar libraries."* There is no daisyUI calendar markup, no `calendar` class, and nothing to wrap in the sense every other plan in this directory uses that word.

What `calendar.css` actually contains **[verified]**:

| Entry class | Styles | In doc `classnames`? |
|---|---|---|
| `cally` | [Cally](https://github.com/WickyNilliams/cally) web components, almost entirely through `::part()` selectors | yes |
| `react-day-picker` | [React Day Picker](https://github.com/gpbl/react-day-picker), via ~25 `.rdp-*` descendant rules | yes |
| `vc` | [Vanilla Calendar Pro](https://github.com/uvarov-frontend/vanilla-calendar-pro), via `.vc-*` descendant rules | yes |
| `pika-*` | [Pikaday](https://github.com/Pikaday/Pikaday) — `.pika-single`, `.pika-button`, `.pika-lendar`, … | **no** — shipped in the CSS but dropped from the docs. Treat as legacy; do not build for it. |

None of these libraries is a dependency of this package, and `plans/README.md` §2b is explicit that daisyUI and Tailwind are the only peers.

### 0a. Scope decision — this is the part to agree on before writing code

Three candidate scopes. **Recommendation: option 2.**

| Option | What ships | Cost |
|---|---|---|
| **1. Nothing** | Delete `Calendar.astro`/`.stories.ts`; document in the package README that daisyUI's Calendar is third-party styling, and point at native `<input type="date">` | Honest and free. Leaves a hole in the 68-component checklist that has to be explained every time someone reads it |
| **2. Cally only (recommended)** | One `Calendar.astro` wrapping Cally's `<calendar-date>`, with `cally` as an **optional** peer dependency the consumer installs. Plus the README note from option 1 | One optional peer dep, one custom-element type declaration, and a silent-failure mode if the consumer forgets to load Cally (§3a) |
| **3. All three** | Wrappers for Cally, React Day Picker and Vanilla Calendar Pro | React Day Picker is React-only, so it needs `@astrojs/react` and a framework this class-wrapper library otherwise never touches. Vanilla Calendar Pro needs imperative `new Calendar(el).init()` per instance, which collides with `plans/README.md` §6's "a component `<script>` runs once per page". Both are libraries this package would be taking a position on. Rejected |

Why Cally specifically: it is the only one of the three that is (a) framework-agnostic custom elements, so an `.astro` wrapper is a real wrapper rather than a re-export, (b) what **both** interactive examples on the doc page use, and (c) declarative — no init call, no per-instance script.

**And regardless of the option chosen, the package README gains daisyUI's own recommendation**, which the doc page leads with before any library:

> You can also use the native HTML `<input type="date">` for a date picker.

That is the zero-dependency answer for most callers and it belongs in front of them (`plans/README.md`'s install docs, alongside §1c's `@source` note). It is also the ponytail-correct default: a native platform feature over a dependency. `<input type="date">` is styled by daisyUI's **Input** component, so it belongs in `plans/components/text-input.md` when that is written — cross-referenced from both sides.

### 0b. The current scaffold is wrong, not merely unfinished

```astro
<div class:list={['cally', className]}>
```

`.cally`'s rules are one `font-size` on the element itself, a `.cally calendar-month` descendant rule, and **everything else through `::part()`** **[verified]**. A `<div class="cally">` therefore gets a 0.7rem font size and nothing else — no calendar, no error. Every other scaffold in this repo is a valid-but-empty starting point; this one renders a dead element that looks intentional. Replacing it is Step 3, not optional cleanup.

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `cally` | — | — | Always applied to the root (option 2 scope). |

**That is the entire table.** No colour, size, style or state modifiers exist for any of the four entry classes **[verified]** — the styling is entirely structural, keyed to each library's own DOM. Third component in a row with an empty variant table (Breadcrumbs, Browser Mockup, Calendar); do not import `DaisyColor` or `DaisySize`.

The theme colours are wired in directly: `::part(button day today)` uses `--color-primary`, `::part(selected)` uses `--color-base-content` **[verified]**. So the calendar follows the active daisyUI theme with no prop, and there is no way to change the accent colour through a class daisyUI provides.

## 2. Slots

Cally's own API uses **web-component slots**, which is where this component differs from every other one in the library — see §3b for the trap.

| Slot | Rendered as | Optional? | Source in daisyUI example |
|---|---|---|---|
| `previous` | a child carrying `slot="previous"` | yes → **fallback content** | `<svg aria-label="Previous" class="fill-current size-4" …>` |
| `next` | a child carrying `slot="next"` | yes → **fallback content** | `<svg aria-label="Next" class="fill-current size-4" …>` |
| `default` | the month grid | no | `<calendar-month></calendar-month>` |

The doc page's own arrow SVGs are used as **fallback content** (`<slot name="previous">…</slot>`), which `plans/README.md` §5 permits precisely because daisyUI's example ships concrete arrows rather than a placeholder. A caller who passes nothing gets the doc page's calendar; a caller who passes their own icon replaces it.

`<calendar-month>` stays in the default slot rather than being rendered by the component: Cally supports more than one month per calendar (`<calendar-month offset="1">`), and hardcoding a single one would make the multi-month layout unreachable. Confirm that shape against Cally's docs in Step 1 (§3f.1).

## 3. Six things the naive implementation gets wrong

### 3a. The dependency is the consumer's, and forgetting it fails silently

Custom elements that are never registered do not error. `<calendar-date>` renders as an unknown inline element with no children of its own, so a consumer who installs `daisy-astro` and uses `<Calendar />` without loading Cally sees **an empty gap**, not a build failure.

Handling, in the order it matters:

1. **`cally` goes in `peerDependencies` with `peerDependenciesMeta.cally.optional: true`** — consistent with `plans/README.md` §2b's reasoning: this package ships no runtime dependency, and the consumer owns the version.
2. **The component does *not* `import "cally"`.** An import would make Vite fail to resolve for every consumer who does not have it installed — turning an optional peer into a hard one for anyone who so much as imports the component. The consumer adds `import "cally"` once, in their layout.
3. **`cally` becomes a `devDependency` of this package**, imported from `.storybook/preview.ts`, so the stories render a real calendar.
4. The requirement is stated in the component's JSDoc, in the package README's install steps, and in a story comment. Three places is not redundancy here — the failure is invisible, so it has to be findable from wherever the reader starts.

Do **not** add a runtime "is it registered?" check or a `<script>` fallback that loads Cally from a CDN. Both invent behaviour, and the CDN version would pin a version the consumer never chose.

### 3b. `slot` means two different things in the same file

Astro uses a `slot="name"` attribute at a **component call site** to assign content to that component's named slot. The web-components standard uses the identical attribute on a **child element** to assign it to the custom element's shadow-DOM slot. Cally needs the second meaning:

```html
<calendar-date class="cally">
  <svg slot="previous" …></svg>   <!-- web component slot -->
  <calendar-month></calendar-month>
</calendar-date>
```

`<calendar-date>` is a plain HTML element as far as Astro is concerned, not an Astro component, so `slot="previous"` on a child *should* pass through as an ordinary attribute rather than being consumed by Astro. **Should** is doing real work in that sentence — it is §3f.2, and it is the single most likely thing to break silently, because a swallowed `slot` attribute produces a calendar with no visible arrows rather than an error.

The consequence for the API: a caller overriding the `previous` slot must put `slot="previous"` on their own element:

```astro
<Calendar>
  <MyIcon slot="previous" />   <!-- Astro slot name AND web-component slot: same word, both needed -->
</Calendar>
```

That coincidence is convenient and confusing in equal measure. The JSDoc spells it out.

### 3c. `calendar-date` is not a known tag — it needs a type declaration

Every other component in this library extends `HTMLAttributes<'div'>` or similar. `HTMLAttributes<'calendar-date'>` does not type-check: the tag is not in Astro's `IntrinsicElements`, so `astro check` rejects both the `Props` type and the element usage.

Astro's supported fix is to augment `astroHTML.JSX.IntrinsicElements` in `src/env.d.ts` (which currently holds only two `/// <reference>` lines), declaring `calendar-date` and `calendar-month` with the Cally attributes worth typing (`value`, `min`, `max`, `locale`, `today`, `months`, `offset` — confirm the real list against Cally's docs, §3f.1).

Two things to get right:

- This is the **first non-standard element in the library**, so the declaration is new infrastructure, not a per-component detail. It belongs in `env.d.ts` next to the existing references, with a comment saying which component needs it.
- `astro check` is what catches a wrong declaration; `tsc` does not read `.astro` files at all (`plans/README.md` §5b). Run it before believing the types.

### 3d. daisyUI styles Cally through `::part()`, so Tailwind cannot reach inside

Almost every `.cally` rule targets a shadow-DOM part: `::part(container)`, `::part(head)`, `::part(button)`, `::part(day)`, `::part(selected)`, `::part(range-start)`, `::part(range-inner)`, `::part(range-end)` **[verified — one `::part` usage per rule across the whole `.cally` block]**.

What follows:

- **A caller's Tailwind classes cannot style the days, the header or the arrows.** Classes on `<calendar-date>` land on the host element only; `bg-base-100 border border-base-300 shadow-lg rounded-box` in the doc example works precisely because those are host-level properties.
- **There is no `innerClass` escape hatch to offer** (contrast `plans/components/avatar.md` §3a) — there is no inner element in the light DOM to put classes on. A caller who needs to restyle internals writes their own `::part()` rules.
- **Range styling already exists** (`range-start` / `range-inner` / `range-end` parts **[verified]**), which implies Cally's `<calendar-range>` is themed too, even though the doc page never shows it. Whether to expose that element is §3f.1.

### 3e. The doc page's picker example is a Dropdown, not a Calendar feature

The second example — "Cally date picker" — is a `<button popovertarget>` plus a `<div popover class="dropdown">` wrapping the calendar, using the CSS Anchor Positioning API (`anchor-name` / `position-anchor` inline styles). None of that is calendar CSS: it is daisyUI's **Dropdown** component plus the native Popover API.

So it is **not** this component's job to provide a `picker` mode, a `popover` prop or a trigger button. It is a composition story (§5) showing `Calendar` inside the eventual `Dropdown` component — and while `Dropdown` is still "Not started", the story reproduces the doc page's raw markup around the `Calendar`. Cross-reference from `plans/components/dropdown.md` when that is written.

Note also that anchor positioning has real browser-support limits; the doc page uses it without qualification, and this library should not paper over it either. Reproduce, don't extend.

### 3f. Unverified assumptions — more than usual, because the behaviour is Cally's

1. **Cally's actual element and attribute API.** This plan takes `<calendar-date>`, `<calendar-month>` and the `previous`/`next` slots from daisyUI's example, and infers `<calendar-range>` from the range parts in the CSS. The real element list, attribute names, `change` event shape and multi-month usage must come from Cally's own docs in Step 1 — not from this file and not from memory. Everything in §2 and §3c depends on it.
2. **Whether Astro passes `slot="previous"` through to a custom element** (§3b). Blocking for the arrows. Verify in the rendered HTML, not by eye — missing arrows and a swallowed attribute look identical in the canvas.
3. **Whether `@storybook-astro/framework`'s slot sanitization strips `<svg slot="previous">`.** Two independent ways to lose the same arrows (`plans/README.md` §4, and the same inline-SVG question as `plans/components/alert.md` §3d.1). If the arrows vanish, eliminate this before §3f.2.
4. **Whether Cally registers in time in the Storybook sandbox**, given the framework injects SSR'd HTML and then runs scripts (`plans/README.md` §7). Custom-element upgrade is normally order-independent, but this framework's injection path is exactly the kind of thing that breaks that assumption.
5. **daisyUI version skew.** The doc page is fetched from `master`; the installed daisyUI is 5.7.22. Both agree on `cally`/`react-day-picker`/`vc`, and 5.7.22 additionally still ships the undocumented `pika-*` rules **[verified]**. Recheck if daisyUI is upgraded — this is the one component whose supported-library list can change under a patch release.

### 3g. Cally's real API, read from the package

**2026-09-01.** §3f.1 required the element and attribute list to come from
Cally's own docs rather than from this plan's inferences. Read instead from the
installed `cally@0.9.2`'s `dist/cally.d.ts`, which is better than docs — it is
what the code actually declares:

```ts
declare global { interface HTMLElementTagNameMap {
  "calendar-month": …; "calendar-date": …; "calendar-range": …;
}}

CalendarDate:  months, value, min, max, today, locale, firstDayOfWeek,
               focusedDate, formatWeekday, showOutsideDays, showWeekNumbers,
               pageBy, isDateDisallowed, focus()
CalendarMonth: offset, onSelectDay, onFocusDay, onHoverDay
CalendarRange: the CalendarDate list, plus range behaviour
```

Three things this settles:

1. **`<calendar-range>` is real**, which §3d had only inferred from the
   `range-start` / `range-inner` / `range-end` parts in daisyUI's CSS. It is
   declared in `env.d.ts` alongside the other two, so a caller can use it; it
   gets no wrapper component, since it would be the same wrapper with a
   different tag and daisyUI's doc page never shows it.
2. **The attribute names are kebab-cased props** — `first-day-of-week`,
   `show-outside-days`, `format-weekday` — which is what the declaration types.
   §4's guessed list was right about `value`/`min`/`max`/`locale` and missing
   half the rest.
3. **`months` lives on `calendar-date`, and `offset` on `calendar-month`**,
   which confirms §2's decision to leave `<calendar-month>` in the default slot:
   a multi-month calendar is several `calendar-month` children with different
   offsets, and hardcoding one would have made that unreachable.

## 4. Component implementation

Assumes option 2 from §0a. Attribute names marked with `// verify` come from the doc example and must be confirmed against Cally's docs (§3f.1) before shipping.

### `src/env.d.ts` (shared infrastructure, §3c)

```ts
/// <reference types="astro/client" />
/// <reference types="@storybook-astro/framework/shim" />

// Cally web components, used by src/components/Calendar/Calendar.astro.
// Cally is an optional peer dependency — see plans/components/calendar.md §3a.
declare namespace astroHTML.JSX {
  interface IntrinsicElements {
    'calendar-date': astroHTML.JSX.HTMLAttributes & {
      value?: string;      // verify against Cally docs
      min?: string;        // verify
      max?: string;        // verify
      locale?: string;     // verify
    };
    'calendar-month': astroHTML.JSX.HTMLAttributes & {
      offset?: number | string; // verify
    };
  }
}
```

### `Calendar.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * daisyUI's Calendar is theme CSS for third-party calendar libraries, not a
 * daisyUI component. This wraps **Cally**, which is an *optional peer
 * dependency*: install `cally` and `import "cally"` once in your layout, or
 * this renders an empty element with no error (plan §3a).
 *
 * For a dependency-free date picker, use native `<input type="date">` —
 * daisyUI styles it through the Input component.
 *
 * Days, header and arrows live in Cally's shadow DOM and are styled by daisyUI
 * through `::part()`; Tailwind classes on this element reach the host only
 * (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {}

// No variant class map: daisyUI defines one entry class for Cally and no
// modifiers (plan §1).

const { class: className, ...rest } = Astro.props;
---

<calendar-date class:list={['cally', className]} {...rest}>
  {/*
    `slot="previous"` here is the WEB COMPONENT slot attribute, not Astro's
    (plan §3b). A caller overriding these must set it on their own element.
    Fallback arrows are daisyUI's own, copied from the doc page.
  */}
  <slot name="previous">
    <svg aria-label="Previous" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" slot="previous"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
  </slot>
  <slot name="next">
    <svg aria-label="Next" class="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" slot="next"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
  </slot>
  <slot><calendar-month /></slot>
</calendar-date>
```

`Props extends HTMLAttributes<'div'>` is a deliberate approximation: it gives the caller every global HTML attribute while the Cally-specific ones come from the `env.d.ts` declaration on the element itself. Revisit once §3f.1 settles the real attribute list — if Cally's attributes should be typed *props*, `Props` gains them explicitly.

No `<script>`: registration is the consumer's `import "cally"` (§3a), and Cally is declarative once registered.

Not polymorphic, no `as`: the root must be Cally's element.

### Astro idioms gate

- [ ] Content arrives via slots (`previous`, `next`, default) with daisyUI's own arrows as fallback (§2).
- [ ] No `Astro.slots.has()` gating — fallback content covers the optional slots, and there is no styled wrapper to leave empty.
- [ ] Root element is `calendar-date`, **not** a `div` — the scaffold's `div` is inert (§0b).
- [ ] `calendar-date` and `calendar-month` are declared in `src/env.d.ts` and `astro check` passes with them (§3c).
- [ ] No `<script>` added, and **no `import "cally"`** in the component (§3a).
- [ ] `cally` is an optional `peerDependency` and a `devDependency`, and is imported in `.storybook/preview.ts` (§3a).
- [ ] `...rest` spread onto the root element.
- [ ] No `as` prop, no `picker`/`popover` prop (§3e), no `innerClass` (§3d).
- [ ] No class interpolation anywhere — there are no variant classes (§1).
- [ ] `slot="previous"` / `slot="next"` survive into the rendered HTML as attributes (§3b, §3f.2) — checked in the build output, not by eye.
- [ ] Prop typing verified with a throwaway probe (§5c):
  ```astro
  <Calendar />
  <Calendar class="bg-base-100 border border-base-300 shadow-lg rounded-box" id="x" data-test="y" />
  <Calendar color="primary">must error — no colour axis (§1)</Calendar>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. `.storybook/preview.ts` gains `import 'cally'` first (§3a) — without it every story is an empty box.

Doc-page examples in page order (`plans/README.md` §8), limited to the two that are Cally:

| Doc-page example | Story | Props / slots |
|---|---|---|
| Cally calendar example | `Default` | `class: 'bg-base-100 border border-base-300 shadow-lg rounded-box'`, default slots |
| Cally date picker example | `InDropdown` | the page's `<button popovertarget class="input" style="anchor-name:--cally1">` + `<div popover class="dropdown …">` wrapper around a bare `<Calendar />` (§3e) |

The React Day Picker and Vanilla Calendar Pro sections of the doc page get **no stories** — they are out of scope per §0a, and the reason is recorded in a comment at the top of the story file so the omission reads as a decision rather than an oversight.

Two stories beyond the doc page:

- **`CustomArrows`** — `previous`/`next` slots overridden, demonstrating §3b's double-meaning `slot` attribute at a real call site. This is the story that fails loudly if §3f.2 goes wrong.
- **`NativeDateInput`** — a plain `<input type="date" class="input" />` beside the Cally calendar, with a comment pointing at daisyUI's own recommendation (§0a). It costs three lines and stops the zero-dependency option from being invisible.

```ts
import Calendar from './Calendar.astro';

// daisyUI's Calendar is theme CSS for third-party libraries (plan §0). These
// stories cover Cally only; React Day Picker (React-only) and Vanilla Calendar
// Pro (imperative init) are out of scope by decision — see plan §0a.
// `.storybook/preview.ts` must `import 'cally'` or every story renders empty.

export default {
  title: 'Components/Calendar',
  component: Calendar,
  // No variant argTypes — this component has none (plan §1).
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: { class: 'bg-base-100 border border-base-300 shadow-lg rounded-box' },
};

export const Default = {
  args: { class: 'bg-base-100 border border-base-300 shadow-lg rounded-box' },
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    id: 'cal-1',
    'data-test': 'yes',
    class: 'mine bg-base-100 border border-base-300 rounded-box',
  },
};
```

## 6. Steps

- [x] **Step 1: done — §0a option 2 confirmed, and §3f.1 answered** from `cally@0.9.2`'s own type declarations rather than this plan's guesses. See §3g.
- [x] **Step 2: done.** `cally` is a `devDependency` (so the stories render) **and** an optional `peerDependency` via `peerDependenciesMeta`, and `.storybook/preview.ts` imports it. `variants.ts` untouched — there are no variant axes.
- [x] **Step 3: done.** `src/env.d.ts` gained the library's **first non-standard element declarations**, and the `div`-based scaffold — which rendered an inert element that looked intentional — is gone. `astro check` passes with the declaration, which is the thing it exists to catch; the probe errors on `size` and `variant`.
- [x] **Step 4: done.** `Calendar.stories.ts`, 6 stories, with the omission of React Day Picker and Vanilla Calendar Pro explained at the top.
- [ ] **Step 5:** `pnpm storybook`. **Still open, and it carries more than usual: nothing in the build proves the calendar renders at all.** Verify: `Default` shows a real month grid — an empty box means Cally is unregistered (§3a) or did not upgrade in this sandbox (§3f.4); **both arrows are visible and change the month**; today is `--color-primary` and a selection `--color-base-content`, which is `::part()` theming reaching the shadow DOM (§3d); switching the Storybook theme moves the calendar with it, with no prop; `CustomArrows` shows the caller's icons instead of the fallbacks; and `InDropdown` opens on click — noting whether anchor positioning works in this browser rather than assuming (§3e).
- [x] **Step 6: done — and it answers the two questions that could have silently cost the arrows.** `slot="previous"` and `slot="next"` each reach the rendered HTML **6 times out of 6**, so Astro does not swallow the attribute (§3f.2) and the story pipeline does not strip the SVGs (§3f.3). `Passthrough` forwards `id`, `data-*`, `style`, `class` **and Cally's own `value` / `locale`**. Full output in §8.
- [x] **Step 7: done.** The `Calendar` row in `plans/README.md` records the Cally-only scope, and the **package README gained a fourth setup item** carrying both halves of §0a: the `cally` install and register step, and daisyUI's own `<input type="date">` recommendation as the zero-dependency answer.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] §0a's scope decision is recorded in this file, and the checklist row in `plans/README.md` reflects it.
- [x] The `div`-based scaffold is gone; the root is `calendar-date` (§0b).
- [x] `cally` is an **optional** peer dependency, is **not** imported by the component, and the requirement appears in the JSDoc, the package README and the story file (§3a).
- [x] `calendar-date` / `calendar-month` are declared in `env.d.ts` and `astro check` passes (§3c).
- [x] `slot="previous"` and `slot="next"` reach the rendered HTML as attributes (§3b) — confirmed in the build output.
- [x] Fallback arrows render when the slots are unused; caller icons replace them when used (§2).
- [x] Caller `class` merges onto the host element, and no `innerClass` is offered (§3d).
- [x] No invented axis — no colour, size, `picker` or `popover` prop (§1, §3e).
- [x] The package README carries daisyUI's own `<input type="date">` recommendation, cross-referenced from the future `text-input` plan (§0a).
- [x] Stories cover both Cally doc examples, plus `CustomArrows` and `NativeDateInput`; the omission of the other two libraries is explained in a comment.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01), SVG paths elided. `astro check`: 198 files, 0 errors, 0 warnings, 0 hints.

```
Default     → <calendar-date class="cally bg-base-100 border border-base-300 shadow-lg rounded-box">
                <svg aria-label="Previous" class="fill-current size-4" … slot="previous">…</svg>
                <svg aria-label="Next" … slot="next">…</svg>
                <calendar-month></calendar-month></calendar-date>
CustomArrows→ …<span slot="previous" class="px-1">←</span><span slot="next" class="px-1">→</span>…
Passthrough → <calendar-date id="cal-1" data-test="yes" style="letter-spacing:1px" value="2026-09-01"
                locale="en-GB" class="cally mine bg-base-100 …">
```

Counts across the 6 stories:

```
<calendar-date> roots 6 | <calendar-month> 6
slot="previous" 6 | slot="next" 6      ← §3f.2 and §3f.3, both clear
```

What this settles:

- **§3f.2, which was the most likely silent failure in the plan.** `slot` means one thing to Astro and another to the web component, and a swallowed attribute would have produced a calendar with no arrows and no error. It survives in both forms: on the component's own fallback SVGs, and on a caller's `<span slot="previous">` in `CustomArrows`.
- **§3f.3 with it**: the fallback arrows are inline SVG and reach the output intact.
- **§0b's scaffold really was wrong rather than unfinished.** `<div class="cally">` gets one `font-size` rule and nothing else — a dead element that looks deliberate. The root is now Cally's own tag, which is the only thing `::part()` styling can attach to.
- **§3d has no escape hatch to offer, and the output shows why**: the light DOM holds two arrows and a `calendar-month`, and nothing else. Every day, header and button lives in the shadow DOM, so `innerClass` would have nothing to class.
- **Cally's attributes pass through untyped-by-props but typed-by-element**: `value` and `locale` land on the host from `...rest`, declared in `src/env.d.ts` rather than as component props.

Not settled here: whether Cally registers and renders a month at all. That is Step 5, and unusually, **the build cannot substitute for it** — an unregistered custom element produces exactly this markup and shows an empty box.
