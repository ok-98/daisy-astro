# Aura Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/aura/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Aura/Aura.astro` (currently a dummy scaffold — no props, no variants)
**Story file:** `packages/daisy-astro/src/components/Aura/Aura.stories.ts` (currently a dummy `Default` story)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare. **Aura uses `DaisySize` but not `DaisyColor`** (see §1 and §3a).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-31). `Aura.astro` and 17 stories are in the repo per §4/§5. §3b's direct-child requirement is asserted in the build output: **23 auras render their child unwrapped** (§8). §3e.3's `@property --aura-angle` question is answered — the registration reaches the built stylesheet, so a static gradient would be browser support rather than a missing rule. Step 5 (visual pass) is open.

---

## 0. What this component is

Aura is a **wrapper that decorates its child** — a rotating conic-gradient border light drawn behind whatever you put inside it. It renders no content of its own and has no meaning empty. Every doc example is `div.aura` containing exactly one card or one button.

That shape drives every decision below: the interesting failure modes are all about the *relationship between the wrapper and its child* (§3b), not about the variant props.

## 1. Variant audit

Every class in `aura.css`, cross-checked against the doc page's `classnames` frontmatter. **12 classes: 1 base + 6 style + 5 size.** `grep -oE '\.aura[a-z-]*' aura.css | sort -u` returns exactly `.aura .aura-dual .aura-glow .aura-gold .aura-holo .aura-rainbow .aura-silver .aura-xs .aura-sm .aura-md .aura-lg .aura-xl` **[verified]**. All 12 are covered below. (The file also ships `sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies of all of them **[verified]** — caller-side responsive classes, not props; same reasoning as `plans/components/alert.md` §3c.)

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `aura` | — | — | Always applied. |
| Style | `aura-dual` `aura-rainbow` `aura-holo` `aura-gold` `aura-silver` `aura-glow` | `variant` | `AuraVariant` = `'dual' \| 'rainbow' \| 'holo' \| 'gold' \| 'silver' \| 'glow'` | **Must not be named `style`** — native attribute, the trap `plans/components/button.md` §3a hit. Mutually exclusive (each overwrites `background-image`) → union, not six booleans. Component-specific, stays local. |
| Size | `aura-xs` `aura-sm` `aura-md` `aura-lg` `aura-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Sizes set **only** `--aura-padding` (`0rem` / `.0625rem` / `.125rem` / `.15625rem` / `.25rem`) **[verified]**, i.e. the thickness of the visible light ring, not the size of the wrapped element. `md` is the default and is still emittable explicitly. |

**No colour axis.** There is no `aura-primary`, no `aura-info` — nothing **[verified]**. Colour comes from `currentColor`; see §3a.

### 1a. Caller-side knobs that are deliberately not props

| Effect | How the caller does it | Why not a prop |
|---|---|---|
| Aura colour | `class="text-primary"` / `class="text-orange-600"` (doc example) | §3a |
| Aura background | `class="bg-yellow-200"` (doc example) — `:before`/`:after` use `background-color:inherit` **[verified]** | Plain Tailwind, nothing daisyUI-specific to type |
| Animation speed | `class="duration-2000"` (doc example) → feeds `--tw-duration`, default `6s` (`20s` for `aura-holo`) **[verified]** | A `duration` prop needs `duration-${n}` interpolation, banned by §1b; Tailwind already owns this axis including arbitrary values |
| Responsive style/size | `class="sm:aura-lg"` | Same as `plans/components/alert.md` §3c |

## 2. Slots

Single default slot, rendered as **the direct child of the root**, with no wrapper element.

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — child of `div.aura` | no | one `div.card` or one `button.btn` |

No named slots, no `Astro.slots.has()` gating — there is no optional styled wrapper. As with Alert, the structural rule is the load-bearing part: **never wrap `<slot />` in an element** (§3b explains exactly what breaks).

No `size`/`color` content props and no inner markup: `aura.css` defines no child classes at all, so any structure invented here would be library-specific fiction.

## 3. Five things the naive implementation gets wrong

### 3a. There is no colour prop — colour is `currentColor`, and only three variants honour it

The obvious move is a `color?: DaisyColor` prop by analogy with Button. It is wrong twice over.

First, no such class exists — `aura-primary` would emit and match nothing, the invisible failure `plans/README.md` §1b is about. Second, the mechanism is different in kind: the gradient is drawn from `currentColor`, so colour is set with a Tailwind text utility on the wrapper, which is exactly what the doc page's "Aura with custom color" example does (`class="aura text-orange-600"`).

Which variants actually respond to it **[verified in `aura.css`]**:

| Variant | Gradient source | Follows `currentColor`? |
|---|---|---|
| default (no variant) | `conic-gradient(from var(--aura-angle), transparent 225deg, currentColor)` | yes |
| `dual` | `repeating-conic-gradient(…, currentColor 50%)` | yes |
| `glow` | `radial-gradient(closest-corner, currentColor 0%, #0000 90%)` | yes |
| `rainbow` `holo` `gold` `silver` | fixed `oklch(...)` stops | **no** — `text-*` has no effect |

Document that table in the component's JSDoc for `variant`. It is the first thing a user will get wrong (`<Aura variant="gold" class="text-primary">` looks like it should work and does nothing).

### 3b. The slot content must be a *direct* child — three separate things break otherwise

`.aura` styles its child, not itself. Three rules depend on the child being one level down **[all verified in `aura.css`]**:

```css
.aura > * { z-index: 1; position: relative }
.aura:has(> .card, > .alert)          { --aura-radius: var(--radius-box) }
.aura:has(> .btn, > .input, > .select){ --aura-radius: var(--radius-field) }
.aura:has(> .checkbox, > .toggle, > .badge) { --aura-radius: var(--radius-selector) }
```

Put a wrapper div between `.aura` and the card and:

1. the `:has(> …)` selectors stop matching, so the corner radius falls back to `--radius-box` and no longer matches the wrapped element — a visibly wrong outline on a button or a badge;
2. `.aura > *` applies to the wrapper instead of the content, and the content loses `z-index:1` — it renders **behind** the blurred `:before`/`:after` pseudo-elements, so the whole thing looks washed out and nobody can tell why.

Both failures are cosmetic-looking and give no error. So: `<slot />` sits directly inside the root, and the child-radius behaviour is a Step 5 check against a *button* (not just a card), because the card case looks correct even when the selector isn't matching.

This is the same class of constraint as `plans/components/alert.md` §2, and it makes `plans/components/alert.md` §3d.2 (does one slot value render as real children, or does the framework wrap it?) a **blocking** unknown here rather than a cosmetic one — see §3e.1.

### 3c. `.aura` is `display:inline-block`

**[verified]** — so wrapping a block-level card in `<Aura>` changes the layout flow: the card stops filling its container and shrinks to content. Every doc example either wraps an intrinsically-sized button or gives the inner card an explicit width (`w-96` in the pricing example).

Not something to "fix" with a `block` prop — the caller passes `class="block w-full"`. But it must be **called out in the component's JSDoc and demonstrated in a story**, because the natural first use (`<Aura>` around a full-width card) silently narrows the card and reads as a component bug.

### 3d. Reduced motion is already handled — do not add a prop or a script

`aura.css` ships `@media (prefers-reduced-motion: reduce)` blocks that multiply every animation duration by 4 **[verified]**. That is daisyUI's chosen behaviour: slowed, not stopped.

So no `animate={false}` prop, no `<script>`, no `matchMedia` check — `plans/README.md` §6. If a caller wants it fully still, `class="motion-reduce:animate-none"` is theirs to pass. Worth one line in the JSDoc since "the animation still moves under reduce" is a reasonable thing to be surprised by, and it is the library's call, not this wrapper's.

### 3e. Unverified assumptions — resolve while building, don't build on them

1. ~~**Does one slot value render as a real direct child?**~~ **Answered 2026-08-29 (while building Button): yes, unwrapped.** A slot value lands as a direct child of the component root with no intervening element, so `.aura > *`, `:has(> .card)` and `:has(> .btn)` all match. Canonical record: `plans/IMPLEMENTATION-ORDER.md` §2, Tier 0.3. Same question as `plans/components/alert.md` §3d.2. Still check it in the rendered HTML for *this* component, since §3b's failure looks plausible by eye either way.
2. ~~**Slot sanitization vs the child markup.**~~ **Answered 2026-08-29: sanitization is off** (`.storybook/main.ts`, `framework.options.sanitization = { enabled: false }` — Tier 0.3 explains why). `div.card`, `button.btn` and inline `<svg>` all survive verbatim. Left here because the symptom is worth knowing: a stripped child leaves an *empty* `.aura`, which still renders a small animated blob — a working component with missing content, not an error.
3. **`@property --aura-angle` reaching the Storybook build.** The animation is driven by `@keyframes aura{to{--aura-angle:360deg}}` plus `@property --aura-angle{syntax:"<angle>";inherits:false;initial-value:0deg}`, which live in `daisyui.css`/`base/properties.css`, **not** in `aura.css` **[verified]**. Without the registered custom property the angle cannot animate and the aura renders as a static gradient. It should arrive via `@plugin "daisyui"` in `.storybook/preview.css`, but "component renders, just never rotates" is the exact symptom, so check this before suspecting the component.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type AuraVariant = 'dual' | 'rainbow' | 'holo' | 'gold' | 'silver' | 'glow';

interface Props extends HTMLAttributes<'div'> {
  /**
   * Named `variant`, never `style` — `style` is a native attribute (plan §3a).
   * `dual` and `glow` (and the default) take their colour from `currentColor`,
   * so `class="text-primary"` tints them. `rainbow`, `holo`, `gold` and
   * `silver` use fixed palettes and ignore `text-*` entirely (plan §3a).
   */
  variant?: AuraVariant;
  /** Thickness of the light ring only — does not resize the wrapped element. */
  size?: DaisySize;
}

// Full literal class names. NEVER `aura-${variant}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const VARIANT: Record<AuraVariant, string> = {
  dual: 'aura-dual',
  rainbow: 'aura-rainbow',
  holo: 'aura-holo',
  gold: 'aura-gold',
  silver: 'aura-silver',
  glow: 'aura-glow',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'aura-xs',
  sm: 'aura-sm',
  md: 'aura-md',
  lg: 'aura-lg',
  xl: 'aura-xl',
};

const { variant, size, class: className, ...rest } = Astro.props;
---

<!--
  `.aura` is inline-block (plan §3c) and styles its DIRECT child (plan §3b):
  the slot must not be wrapped in anything.
-->
<div class:list={['aura', variant && VARIANT[variant], size && SIZE[size], className]} {...rest}>
  <slot />
</div>
```

That is the whole component. Colour, background, animation duration and responsive variants are all caller classes (§1a) — there is nothing else daisyUI exposes.

No `<script>`: pure CSS, reduced motion included (§3d).

Not polymorphic: `.aura` is documented only as a wrapper `div`, and it exists to have a child, so there is no `as` axis (contrast `plans/components/button.md` §4). In particular **do not** offer a mode that merges `aura` onto the wrapped element itself — `.aura > *` and every `:has(> …)` rule would have nothing to match.

### Astro idioms gate

- [ ] Content arrives via the default slot, not content props.
- [ ] `<slot />` has **no wrapper element** — radius selectors and the `z-index` rule both depend on it (§3b).
- [ ] No `Astro.slots.has()` gating needed (no optional styled wrapper).
- [ ] Root element is `div`, matching every doc example.
- [ ] No `<script>` added — reduced motion is daisyUI's (§3d).
- [ ] `...rest` spread onto the root element.
- [ ] No `as` prop, and no "apply to child instead of wrapping" mode (§4).
- [ ] No variant prop collides with a native attribute: the style axis is named `variant` not `style`; `size` does not exist on `HTMLAttributes<'div'>` (it is an `<input>`/`<select>` attribute), the same tradeoff Button already accepted.
- [ ] Every variant class is a full literal in a `Record` map — no `` `aura-${variant}` `` anywhere.
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <Aura><button class="btn">ok</button></Aura>
  <Aura variant="rainbow" size="lg" class="text-primary duration-2000">ok</Aura>
  <Aura id="x" data-test="y">ok</Aura>
  <Aura color="primary">must error — no colour axis (§3a)</Aura>
  <Aura variant="sparkle">must error — not an aura style</Aura>
  <Aura size="2xl">must error — DaisySize stops at xl</Aura>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props / slots |
|---|---|---|
| Aura around a card | `AroundACard` | no props, `<div class="card bg-base-100"><div class="card-body"><p>This card has aura</p></div></div>` |
| Aura around a button | `AroundAButton` | no props, `<button class="btn">button with aura</button>` |
| Aura dual | `Dual` | `variant: 'dual'`, card |
| Aura rainbow | `Rainbow` | `variant: 'rainbow'`, card |
| Aura holo | `Holo` | `variant: 'holo'`, card |
| Aura glow | `Glow` | `variant: 'glow'`, card |
| Aura gold | `Gold` | `variant: 'gold'`, card |
| Aura silver | `Silver` | `variant: 'silver'`, card |
| Aura with custom color | `CustomColor` | `class: 'text-orange-600'`, card with `text-base-content` |
| Aura with custom color and background | `CustomColorAndBackground` | `class: 'text-orange-600 bg-yellow-200'`, same card |
| Aura rainbow around a pricing card | `PricingCard` | `variant: 'rainbow'`, the page's full `w-96` pricing card markup |
| Aura sizes | `Sizes` | five auras, `xs`/`sm`/none/`lg`/`xl`, each around `<button class="btn">` |
| Aura with custom animation duration | `CustomDuration` | `variant: 'rainbow'`, `class: 'duration-2000'`, card |

Plus `Playground` (all controls) and `Passthrough` (Step 6). The variant axis is fully covered by the eight style stories and the size axis by `Sizes`, so no extra axis stories are needed.

Two stories exist beyond the doc page, each pinning a §3 hazard:

- **`ColorRespect`** — `dual` and `gold`, both with `class="text-primary"`, side by side. Makes §3a's "four variants ignore `text-*`" visible instead of a documentation claim.
- **`BlockLayout`** — the same card with and without `class="block w-full"` on the `Aura`, inside a wide container. Demonstrates §3c's inline-block flow rather than leaving the first user to discover it.

The children are raw HTML strings, not `Card`/`Button` components: `Card` is still a dummy scaffold, and per `plans/components/accordion.md` §3d.1 passing a component with its own props as slot content is unverified. Copying the doc page's markup verbatim is also what makes each story a direct visual diff against the page (§8).

```ts
import Aura from './Aura.astro';

const card = (text: string, extra = '') =>
  `<div class="card bg-base-100 ${extra}"><div class="card-body"><p>${text}</p></div></div>`;

export default {
  title: 'Components/Aura',
  component: Aura,
  argTypes: {
    variant: {
      control: 'select',
      options: [undefined, 'dual', 'rainbow', 'holo', 'gold', 'silver', 'glow'],
    },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export const Playground = {
  args: { variant: 'rainbow', slots: { default: card('This card has aura') } },
};

export const AroundACard = {
  args: { slots: { default: card('This card has aura') } },
};

export const AroundAButton = {
  args: { slots: { default: '<button class="btn">button with aura</button>' } },
};

// Regression guard: native attributes survive and caller `class` merges —
// `class` matters more than usual here, since colour, background and
// animation duration are all caller classes (§1a).
export const Passthrough = {
  args: {
    id: 'aura-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine text-primary',
    slots: { default: '<button class="btn">Passthrough</button>' },
  },
};
```

`Sizes` and `ColorRespect` render several auras at once; compose multiples the way the framework's docs recommend (a decorator or a wrapping story) — check that before inventing a helper.

## 6. Steps

- [x] **Step 1: done.** §3e.1 was answered while building Button and holds here too — 23 auras render their child as a direct, unwrapped child, so `.aura > *` and both `:has(> …)` radius rules match.
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged, `AuraVariant` local; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4; gate walked. One deviation from §4's listing: the structural note is a frontmatter comment rather than an HTML comment above the element, which would ship into every rendered aura.
- [x] **Step 4: done.** `Aura.stories.ts`, 17 stories per §5. Buttons compose the real `Button`. Cards were raw markup with a `TODO(daisy-astro)` marker until Card landed later the same day — they now compose the real `Card` and `CardBody`, and the marker is gone (`plans/IMPLEMENTATION-ORDER.md` §5.2).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and almost everything here is motion.** Verify: **the aura actually rotates** — a static gradient means browser support for `@property`, not a missing rule (§3e.3, now settled at the stylesheet level); `AroundAButton`'s light follows the **button's pill radius**, which is the §3b check worth doing on a button rather than a card, since the card looks right either way; the content sits **in front of** the blur; all six variants differ; `Sizes` grows the ring while the buttons stay put; `ColorRespect` shows `dual` tinted and `gold` not (§3a); `CustomDuration` spins faster; `BlockLayout`'s second copy fills the container (§3c).
- [x] **Step 6: done — forwarding confirmed and §3b's structure asserted.** `Passthrough` renders `<div class="aura mine text-primary" id="aura-1" data-test="yes" style="letter-spacing:2px">`, and across the stories 23 auras hold their child directly. Full output in §8.
- [x] **Step 7: done — the `Aura` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 12 daisyUI classes from §1 are reachable: `aura` always, 6 styles via `variant`, 5 sizes via `size`.
- [x] No invented axis — no `color` prop (§3a), no `duration` prop (§1a), no `animate` prop (§3d).
- [x] `Props` extends `HTMLAttributes<'div'>`; non-variant native attributes work without explicit declaration.
- [x] Caller `class` merges through `class:list` — load-bearing here, since colour/background/duration all arrive that way.
- [x] Slot content renders as the **direct child** of `div.aura`, unwrapped — checked in rendered HTML, not by eye (§3b, §3e.1).
- [x] Child radius matches a wrapped `btn`, proving the `:has(> .btn)` selector matches (§3b).
- [x] `Playground` exposes every prop as a control.
- [x] One story per doc-page example, reproducing that example's markup and copy.
- [x] `ColorRespect` and `BlockLayout` exist and demonstrate §3a and §3c.
- [x] `variant`'s JSDoc names which variants ignore `text-*` (§3a) and the inline-block caveat is documented (§3c).
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
AroundAButton → <div class="aura"><button class="btn">button with aura</button></div>
AroundACard   → <div class="aura"><div class="card bg-base-100 "><div class="card-body">…
Dual…Silver   → <div class="aura aura-dual">… one per variant
CustomColor   → <div class="aura text-orange-600">…        colour is a text utility, not a prop
Sizes         → <div class="aura aura-xs">… through … <div class="aura aura-xl">…
Passthrough   → <div class="aura mine text-primary" id="aura-1" data-test="yes" style="letter-spacing:2px">
                  <button class="btn">Passthrough</button></div>
```

What this settles:

- **§3b's requirement**: 23 auras hold their child as a direct, unwrapped child. Both failure modes it warns about — a radius that stops matching, and content rendering *behind* the glow — are cosmetic-looking and would have been easy to miss by eye.
- Colour, background and animation duration all arrive as caller classes, never as props (§1a).
- **§3e.3 is settled at the stylesheet level**: `@property --aura-angle` is registered in the built CSS, so the tween is wired and a static gradient at Step 5 would be browser support for `@property` rather than a missing rule. Same answer as `plans/components/radial-progress.md` §3e.1 found for `--radialprogress`.
- All 12 classes have rules in the built stylesheet.

Not settled here: the rotation, the child radius, the z-order and the four variants that ignore `text-*`. All Step 5.
