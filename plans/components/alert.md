# Alert Component Plan

**daisyUI category:** Feedback
**daisyUI doc page:** https://daisyui.com/components/alert/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Alert/Alert.astro` (currently a dummy scaffold — no props, no variants)
**Story file:** `packages/daisy-astro/src/components/Alert/Alert.stories.ts` (currently a dummy `Default` story)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare. **Alert uses neither `DaisyColor` nor `DaisySize`** (see §1 and §3a).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-31). `Alert.astro` and 14 stories. §2's structural rule is asserted in the build output, with `WrappedChildren` showing the failure it prevents (§8). Step 5 (visual pass) is open, and it carries §3c's one open question — whether Tailwind emits daisyUI's prefixed `sm:alert-horizontal` from a story's class string. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/alert.css`), the doc page source (`packages/docs/src/routes/(routes)/components/alert/+page.md` in `saadeghi/daisyui`), and `astro@7.2.4`'s `astro-jsx.d.ts`. §3d lists what is **unverified** and must be resolved while building.

---

## 1. Variant audit

Every class in `alert.css`, cross-checked against the doc page's `classnames` frontmatter. **10 classes: 1 base + 4 color + 3 style + 2 direction.** All 10 are covered below. (The file also ships `sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies of all of them **[verified]** — those are caller-side responsive classes, not props; see §3c.)

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `alert` | — | — | Always applied. |
| Color | `alert-info` `alert-success` `alert-warning` `alert-error` | `color` | `AlertColor` = `'info' \| 'success' \| 'warning' \| 'error'` | **Not `DaisyColor`** — see §3a. Component-specific union, stays local. |
| Style | `alert-outline` `alert-dash` `alert-soft` | `variant` | `'outline' \| 'dash' \| 'soft'` | **Must not be named `style`** — native attribute, exactly the trap `plans/components/button.md` §3a hit. Mutually exclusive, so a union, not three booleans. |
| Direction | `alert-vertical` `alert-horizontal` | `direction` | `'vertical' \| 'horizontal'` | Mutually exclusive layouts → union. `direction` is **not** on `HTMLAttributes` (it exists only on `SVGAttributes`, `astro-jsx.d.ts:1186`) **[verified]**, so no collision on a `div` root. |

**No size axis, no `alert-primary`/`secondary`/`accent`/`neutral`.** `grep -o 'alert-[a-z]*' alert.css | sort -u` yields exactly `alert-dash alert-error alert-horizontal alert-info alert-outline alert-soft alert-success alert-vertical alert-warning` **[verified]**. Do not import `DaisySize`. Do not invent a `size` prop.

### 1a. Non-class props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `role` | inherited (`AriaRole`) | `'alert'` | Every example on the doc page carries `role="alert"`. Defaulted, not hardcoded — see §3b. |

## 2. Slots

Single default slot, rendered as the **direct children of the root** with no wrapper element.

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — children of `div.alert` | no | icon `<svg>` + `<span>` (+ optional `<div>` of buttons) |

No named slots, and **no `Astro.slots.has()` gating** — there is no optional styled wrapper to gate. The one structural rule is stronger than usual and is why this section is not boilerplate:

**Never wrap `<slot />` in an element.** `.alert` is `display:grid; grid-auto-flow:column`, and it re-lays-itself out with `&:has(>:nth-child(2)){grid-template-columns:auto minmax(auto,1fr)}` **[verified in `alert.css`]**. The layout is a function of the *direct child count*. A single wrapper div around the slot collapses every alert to the one-child branch, so the icon/text/actions layout silently degrades to a single centred column while the markup still looks plausible.

The doc page's icon+text+actions shape is therefore composed by the caller passing multiple children:

```astro
<Alert color="info">
  <svg …/>
  <span>New software update available.</span>
</Alert>
```

No `icon` prop and no `title`/`description` props: daisyUI imposes no inner classes here (`alert-title` does not exist **[verified]**), so any structure this component invented would be library-specific fiction. The "title and description" doc example is a caller-supplied `<div><h3 class="font-bold">…</h3><div class="text-xs">…</div></div>` — plain Tailwind, reproduced in the story, not in the component.

## 3. Four things the naive implementation gets wrong

### 3a. `DaisyColor` is the wrong type here — it would type-approve four dead classes

`DaisyColor` has 8 values; `alert.css` defines colour rules for **4** of them. Reusing the shared union makes `<Alert color="primary">` type-check, emit `alert-primary`, and match no CSS rule at all — the exact class of invisible failure `plans/README.md` §1b exists to prevent, arriving through the type system instead of through interpolation. The `Record<AlertColor, string>` map makes the map itself exhaustive-checked against the real four.

This is the first component whose colour axis is a strict subset of `DaisyColor`. Do not "fix the inconsistency" by widening it, and do not add `AlertColor` to `variants.ts` unless a second component turns out to share exactly this set (Badge/Toast are the likely candidates — check their CSS, don't assume).

### 3b. `role="alert"` must be a defaulted prop, not a hardcoded attribute

All 9 doc examples carry `role="alert"`, and it is what makes the component announce itself to a screen reader, so the default belongs in the component rather than at every call site.

But `role` **is** declared on Astro's base `HTMLAttributes` (`astro-jsx.d.ts:587`, `role?: AriaRole`) **[verified]**, so it arrives inside `...rest`. Writing `<div role="alert" {...rest}>` leaves the outcome of a caller-supplied `role` to Astro's duplicate-attribute precedence — unverified, and not worth depending on either way. Destructure it with a default instead:

```ts
const { role = 'alert', … , ...rest } = Astro.props;
```

Deterministic, needs no precedence knowledge, and keeps the override working. No explicit `role` declaration is added to `Props` — it is inherited, so the `AriaRole` type is kept for free.

Not overridden: `role="alert"` implies `aria-live="assertive"`, which is right for a warning/error and arguably loud for an info notice (`role="status"` is the polite counterpart). daisyUI ships `role="alert"` for all four colours; the component follows the library, and a caller who wants politeness passes `role="status"`. Do not branch `role` on `color` — that is behaviour daisyUI does not document.

### 3c. Responsive direction is a caller class, not a prop

The doc page's last two examples use `alert-vertical sm:alert-horizontal`. daisyUI ships `sm:alert-horizontal` (and `md:`/`lg:`/`xl:`/`2xl:`) as real prebuilt classes **[verified in `alert.css`]**, so the caller writes them directly:

```astro
<Alert direction="vertical" class="sm:alert-horizontal">…</Alert>
```

A `direction={{ base: 'vertical', sm: 'horizontal' }}` prop would need a `sm:alert-${x}` interpolation to implement — banned by §1b — or a 5×2 literal map for an axis daisyUI expects Tailwind's own prefix syntax to handle. Not built.

The one thing to confirm (Step 5): that Tailwind's scan of the *story file's* `class` string emits `sm:alert-horizontal`. It is a literal in source under `@source "../src"`, so it should — but this class is prefixed *inside* daisyUI's own CSS rather than generated by Tailwind's variant machinery, and that combination has not been checked in this repo. If the responsive story doesn't reflow at the `sm` breakpoint, this is why — check the built CSS before touching the component.

### 3d. Unverified assumptions — resolve while building, don't build on them

1. ~~**Slot sanitization vs inline `<svg>`.**~~ **Answered 2026-08-29 (while building Button): SVG survives.** Sanitization is disabled in `.storybook/main.ts` — the framework's default allowlist has no `svg` at all, so it had to go; see `plans/IMPLEMENTATION-ORDER.md` §2, Tier 0.3. No text stand-in is needed. The symptom is still worth knowing: a stripped `<svg>` removes a direct child, which per §2 also changes the grid layout, so it reads as a broken component rather than a missing icon.
2. ~~**Multiple root children from one slot string.**~~ **Answered 2026-08-29: siblings are preserved.** One slot value renders as direct children of the root, unwrapped, whether it is a multi-element HTML string or an array of strings and components (`Button.stories.ts` `WithIcon` renders `<svg>` and a text node as siblings inside `.btn`). Same question as `plans/components/aura.md` §3e.1.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
// Not DaisyColor: alert.css defines only these four (plan §3a).
type AlertColor = 'info' | 'success' | 'warning' | 'error';
type AlertVariant = 'outline' | 'dash' | 'soft';
type AlertDirection = 'vertical' | 'horizontal';

interface Props extends HTMLAttributes<'div'> {
  color?: AlertColor;
  /** Named `variant`, never `style` — `style` is a native attribute (plan §3a). */
  variant?: AlertVariant;
  /** Responsive variants come from the caller's `class` (plan §3c). */
  direction?: AlertDirection;
}

// Full literal class names. NEVER `alert-${color}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<AlertColor, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const VARIANT: Record<AlertVariant, string> = {
  outline: 'alert-outline',
  dash: 'alert-dash',
  soft: 'alert-soft',
};

const DIRECTION: Record<AlertDirection, string> = {
  vertical: 'alert-vertical',
  horizontal: 'alert-horizontal',
};

// `role` is inherited from HTMLAttributes and defaulted here rather than
// hardcoded on the element, so a caller can still override it (plan §3b).
const { color, variant, direction, role = 'alert', class: className, ...rest } = Astro.props;
---

<div
  class:list={[
    'alert',
    color && COLOR[color],
    variant && VARIANT[variant],
    direction && DIRECTION[direction],
    className,
  ]}
  role={role}
  {...rest}
>
  <slot />
</div>
```

**`<slot />` is a direct child of the root and stays that way** — see §2. Any wrapper added here breaks `.alert`'s grid.

No `<script>`: Alert is pure CSS with no interactive behaviour (no dismiss button in any daisyUI example). A dismissible alert is the caller's own button plus their own handler; this library does not invent one.

Not polymorphic: daisyUI documents `alert` on a `div` only, so there is no `as` prop (contrast `plans/components/button.md` §4).

### Astro idioms gate

- [ ] Content arrives via the default slot, not `icon`/`title`/`description` props.
- [ ] `<slot />` has **no wrapper element** — the grid depends on direct child count (§2).
- [ ] No `Astro.slots.has()` gating needed (no optional styled wrapper).
- [ ] Root element is `div`, matching every doc example.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element.
- [ ] No `as` prop — daisyUI documents one element.
- [ ] No variant prop collides with a native attribute: the style axis is named `variant` not `style`; `direction` is absent from `HTMLAttributes` **[verified]**; `color` shadows only the obsolete non-standard `color` attribute (`astro-jsx.d.ts:602`) **[verified]**, the same accepted tradeoff as Button.
- [ ] `role` destructured with a default, not hardcoded alongside the spread (§3b).
- [ ] Every variant class is a full literal in a `Record` map — no `` `alert-${color}` `` anywhere.
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <Alert>ok</Alert>
  <Alert color="warning" variant="soft" direction="vertical">ok</Alert>
  <Alert role="status" id="x" data-test="y" class="sm:alert-horizontal">ok</Alert>
  <Alert color="primary">must error — no alert-primary (§3a)</Alert>
  <Alert size="lg">must error — no size axis (§1)</Alert>
  <Alert variant="ghost">must error — not an alert style</Alert>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props / slots |
|---|---|---|
| Alert | `Default` | info-tinted `<svg>` + `<span>12 unread messages. Tap to see.</span>`, no colour prop |
| Info color | `InfoColor` | `color: 'info'`, `<span>New software update available.</span>` |
| Success color | `SuccessColor` | `color: 'success'`, `<span>Your purchase has been confirmed!</span>` |
| Warning color | `WarningColor` | `color: 'warning'`, `<span>Warning: Invalid email address!</span>` |
| Error color | `ErrorColor` | `color: 'error'`, `<span>Error! Task failed successfully.</span>` |
| Alert soft style | `SoftStyle` | all four colours, `variant: 'soft'`, no icons |
| Alert outline style | `OutlineStyle` | all four colours, `variant: 'outline'`, no icons |
| Alert dash style | `DashStyle` | all four colours, `variant: 'dash'`, no icons |
| Alert with buttons + responsive | `WithButtons` | `direction: 'vertical'`, `class: 'sm:alert-horizontal'`, icon + span + `<div>` of two `btn btn-sm` |
| Alert with title and description | `WithTitleAndDescription` | same as above, icon + `<div><h3 class="font-bold">…</h3><div class="text-xs">…</div></div>` + `<button class="btn btn-sm">See</button>` |

Plus `Playground` (all controls) and `Passthrough` (Step 6). The four colour examples already cover the colour axis and the three style stories cover the style axis, so no extra `Colors`/`Variants` axis stories are needed; `Directions` **is** added, because the page only ever shows `vertical` paired with the responsive `sm:` class and never plain `horizontal`.

Each colour story keeps the doc page's own icon (a different SVG path per colour) — copy them from the page, don't reuse one icon for all four.

The page reuses the same four copy strings everywhere, so hoist them:

```ts
import Alert from './Alert.astro';

const COPY = {
  info: '12 unread messages. Tap to see.',
  success: 'Your purchase has been confirmed!',
  warning: 'Warning: Invalid email address!',
  error: 'Error! Task failed successfully.',
} as const;

// Icon markup copied from the doc page. If these vanish from the canvas,
// read plan §3d.1 before assuming the component is broken.
const INFO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current text-info h-6 w-6 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

export default {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    color: { control: 'select', options: [undefined, 'info', 'success', 'warning', 'error'] },
    variant: { control: 'select', options: [undefined, 'outline', 'dash', 'soft'] },
    direction: { control: 'select', options: [undefined, 'vertical', 'horizontal'] },
    role: { control: 'text' },
  },
};

export const Playground = {
  args: {
    color: 'info',
    slots: { default: `${INFO_ICON}<span>${COPY.info}</span>` },
  },
};

export const Default = {
  args: { slots: { default: `${INFO_ICON}<span>${COPY.info}</span>` } },
};

// Regression guard: native attributes survive, caller `class` merges,
// the `role` default is overridable (§3b).
export const Passthrough = {
  args: {
    id: 'alert-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    role: 'status',
    slots: { default: '<span>Passthrough</span>' },
  },
};
```

The soft/outline/dash stories each show four alerts at once; compose multiples the way the framework's docs recommend (a decorator or a wrapping story) — check that before inventing a helper.

## 6. Steps

- [x] **Step 1: done.** Both §3d unknowns were answered while building Button and hold here: SVG survives, and one slot value renders as unwrapped siblings.
- [x] **Step 2: skipped as planned.** `AlertColor` stays local — deliberately **not** added to `variants.ts`, per §3a.
- [x] **Step 3: done.** Component written per §4, with `role` destructured to a default rather than hardcoded beside the spread. Gate walked.

  Two §4 probe lines were unachievable, both for the reason `plans/README.md` §5c now records: `<Alert style="soft">` cannot error, because `style` is a native attribute that accepts any string — which is precisely *why* the style axis is named `variant` (§1). `<Alert color="primary">` **does** error, because this component declares `color` and narrows it to four values, which is §3a working exactly as intended.
- [x] **Step 4: done.** `Alert.stories.ts`, 14 stories per §5.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: the four colours read distinctly; the three styles differ; `WithButtons` reflows from stacked to inline at the `sm` breakpoint — **resize the canvas**, and if it does not reflow check the built CSS for `sm:alert-horizontal` before touching the component (§3c); `WrappedChildren`'s first alert collapses to one centred column while the second lays out properly (§2).
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<div class="alert alert-warning alert-soft mine w-full" role="alert" id="alert-1" data-test="yes" style="letter-spacing:2px">`. Across the stories, 27 alerts carry a role and 2 of them carry the overridden `role="status"`. Full output in §8.
- [x] **Step 7: done — the `Alert` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 10 daisyUI classes from §1 are reachable: `alert` always, 4 colours via `color`, 3 styles via `variant`, 2 directions via `direction`.
- [x] No invented axis — no `size`, and `color` accepts only the four values that have CSS (§3a).
- [x] `Props` extends `HTMLAttributes<'div'>`; non-variant native attributes work without explicit declaration.
- [x] Caller `class` merges through `class:list`.
- [x] `role="alert"` present by default and overridable — checked in rendered HTML (§3b).
- [x] Slot content renders as direct children of `div.alert`, unwrapped (§2) — checked in rendered HTML.
- [x] `Playground` exposes every prop as a control.
- [x] One story per doc-page example, reproducing that example's markup and copy.
- [x] `Directions` covers the axis the doc examples only show responsively.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31), SVG elided. `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Info           → <div class="alert alert-info w-full" role="alert">SVG<span>New software update available.</span></div>
WithButtons    → <div class="alert alert-vertical w-full sm:alert-horizontal" role="alert">SVG
                   <span>we use cookies for no reason.</span>
                   <div><button class="btn btn-sm">Deny</button>
                        <button class="btn btn-primary btn-sm">Accept</button></div></div>
WrappedChildren→ <div class="alert alert-info w-full" role="alert"><div>SVG<span>…</span></div></div>
                   … then the same alert with the children passed directly
PoliteRole     → role="alert" then role="status"
Passthrough    → <div class="alert alert-warning alert-soft mine w-full" role="alert" id="alert-1"
                   data-test="yes" style="letter-spacing:2px">…
```

What this settles:

- **§2's rule is visible rather than described**: `WrappedChildren` renders both shapes side by side, so the collapse to a single grid column can be seen instead of taken on trust. The layout is a function of the direct child count, and every other story passes icon, text and actions as separate children.
- **`role` is defaulted, not hardcoded**: 27 alerts carry one, and the two `PoliteRole` overrides come through as `role="status"` — so the destructure-with-default mechanism works and the caller keeps control (§3b).
- The `WithButtons` action row is deliberately one wrapper div holding two buttons: that div is the alert's third child, which is what the grid lays out.
- All 10 classes have rules in the built stylesheet.

Not settled here: §3c's responsive reflow, which needs the canvas resized rather than screenshotted.
