# FAB / Speed Dial Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/fab/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Fab/Fab.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Fab/Fab.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals (§1b); **Fab uses no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/fab.css` and the doc page source. §3f lists what is **unverified**.

---

## 0. Focus-driven, fixed-position, and order-sensitive

```css
.fab { position:fixed; bottom:1rem; inset-inline-end:1rem; z-index:999;
       display:flex; flex-direction:column-reverse; align-items:flex-end; gap:.5rem;
       pointer-events:none; user-select:none }
.fab > *                       { pointer-events:auto; display:flex; align-items:center; gap:.5rem }
.fab > [tabindex]:first-child  { display:grid; position:relative; transition:opacity,visibility,rotate .2s }
.fab > :nth-child(n+2)         { visibility:hidden; opacity:0; scale:80% }
.fab:focus-within > :nth-child(n+2) { visibility:visible; opacity:1; scale:100% }
.fab:focus-within > [tabindex]:first-child { pointer-events:none }
.fab > :nth-child(3) { transition-delay:30ms }  /* 4→60ms, 5→90ms, 6→120ms */
```

**[all verified]**. Three things follow, and they are the whole plan:

- **It opens on `:focus-within`, not on click** — there is no JavaScript in `fab.css` and none is added here (`plans/README.md` §6). The trigger must therefore be focusable, and it must be `[tabindex]:first-child` (§3a).
- **Child order is load-bearing.** Actions are `:nth-child(n+2)`, and the stagger delays and flower angles are keyed to `:nth-child(3)`…`(6)` **[verified]**.
- **`position: fixed`** — the same demo-containment problem as `plans/components/dock.md` §0, and the doc page solves it the same way (`class="fab absolute z-1"` in its rendered examples, plain `fab` in the copy-paste HTML). Every story needs it (§5).

## 1. Variant audit

**4 classes: 1 component + 2 part + 1 modifier**, matching the doc page's frontmatter. `grep -oE '\.fab[a-z0-9-]*' fab.css | sort -u` returns exactly `.fab`, `.fab-close`, `.fab-main-action`, `.fab-flower` **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `fab` | — | — | Always applied. |
| Modifier | `fab-flower` | `flower` | `boolean` | Quarter-circle arrangement. **Caps at 4 action buttons** — §3d. |
| Part | `fab-close` | — | — | Caller-applied class — §2. |
| Part | `fab-main-action` | — | — | Caller-applied class, **mutually exclusive with `fab-close`** — §3c. |

**No colour or size axis** — none exists **[verified]**. Every button in every example is styled with Button's own classes (`btn btn-lg btn-circle btn-primary`), which is this library's `Button` component.

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `trigger` | `div[tabindex="0"][role="button"]` | no | `<div tabindex="0" role="button" class="btn btn-lg btn-circle btn-primary">F</div>` |
| `default` | none — direct children of `.fab` | yes (§3e) | the action buttons, optionally wrapped in a label `<div>` |

**`fab-close` and `fab-main-action` are caller-applied classes, not sub-components.** They go on the caller's own `<div>` or `<button>` — the same treatment `plans/components/dropdown.md` §2 gave `dropdown-content`. A one-class wrapper with no props would add an import and remove nothing; the JSDoc names both classes and every relevant story shows them.

**No `actions` array prop.** The doc page's examples put a text label, a Tooltip wrapper, or a bare button in each slot position — an array API would block all three.

## 3. Six things the naive implementation gets wrong

### 3a. The trigger is a `<div tabindex="0" role="button">`, deliberately

daisyUI's info box is the same one on the Dropdown page: a WebKit bug open since 2008 prevents `<button>` from being focused on click in Safari, so a focus-driven FAB with a real `<button>` trigger would never open there. `role="button"` restores the semantics.

The CSS agrees — `.fab > [tabindex]:first-child` **[verified]** selects on the *attribute*, so a `<button>` (focusable without `tabindex`) would not match the rule at all and would lose its rotate-out animation even in browsers where focus works.

The component renders the trigger, so this cannot be got wrong. Do not "fix" it to a `<button>`. Cross-referenced from `plans/components/dropdown.md` §3a.

Note the one doc example that *does* use a plain `<button>`: "A single FAB", which has no speed-dial children and therefore never needs to open.

### 3b. It opens on focus and closes on blur — with no close-on-click

`:focus-within` is the only trigger **[verified]**. Consequences the JSDoc must state:

- **Clicking an action button closes the FAB** as focus leaves — usually what you want, and the reason `fab-close` exists as a *visual* placeholder rather than a real control (daisyUI's own comment: *"close button should not be focusable so it can close the FAB when clicked"*).
- **Anything that steals focus closes it**, including a `<dialog>` opened from inside — the same caveat the Dropdown page carries.
- `.fab:focus-within > [tabindex]:first-child { pointer-events: none }` **[verified]** means the trigger stops receiving clicks once open, so a second click lands on whatever is underneath (usually `fab-close` or `fab-main-action`, which are absolutely positioned over it — §3c).

No `<script>`, no `open` prop: there is no `fab-open` class to drive one **[verified]**.

### 3c. `fab-close` and `fab-main-action` replace the trigger, and only one may exist

```css
.fab .fab-close, .fab .fab-main-action { position:absolute; inset-inline-end:0; bottom:0 }
:is(.fab:focus-within:has(.fab-close), .fab:focus-within:has(.fab-main-action)) > [tabindex] { opacity:0; rotate:90deg }
```

**[verified]**. Both are absolutely positioned **over** the trigger, and their presence is what makes the trigger fade and rotate away when open. daisyUI's frontmatter is explicit: *"Either use fab-close or fab-main-action, not both."*

They are also exempt from the 80% scale-in that other actions get **[verified]**, because they are not appearing — they are standing in for the trigger.

Not modelled as a prop: they live on caller markup (§2), so the exclusivity is documented rather than typed. A `mainAction`/`close` named slot pair was considered and rejected — it would fix the order for the caller but take away the label-wrapper freedom the doc examples use.

### 3d. `fab-flower` silently drops the 7th child

```css
.fab-flower > :nth-child(n+7) { display: none }
.fab-flower:has(> :nth-child(3)) { --position: 140%; & > :nth-child(3) { --degree: 135deg } }
.fab-flower:has(> :nth-child(4)) { … 165deg / 105deg }
.fab-flower:has(> :nth-child(5)) { … 180deg / 135deg / 90deg }
.fab-flower:has(> :nth-child(6)) { --position: 220%; … }
```

**[verified]** — the arc angles are recomputed for each total child count, and **anything past the sixth child is `display: none`**. With the trigger plus an optional `fab-main-action`, that is daisyUI's documented ceiling of four action buttons.

A seventh button therefore vanishes with no error. The JSDoc states the cap, and `FlowerOverflow` (§5) shows it once.

`fab-flower` also switches the container from flex to `display: grid` with every child in `grid-area: 1/1` **[verified]**, positioned by `translateX(cos(--degree) * --position)`. RTL is handled by a mirrored `--flip-degree` **[verified]** — no direction logic needed here.

### 3e. The default slot is optional, and that is a documented example

"A single FAB" is just `<div class="fab"><button class="btn btn-lg btn-circle">F</button></div>` — no speed dial at all. So the action slot is optional and gets **no `Astro.slots.has()` gating**, because there is no wrapper to leave empty; an unused slot simply contributes no children.

Worth noting for that case: with no `:nth-child(n+2)`, nothing depends on focus, and a plain `<button>` trigger is fine (§3a). The component still renders the `[tabindex]` div, which is harmless.

### 3f. Unverified assumptions

1. **Do slotted actions land as direct children of `.fab`?** Blocking, and unusually consequential: every rule here is `:nth-child`-based, so a wrapper would collapse all actions into child #2 — one hidden element instead of a staggered stack, and in flower mode a single button at 135°. Tenth plan to hit this shared question; see `plans/components/aura.md` §3e.1 and the list it carries.
2. **`cos()` / `sin()` support.** The flower arc is pure CSS trigonometry **[verified]**. Without it, `--position`/`--degree` fail and all buttons stack at the origin. One check.
3. **`:focus-within` inside the Storybook canvas iframe** — shared with `plans/components/dropdown.md` §3f.3.
4. **Slot sanitization vs inline `<svg>`** — two doc examples are icon-only. Shared with `plans/components/alert.md` §3d.1.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * Floating action button with an optional speed dial. Opens on **focus**, not
 * click — there is no JavaScript and no `open` prop (plan §3b).
 *
 * `position: fixed` is built in; add `class="absolute"` to demo one inside a
 * box, as daisyUI's own examples do (plan §0).
 *
 * Action buttons go in the default slot as direct children. Add
 * `class="fab-main-action"` **or** `class="fab-close"` (never both) to one of
 * them to have it replace the trigger while open (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {
  /**
   * Quarter-circle arrangement instead of a vertical stack.
   * **Caps at 4 action buttons** — a 7th child is `display:none` (plan §3d).
   */
  flower?: boolean;
}

// Booleans as object keys are literals in source, so they satisfy §1b as
// written. There is no multi-value axis here, so no Record map is needed.

const { flower = false, class: className, ...rest } = Astro.props;
---

<div class:list={['fab', { 'fab-flower': flower }, className]} {...rest}>
  <!--
    Must be `[tabindex]:first-child`: daisyUI selects on the attribute, and a
    real <button> cannot be focused on click in Safari (plan §3a).
  -->
  <div tabindex="0" role="button"><slot name="trigger" /></div>
  <slot />
</div>
```

No `<script>` (§3b). Not polymorphic: daisyUI documents `fab` on a wrapper `div`.

### Astro idioms gate

- [ ] Trigger is `div[tabindex="0"][role="button"]` and is rendered **first** (§0, §3a).
- [ ] Action slot is rendered bare — no wrapper, or the `:nth-child` rules collapse (§3f.1).
- [ ] Default slot is optional with no gating (§3e).
- [ ] No `<script>` and no `open` prop (§3b).
- [ ] `...rest` spread onto the root.
- [ ] No `as` prop; no `actions` array prop (§2).
- [ ] `fab-close` / `fab-main-action` documented as caller classes, not props (§2, §3c).
- [ ] No class interpolation — `fab-flower` is an object key (§1b).
- [ ] Probe (§5c):
  ```astro
  <Fab class="absolute"><Fragment slot="trigger">F</Fragment><button class="btn btn-circle">A</button></Fab>
  <Fab flower id="x" data-test="y">ok</Fab>
  <Fab open>must error — opens on focus, no open prop (§3b)</Fab>
  <Fab color="primary">must error — no colour axis (§1)</Fab>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. **Every story passes `class="absolute z-1"` inside an `h-54` wrapper**, exactly as the doc page's rendered demos do — `.fab` is `position: fixed`, so otherwise every story stacks in the corner of the canvas (§0). A comment at the top says so.

Doc-page examples in page order (`plans/README.md` §8): `Vertical`, `WithSvgIcons`, `WithLabels`, `RectangleButtons`, `WithCloseButton`, `WithMainAction`, `SingleFab`, `Flower`, `FlowerWithoutMainAction`, `FlowerWithSvgIcons`, `FlowerWithTooltip`.

Plus `Playground` and `Passthrough`. Two beyond the doc page:

- **`FlowerOverflow`** — five action buttons plus a main action, so the seventh child disappears; makes §3d's cap visible instead of a claim.
- **`ClosesOnBlur`** — a comment plus two FABs side by side; tabbing between them shows the first closing, which is §3b's behaviour and the thing a reviewer is most likely to report as a bug.

## 6. Steps

- [ ] **Step 1:** Resolve §3f.1 (direct children) — blocking, and worse here than usual because every rule is `:nth-child`.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate.
- [ ] **Step 4:** Replace `Fab.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: focusing the trigger fans the actions out with a visible **stagger**; `WithCloseButton` and `WithMainAction` rotate the trigger away and put their own button in its place; `Flower` arcs into a quarter circle; `FlowerOverflow` shows only six children; `SingleFab` needs no focus; `ClosesOnBlur` behaves as documented; RTL mirrors the arc with no code change.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="fab[^"]*"[^>]*><div tabindex="0" role="button">' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `FAB / Speed Dial` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 4 daisyUI classes reachable; the two part classes documented as caller-applied (§2).
- [ ] Trigger renders as `[tabindex]:first-child` with `role="button"`, never a `<button>` (§3a).
- [ ] Actions are direct children, in order, with the stagger intact (§0, §3f.1).
- [ ] No `<script>`, no `open` prop — focus is the only mechanism (§3b).
- [ ] JSDoc states: fixed positioning and the `absolute` demo escape (§0), focus-to-open and close-on-blur (§3b), `fab-close` XOR `fab-main-action` (§3c), and the four-action flower cap (§3d).
- [ ] No invented axis — no colour, no size, no `actions` prop.
- [ ] One story per doc-page example, plus `FlowerOverflow` and `ClosesOnBlur`; all contained with `absolute` (§5).
- [ ] Every box in §4's gate ticked.
