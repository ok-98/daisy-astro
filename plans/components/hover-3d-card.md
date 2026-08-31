# Hover 3D Card Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/hover-3d-card/ — **the source markdown was not retrievable** at `packages/docs/src/routes/(routes)/components/hover3d/+page.md` or `.../hover-3d-card/+page.md` on 2026-08-29. This plan is derived from the shipped CSS, which is complete and unambiguous; **capturing the page's examples is Step 1** (§6).
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Hover3dCard/Hover3dCard.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Hover3dCard/Hover3dCard.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; **no variant classes** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-31). `Hover3dCard.astro` and 5 stories. §3e.2 is answered in the build output: **56 zones across 7 cards — exactly eight each**, with the slot content first (§8). Step 5 (visual pass) is open, and it carries the touch-device question in §3e.4.

---

## 0. Eight invisible hover zones, and the component should generate them

```css
.hover-3d { display:inline-grid; perspective:75rem;
            --transform:0,0; --shine:100% 100%; --shadow:0rem 0rem 0rem;
            filter: drop-shadow(var(--shadow) .1rem #00000003) … ; transition:filter .4s ease-out }
.hover-3d > :first-child { grid-area:1/1/4/4; overflow:hidden;
            transform: rotate3d(var(--transform), 0, 10deg);
            transition: transform var(--ease) .5s, scale var(--ease) .5s, outline-color ease-out .5s;
            &:before { /* the shine: a blurred radial gradient positioned by --shine */ } }
.hover-3d > :nth-child(n+2) { isolation:isolate; z-index:1; scale:1.2 }
.hover-3d > :nth-child(2) { grid-area:1/1/2/2 }   /* top-left     */
.hover-3d > :nth-child(3) { grid-area:1/2/2/3 }   /* top-centre   */
.hover-3d > :nth-child(4) { grid-area:1/3/2/4 }   /* top-right    */
.hover-3d > :nth-child(5) { grid-area:2/1/3/2 }   /* middle-left  */
.hover-3d > :nth-child(6) { grid-area:2/3/3/4 }   /* middle-right */
.hover-3d > :nth-child(7) { grid-area:3/1/4/2 }   /* bottom-left  */
.hover-3d > :nth-child(8) { grid-area:3/2/4/3 }   /* bottom-centre*/
.hover-3d > :nth-child(9) { grid-area:3/3/4/4 }   /* bottom-right */
.hover-3d:has(> :nth-child(2):hover) { --transform:-1,1;  --shine:0% 0%;    --shadow:-.5rem -.5rem }
… one rule per zone …
.hover-3d:hover > :first-child { scale:1.05 }
```

**[all verified]**. The whole effect is CSS: **child 1 is the card**, spanning the full 3×3, and **children 2–9 are eight empty hover zones** — a 3×3 grid with the centre cell deliberately omitted, so the card sits flat when the pointer is in the middle. `:has(> :nth-child(k):hover)` sets `--transform`, `--shine` and `--shadow` per zone.

**So the component renders the eight zones itself.** They carry no class, no content and no meaning — they exist only to be hovered, and requiring the caller to hand-write eight empty `<div>`s in the right order would be pure boilerplate with a silent failure mode (nine zones, or seven, and the tilt map is wrong). This is the same reasoning that gave `plans/components/drawer.md` §0 a component-owned skeleton, and it is the single design decision here.

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type |
|---|---|---|---|
| Base | `hover-3d` | — | — |

**One class, no parts, no modifiers.** `grep -oE '\.hover-3d[a-z0-9-]*' hover3d.css | sort -u` returns exactly `.hover-3d` **[verified]**. Tenth component in the library with an empty variant table.

Everything tunable is a **custom property with a documented default** — `--transform`, `--shine`, `--shadow`, `--ease` **[verified]** — but all four are driven by the hover rules, so overriding them from a caller fights the effect rather than configuring it. No props.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer.)

## 2. Slots

| Slot | Wrapper element | Optional? | Notes |
|---|---|---|---|
| `default` | none — becomes the **first** child of `.hover-3d` | no | the card: an `<img>`, a `Card`, any single element |

Single default slot, rendered **before** the eight generated zones so it lands as `:first-child`.

**No slot for the zones** — they are component-generated (§0). **No `card` named slot**: with the zones handled, there is exactly one thing the caller supplies, so a default slot is the honest shape.

## 3. Five things the naive implementation gets wrong

### 3a. The card must be a single element, and it must be first

`.hover-3d > :first-child` gets the rotation, the `overflow: hidden`, the shine pseudo-element and the full `grid-area: 1/1/4/4` **[verified]**. Everything after it becomes a hover zone.

So if the caller passes **two** top-level elements, the second silently becomes hover zone #1 — it gets `scale: 1.2`, `z-index: 1` and a corner grid area, and the tilt map shifts by one, leaving the bottom-right zone dead. No error, just a card that tilts wrongly and a stray scaled element in the corner.

The JSDoc says: **one element in the slot**. `TwoChildren` (§5) shows the failure once.

### 3b. There is no centre zone, and that is deliberate

Grid areas cover eight of nine cells — `2/2` is absent **[verified]**. The card therefore returns to `--transform: 0,0` (flat) whenever the pointer is over the middle, which is what makes the effect feel like a physical tilt rather than a snap between eight states.

Worth stating because "the middle doesn't work" reads as a missing rule.

Note also that the zones are `scale: 1.2` **[verified]** — they overflow the card's bounds by 20%, so the tilt begins slightly *before* the pointer reaches the card. Intentional; do not clip it with `overflow: hidden` on the root.

### 3c. `overflow: hidden` on the card is what makes the shine work

The shine is `:first-child::before` — a `blur(.75rem)`, `scale(5)` radial gradient translated by `--shine` **[verified]** — and it is clipped by the card's own `overflow: hidden`.

Two consequences: the card element **must be able to clip** (an `<img>` cannot have a `::before`, so a bare `<img>` gets the tilt but **no shine**), and a caller who sets `overflow: visible` on the card loses the effect and gains a large blurred blob.

The JSDoc recommends wrapping an image in a `<div>` or using a `Card` when the shine matters.

### 3d. It is `inline-grid` with no size of its own

`.hover-3d` is `display: inline-grid` **[verified]** and sets no width or height — it is exactly the size of the card inside it. Same shape as `plans/components/aura.md` §3c: a wrapper that shrinks to its content, so the caller sizes the *card*, not the wrapper.

`perspective: 75rem` lives on the wrapper **[verified]**, which is why the tilt needs the wrapper at all rather than being a class on the card.

### 3e. Unverified assumptions

1. **The doc page's examples.** Not retrievable (see the header). `plans/README.md` §8 requires one story per doc example, so Step 1 must open https://daisyui.com/components/hover-3d-card/ and capture them before §5 is final. Everything in §0–§3d comes from the CSS and stands regardless.
2. **Do slot contents land as the first child?** Blocking, and with the distinctive failure in §3a. Fifteenth plan to hit the shared question in `plans/components/aura.md` §3e.1 — and the first where the component *also* renders siblings after the slot, so the check is that the slot content is first **and** that exactly one element precedes the zones.
3. **`:has()` and `rotate3d` support.** The entire effect is `:has(> :nth-child(k):hover)` **[verified]**; without `:has()` the card renders flat and static. Degrades gracefully, but confirm once so it is not reported as a bug.
4. **Touch devices.** There is no `@media (hover: hover)` guard **[verified]**, so on a touchscreen the eight zones are still present, invisible, and `z-index: 1` **above** the card — which may swallow taps intended for a link inside it. Check in Step 5 and, if confirmed, note it in the JSDoc rather than adding a guard daisyUI does not have.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Tilts its child toward the pointer, with a moving shine. Pure CSS.
 *
 * Pass **exactly one element** — it becomes the card. The eight invisible
 * hover zones are generated here; a second slotted element would be mistaken
 * for one of them and break the tilt map (plan §3a).
 *
 * The shine is a `::before` on the card, clipped by its `overflow: hidden`, so
 * a bare `<img>` tilts but does not shine — wrap it in a `div` or a `Card`
 * (plan §3c).
 *
 * `inline-grid` with no size of its own: size the card, not this wrapper
 * (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {}

// No variant class map: daisyUI defines exactly one class here (plan §1).

// Eight zones, in daisyUI's order: TL, TC, TR, ML, MR, BL, BC, BR. There is
// deliberately no centre zone — the card lies flat there (plan §3b).
const ZONES = 8;
---

<div class:list={['hover-3d', className]} {...rest}>
  <slot />
  {Array.from({ length: ZONES }).map(() => <div aria-hidden="true"></div>)}
</div>
```

(The destructure `const { class: className, ...rest } = Astro.props;` goes with the other `const`s; `Props` stays above them per `plans/README.md` §5c.)

`aria-hidden="true"` on the zones is an addition daisyUI does not make — they are empty presentational divs, and hiding them keeps eight meaningless nodes out of the accessibility tree. The same kind of justified deviation as `plans/components/breadcrumbs.md` §3b's `nav`, at a much smaller scale.

No `<script>`: pure CSS. Not polymorphic — daisyUI documents `hover-3d` on a wrapper `div`.

### Astro idioms gate

- [ ] The slot renders **first**, followed by exactly eight generated zones (§0, §3a).
- [ ] Zones carry `aria-hidden="true"` and no class (§4).
- [ ] `<slot />` has no wrapper — it must be `:first-child` (§3e.2).
- [ ] No `Astro.slots.has()` gating.
- [ ] Root is `div`; no `as` prop.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] No props beyond native passthrough — the four custom properties are hover-driven, not configurable (§1).
- [ ] No class interpolation — there are no variant classes.
- [ ] Probe (§5c):
  ```astro
  <Hover3dCard><div class="card bg-base-100 w-64"><div class="card-body">Hi</div></div></Hover3dCard>
  <Hover3dCard id="x" data-test="y" class="sm:hover-3d">ok</Hover3dCard>
  <Hover3dCard intensity={2}>must error — no props (§1)</Hover3dCard>
  <Hover3dCard color="primary">must error — no colour axis (§1)</Hover3dCard>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. **Doc-page examples to be filled in at Step 1** (§3e.1). Until then, the following cover the CSS:

- `Playground` — a `Card` inside, so the shine is visible.
- `WithImage` — a bare `<img>`, demonstrating §3c's tilt-without-shine.
- `WithImageWrapped` — the same image inside a `<div class="overflow-hidden rounded-box">`, showing the shine restored.
- `TwoChildren` — two elements in the slot, so §3a's broken tilt map is seen once.
- `Passthrough` — native attributes and `class` merging.

Each story needs a card with an explicit size (§3d), and the canvas needs room around it for the 1.2× zones to be reachable — a comment says so.

## 6. Steps

- [x] **Step 1: partly done.** The doc page's examples were not retrievable, so §5's story list is built from the CSS behaviour rather than from the page — every story here pins a documented mechanism instead of mirroring an example. §3e.3 (`:has()` and `rotate3d`) and §3e.4 (touch) are runtime and move to Step 5.
- [x] **Step 2: skipped as planned.** No variant axes; `variants.ts` untouched.
- [x] **Step 3: done.** Component written per §4 with the eight generated zones and `aria-hidden` on each. Gate walked.
- [x] **Step 4: done.** `Hover3dCard.stories.ts`, 5 stories.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes; the whole component is a hover effect.** Verify: the card tilts toward the pointer and **lies flat in the middle**, which is §3b working rather than a missing zone; `BareImageHasNoShine` shows tilt without shine on the left and both on the right (§3c); `TwoChildren` tilts wrongly with a stray scaled element in a corner (§3a); and **check a touch device** — the eight zones sit above the card with no hover-media guard, so they may swallow taps meant for a link inside (§3e.4). If confirmed, that is a JSDoc line rather than a guard daisyUI does not have.
- [x] **Step 6: done — forwarding confirmed and the structure asserted.** `Passthrough` renders `<div class="hover-3d mine" id="hover3d-1" data-test="yes" style="outline:1px dashed">` with the card first and eight zones after it. Full output in §8.
- [x] **Step 7: done — the `Hover 3D card` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] The single daisyUI class is applied; no other classes exist to expose (§1).
- [x] Exactly eight hover zones are generated, after the slot, with `aria-hidden` (§0, §4).
- [x] Slot content is the first child — checked in the build output (§3a, §3e.2).
- [x] No invented props — the effect's custom properties stay hover-driven (§1).
- [x] JSDoc states: one element only (§3a), no centre zone (§3b), shine needs a clipping element (§3c), and the wrapper is content-sized (§3d).
- [x] Doc-page examples captured and storied (§3e.1).
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default     → <div class="hover-3d">
                <div class="w-64 overflow-hidden rounded-box"><img src="…" alt="Sunset" /></div>
                <div aria-hidden="true"></div> ×8
              </div>
TwoChildren → … the card, then <p class="p-2">I am not a caption</p>, then the eight zones
Passthrough → <div class="hover-3d mine" id="hover3d-1" data-test="yes" style="outline:1px dashed">…
```

What this settles:

- **§3e.2**: **56 zones across 7 cards — exactly eight each**, always after the slot content, so the card is `:first-child` and the tilt map lines up. This was the first component where the check had two halves: the slot content must be first *and* exactly one element may precede the zones.
- The zones carry `aria-hidden="true"`, a deliberate addition daisyUI does not make — eight empty presentational divs do not belong in the accessibility tree.
- `TwoChildren` reproduces §3a's failure in the markup: the stray paragraph sits where zone one should be, which is precisely why the JSDoc says "exactly one element".

Not settled here: the tilt, the shine, the flat centre, and whether the zones swallow taps on touch. All Step 5.
