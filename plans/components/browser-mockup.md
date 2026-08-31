# Browser Mockup Component Plan

**daisyUI category:** Mockup
**daisyUI doc page:** https://daisyui.com/components/mockup-browser/ (the docs source path is `mockup-browser`, not `browser-mockup`)
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/BrowserMockup/BrowserMockup.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/BrowserMockup/BrowserMockup.stories.ts` (currently a dummy `Default` story)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b). **Browser Mockup has no variant classes**, so no map exists (§1).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Browser Mockup uses none of them** (§1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-31). `BrowserMockup.astro` and 7 stories per §5. The `toolbar` gate is asserted in the build output: **7 toolbars across 8 mockups**, the missing one being the story that deliberately omits the slot (§8). Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/mockup.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/mockup-browser/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.

---

## 0. Where the CSS lives, and the name inversion

**All four mockups share one file.** `mockup.css` holds `mockup-code`, `mockup-window`, `mockup-browser`, `mockup-browser-toolbar`, `mockup-phone`, `mockup-phone-camera` and `mockup-phone-display` **[verified]** — there is no `mockup-browser.css`. Grepping "this component's CSS file" the way the other plans do will pull in three sibling components; filter on `mockup-browser` specifically.

Also note the naming inversion, already fixed by the scaffold and by `plans/README.md`'s checklist: the **class** is `mockup-browser`, the **component and directory** are `BrowserMockup`, and the **doc URL** is `/components/mockup-browser/` while this repo's slug is `browser-mockup`. All four spellings are correct in their own place; don't "fix" any of them.

The complete unprefixed rule set **[verified]**:

```css
.mockup-browser { border-radius: var(--radius-box); position: relative; overflow: auto hidden }
.mockup-browser pre[data-prefix]:before { content: attr(data-prefix); text-align:right; display:inline-block }
.mockup-browser .mockup-browser-toolbar {
  display:inline-flex; align-items:center; width:100%;
  margin-block:.75rem; padding-right:1.4em;
  &:where(:dir(rtl),[dir=rtl],[dir=rtl] *) { flex-direction: row-reverse }
  &:before { content:""; aspect-ratio:1; height:.75rem; opacity:.3; border-radius:9999px;
             margin-right:4.8rem; display:inline-block;
             box-shadow: 1.4em 0, 2.8em 0, 4.2em 0 }        /* ← the three dots */
  & .input { background-color: var(--color-base-200); height:100%; margin-inline:auto;
             font-size:.75rem; display:flex; align-items:center; gap:.5rem;
             direction:ltr; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;
             &:before { /* magnifier icon, inline SVG mask */ } }
}
```

## 1. Variant audit

**2 classes: 1 component + 1 part.** `grep -oE '\.mockup-browser[a-z0-9-]*' mockup.css | sort -u` returns exactly `.mockup-browser` and `.mockup-browser-toolbar` **[verified]**, matching the doc page's `classnames` frontmatter.

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `mockup-browser` | — | — | Always applied to the root. |
| Part | `mockup-browser-toolbar` | — | — | Wrapper for the `toolbar` slot (§2). Not a prop. |

**No colour, size, style or direction axis** — none exists **[verified]**. Second component in a row with an empty variant table (after Breadcrumbs); that is the honest result, not an unfinished audit. The `border border-base-300 w-full` and `bg-base-100` in the doc examples are plain Tailwind on the root — see §3b.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, not props; same reasoning as `plans/components/alert.md` §3c.)

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `toolbar` | `div.mockup-browser-toolbar` | **yes → gate with `Astro.slots.has()`** | `<div class="input">https://daisyui.com</div>` |
| `default` | none — child of the root | no | `<div class="grid place-content-center border-t border-base-300 h-80">Hello!</div>` |

`toolbar` is the textbook case for `plans/README.md` §5's gating rule, and skipping the gate here is visibly wrong rather than subtly wrong: `.mockup-browser-toolbar` carries `margin-block:.75rem` **and** a `::before` that paints the three traffic-light dots **[verified]**. Rendered unconditionally, a caller who wanted a bare mockup gets an empty strip with three dots in it.

```astro
const hasToolbar = Astro.slots.has('toolbar');
```

No fallback content on either slot — daisyUI's examples show real content, not placeholders.

**No `url` prop.** The address bar is `<div class="input">https://daisyui.com</div>`, passed by the caller into the `toolbar` slot. A `url="https://…"` prop would be a content prop (`plans/README.md` §5) and would also hardcode the assumption that a toolbar contains exactly one address bar and nothing else — no tab strip, no buttons. The cost is that callers must know the magic `input` class, so the JSDoc names it and every story shows it.

**No `toolbarClass`.** Neither doc example puts any class on the toolbar div, so unlike `plans/components/avatar.md` §3a there is no styling surface to expose. If one is ever needed, that is a plan revision.

## 3. Six things the naive implementation gets wrong

### 3a. `overflow: auto hidden` clips tall content with no scrollbar

`.mockup-browser` is `overflow: auto hidden` **[verified]** — that is `overflow-x: auto; overflow-y: hidden`. Content taller than the box is **silently cut off**, with no vertical scrollbar to hint at it.

Both doc examples sidestep this by giving the content area a fixed `h-80`, so the mockup is exactly as tall as its content. A caller who drops in a long page fragment instead gets a truncated screenshot and no error.

Not something to override in the component — it is deliberate on daisyUI's part (a browser chrome should crop like a viewport). It goes in the component's JSDoc, and one story demonstrates it (§5, `OverflowClipping`) so the behaviour is discoverable rather than surprising.

### 3b. The mockup has no border, no background and no width of its own

`.mockup-browser` sets only `border-radius`, `position` and `overflow` **[verified]**. Everything that makes the doc screenshots look like a browser comes from caller classes:

- `border border-base-300` — the first example's frame;
- `bg-base-100` — the second example's fill;
- `w-full` — **both** examples; without it the mockup shrinks to its content width;
- `border-t border-base-300` on the content div — the line under the toolbar, present in the border example and absent in the background one.

None of these become props: they are plain Tailwind, they vary between the two official examples, and defaulting any of them would fight the caller. But a bare `<BrowserMockup>` with no `class` looks like nothing at all — an unframed, content-width box — so `Playground` and every story pass the doc page's classes, and the JSDoc states that a frame is caller-supplied.

### 3c. The three dots are a `::before` on the toolbar — no toolbar, no dots

The traffic lights are not markup. They are one `::before` circle painted four times by `box-shadow: 1.4em 0, 2.8em 0, 4.2em 0` **[verified]**, attached to `.mockup-browser-toolbar`.

Consequences, all of which are "document, don't fix":

- **A mockup without a toolbar has no dots at all.** daisyUI offers no way to have one without the other. If someone wants dots above bare content, the supported answer is an empty-ish toolbar slot, not a new prop.
- **The dots cannot be recoloured, removed or counted differently** through daisyUI — there is no variable and no modifier. A caller wanting a different chrome writes their own `::before` override.
- The `margin-right: 4.8rem` on that pseudo-element is what reserves space for the dots, and `.input`'s `margin-inline: auto` is what centres the address bar in the remainder. A toolbar with several children will not centre the way the single-address-bar example does; that is layout the caller now owns.

### 3d. `.input` here is daisyUI's Input class on a `<div>`, restyled for this context

`.mockup-browser-toolbar .input` overrides daisyUI's ordinary Input styling — base-200 background, `font-size:.75rem`, full height, `direction:ltr` and ellipsis truncation — and injects a magnifier icon through a `::before` with an inline-SVG `mask` **[verified]**. All of it is scoped to inside the toolbar; the same `<div class="input">` elsewhere looks like a normal input.

Two things follow:

- **It is a `<div>`, not an `<input>`.** The address bar is display-only text, and `direction:ltr` plus `text-overflow:ellipsis` are there to truncate long URLs sensibly.
- **Cross-plan note:** when the Text Input component is planned (`plans/components/` — not started yet), its root will be an `<input>`. If it should be reusable as this address bar, it needs a polymorphic `as` that accepts `div`. Flagging it here so that plan makes the choice deliberately; until then the stories use raw `<div class="input">`, exactly as the doc page does.

### 3e. Descendant selectors — this component is *not* exposed to the slot-wrapping risk

`.mockup-browser .mockup-browser-toolbar`, `& .input` and `.mockup-browser pre[data-prefix]` are all **descendant** selectors **[verified]**, and the toolbar wrapper is rendered by the component itself. So an extra element introduced around slot content would not break any rule here.

Stated explicitly because three sibling plans open with the opposite situation — `plans/components/aura.md` §3e.1, `plans/components/alert.md` §3d.2 and `plans/components/breadcrumbs.md` §3f.1 all block on it. **Do not copy that blocking language into this component's checks.** Same conclusion, same reason, as `plans/components/avatar.md` §3e.

The stray `pre[data-prefix]:before` rule exists so mockup-code-style prefixed lines work inside a browser mockup. It needs no prop — a caller writing `<pre data-prefix="$">` gets it for free.

### 3f. Unverified assumptions

1. **Slot sanitization vs the `mask:url("data:image/svg+xml,…")` address bar.** The magnifier is CSS, not markup, so it is not a sanitizer target — but the `<div class="input">` that carries it comes through slot HTML. Confirm the div survives with its class intact; a stripped `class` leaves plain text where the address bar should be. Related but distinct from the inline-`<svg>` question in `plans/components/alert.md` §3d.1.
2. **RTL.** `flex-direction: row-reverse` is applied via `:where(:dir(rtl), [dir=rtl], [dir=rtl] *)` **[verified]** — a modern selector combination worth eyeballing once in the canvas rather than assuming. No component code either way; if it doesn't flip, that is daisyUI's business, not this wrapper's.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
interface Props extends HTMLAttributes<'div'> {}

// No variant class map: daisyUI defines one component class and one part class
// for this component, and no modifiers at all (plan §1).

const { class: className, ...rest } = Astro.props;

// The toolbar carries `margin-block` and the three-dot `::before`, so an
// unused one renders as a visible empty strip (plan §2, plans/README.md §5).
const hasToolbar = Astro.slots.has('toolbar');
---

<!--
  daisyUI supplies only border-radius, position and overflow. The frame,
  background and width are caller classes — `border border-base-300 w-full`
  in the doc examples (plan §3b). Content taller than the box is clipped:
  `overflow-y` is hidden (plan §3a).
-->
<div class:list={['mockup-browser', className]} {...rest}>
  {hasToolbar && (
    <div class="mockup-browser-toolbar">
      {/* Address bar is `<div class="input">…</div>` from the caller (plan §3d). */}
      <slot name="toolbar" />
    </div>
  )}
  <slot />
</div>
```

That is the whole component: one class, one gated part, no props beyond native passthrough.

No `<script>`: pure CSS, RTL included (§3f.2).

Not polymorphic: daisyUI documents `mockup-browser` on a wrapper `div` only, so there is no `as` prop.

### Astro idioms gate

- [ ] Content arrives via slots (`toolbar`, default) — no `url` prop (§2).
- [ ] The optional `toolbar` wrapper is gated with `Astro.slots.has()` — verified by rendering **without** the slot and confirming no `mockup-browser-toolbar` element and no dots appear in the HTML (§2, §3c).
- [ ] Root element is `div`, matching both doc examples.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element.
- [ ] No `as` prop.
- [ ] No variant prop collides with a native attribute — there are no variant props at all (§1).
- [ ] No class interpolation anywhere — there are no variant classes to interpolate (§1).
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <BrowserMockup class="border border-base-300 w-full">Hello!</BrowserMockup>
  <BrowserMockup id="x" data-test="y" style="max-width:40rem">Hello!</BrowserMockup>
  <BrowserMockup color="primary">must error — no colour axis (§1)</BrowserMockup>
  <BrowserMockup url="https://x.com">must error — address bar is a slot (§2)</BrowserMockup>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8) — there are only two:

| Doc-page example | Story | Props / slots |
|---|---|---|
| browser mockup with border | `WithBorder` | `class: 'border border-base-300 w-full'`, toolbar `<div class="input">https://daisyui.com</div>`, default `<div class="grid place-content-center border-t border-base-300 h-80">Hello!</div>` |
| browser mockup with background color | `WithBackgroundColor` | `class: 'bg-base-100 w-full border border-base-300'`, same toolbar, default `<div class="grid place-content-center h-80">Hello!</div>` (no `border-t`) |

Plus `Playground` and `Passthrough` (Step 6). No variant axes exist, so there are no axis stories.

Three stories beyond the doc page, each pinning a §3 decision:

- **`NoToolbar`** — no `toolbar` slot at all. Must render a plain rounded box with **no dots and no empty strip**; this is the §2 gating check made visible.
- **`OverflowClipping`** — content taller than the mockup, demonstrating §3a's silent vertical crop next to a correctly-sized `h-80` copy.
- **`Unframed`** — no `class` at all, showing §3b's "daisyUI gives you no border, no background and no width", so the frame's caller-owned nature is obvious rather than folklore.

```ts
import BrowserMockup from './BrowserMockup.astro';

const TOOLBAR = '<div class="input">https://daisyui.com</div>';
const BODY = '<div class="grid place-content-center border-t border-base-300 h-80">Hello!</div>';

export default {
  title: 'Components/BrowserMockup',
  component: BrowserMockup,
  // No argTypes for variants — this component has none (plan §1). `class` is
  // the only meaningful knob, and it is where the frame comes from (plan §3b).
  argTypes: {
    class: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: 'border border-base-300 w-full',
    slots: { toolbar: TOOLBAR, default: BODY },
  },
};

export const WithBorder = {
  args: {
    class: 'border border-base-300 w-full',
    slots: { toolbar: TOOLBAR, default: BODY },
  },
};

// §2 gating check: no toolbar slot → no toolbar element, no dots, no strip.
export const NoToolbar = {
  args: {
    class: 'border border-base-300 w-full',
    slots: { default: '<div class="grid place-content-center h-80">Hello!</div>' },
  },
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    id: 'mockup-1',
    'data-test': 'yes',
    style: 'max-width:40rem',
    class: 'mine border border-base-300 w-full',
    slots: { toolbar: TOOLBAR, default: BODY },
  },
};
```

## 6. Steps

- [x] **Step 1: done.** §3e holds — descendant selectors only, so the blocking language from the sibling plans does not apply here.
- [x] **Step 2: skipped as planned.** No variant axes; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4, with the `Astro.slots.has('toolbar')` gate. Gate walked.
- [x] **Step 4: done.** `BrowserMockup.stories.ts`, 7 stories per §5.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `WithBorder` shows the toolbar with **three dots** and a centred address bar; `WithBackgroundColor` fills and drops the rule; **`NoToolbar`'s first mockup has no strip and no dots** (§3c); `LongUrl` ellipsises rather than wrapping, with the magnifier icon present (§3d); `OverflowClipping` cuts off with no scrollbar (§3a); and RTL flips the toolbar (§3f.2).
- [x] **Step 6: done — forwarding confirmed and the gate asserted.** `Passthrough` renders `<div class="mockup-browser mine border border-base-300 w-full" id="browser-1" data-test="yes" style="max-width:40rem">`. Full output in §8.
- [x] **Step 7: done — the `Browser` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] Both daisyUI classes from §1 are reachable: `mockup-browser` always, `mockup-browser-toolbar` as the gated `toolbar` slot wrapper.
- [x] No invented axis — no `color`, no `size`, no `url` prop (§2), no `toolbarClass` (§2).
- [x] `Props` extends `HTMLAttributes<'div'>`; native attributes work without explicit declaration.
- [x] Caller `class` merges through `class:list` — load-bearing here, since the frame, background and width all arrive that way (§3b).
- [x] Omitting the `toolbar` slot produces no toolbar element in the rendered HTML (§2) — checked in the build output, not by eye.
- [x] The JSDoc states: content is clipped vertically (§3a), the frame is caller-supplied (§3b), the dots come with the toolbar and only with it (§3c), and the address bar is `<div class="input">` (§3d).
- [x] `Playground` exposes `class` as a control and renders the doc page's shape.
- [x] One story per doc-page example, reproducing that example's markup and copy.
- [x] `NoToolbar`, `OverflowClipping` and `Unframed` exist and demonstrate §2, §3a and §3b.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31).

`astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

**One probe line was unachievable**, and it is the same shape as the `color` finding in `plans/components/avatar.md` §3e.3: `<WindowMockup title="Untitled">` does **not** error, because `title` is a native attribute on every element. No component can reject it; it forwards and does nothing. Drop that line from any plan's probe — `color`, `title`, `role` and `translate` are all on the base interface.

```
WithBorder   → <div class="mockup-browser border border-base-300 w-full">
                 <div class="mockup-browser-toolbar"><div class="input">https://daisyui.com</div></div>
                 <div class="grid place-content-center border-t border-base-300 h-80">Hello!</div></div>
NoToolbar    → <div class="mockup-browser border border-base-300 w-full">
                 <div class="grid place-content-center h-20">Hello!</div></div>     ← no strip at all
               … then the same mockup with a toolbar, for comparison
LongUrl      → <div class="input">https://daisyui.com/components/mockup-browser/a/very/long/path…</div>
Passthrough  → <div class="mockup-browser mine border border-base-300 w-full" id="browser-1"
                 data-test="yes" style="max-width:40rem">…
```

What this settles:

- **The `toolbar` gate works**: 7 toolbar wrappers across 8 rendered mockups, the missing one being `NoToolbar`'s first. Rendering it unconditionally would have given that caller an empty strip carrying vertical margin and three dots — which is exactly why §2 called this the textbook gating case.
- The address bar reaches the DOM as `<div class="input">` with its class intact, so §3f.1's sanitization worry is settled (sanitization is off library-wide anyway).
- Everything else the mockup looks like arrives through caller classes (§3b).

Not settled here: the dots, the magnifier, the URL truncation and the RTL flip. Step 5.
