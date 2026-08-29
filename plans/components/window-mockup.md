# Window Mockup Component Plan

**daisyUI category:** Mockup
**daisyUI doc page:** https://daisyui.com/components/mockup-window/ (docs path is `mockup-window`; this repo's slug is `window-mockup`)
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/WindowMockup/WindowMockup.astro` (currently a dummy scaffold whose markup is already correct)
**Story file:** `packages/daisy-astro/src/components/WindowMockup/WindowMockup.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; **no variant classes** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/mockup.css` and the doc page source. §3d lists what is **unverified**.

---

## 0. One class, and it is Browser Mockup without the toolbar

`mockup-window` shares `mockup.css` with Browser, Code and Phone, and carries the same four-way naming divergence — written up once in `plans/components/browser-mockup.md` §0 and not repeated.

The complete rule set **[verified]**:

```css
.mockup-window { display:flex; flex-direction:column; position:relative;
                 padding-top:1.25rem; border-radius:var(--radius-box);
                 overflow:auto hidden }
.mockup-window:before { content:""; aspect-ratio:1; height:.75rem; opacity:.3;
                        border-radius:9999px; align-self:flex-start; flex-shrink:0;
                        margin-bottom:1rem; display:block;
                        box-shadow: 1.4em 0, 2.8em 0, 4.2em 0 }   /* the three dots */
[dir=rtl] .mockup-window:before { align-self:flex-end }
.mockup-window pre[data-prefix]:before { content:attr(data-prefix); text-align:right; display:inline-block }
```

Compare `plans/components/browser-mockup.md` §0: same rounded frame, same four-for-one `box-shadow` dot trick, same `overflow: auto hidden`, same stray `pre[data-prefix]` rule. The differences are that the dots hang off the **root** rather than a toolbar (§3b), and there is no address bar.

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type |
|---|---|---|---|
| Base | `mockup-window` | — | — |

**One class. No parts, no modifiers.** `grep -oE '\.mockup-window[a-z0-9-]*' mockup.css | sort -u` returns exactly `.mockup-window` **[verified]**, matching the doc page's single `classnames` entry.

Fifteenth component in the library with an empty variant table. The `border border-base-300 w-full` and `bg-base-100` in the two doc examples are plain Tailwind on the root (§3a).

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]**.)

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — flex children below the dots | no | `<div class="grid place-content-center border-t border-base-300 h-80">Hello!</div>` |

Single default slot, no gating, no named slots. There is nothing to gate: unlike `plans/components/browser-mockup.md` §2's `toolbar`, this component has no optional part.

## 3. Four things the naive implementation gets wrong

### 3a. No border, no background, no width — but it *does* have the dots

`.mockup-window` sets only `border-radius`, `padding-top`, `flex` and `overflow` **[verified]**. Both doc examples add `border border-base-300 w-full`, and the second adds `bg-base-100`.

So a bare `<WindowMockup>` is three faint dots floating above unframed content — visibly incomplete, and correct. The same shape as `plans/components/browser-mockup.md` §3b, and the opposite of `plans/components/code-mockup.md` §3a, which brings its own neutral background. Three components from one CSS file, three different answers; the JSDoc says which this one is.

The doc page's first example puts `border-t border-base-300` on the **content div** to draw the line under the title bar; the second omits it. That line is caller styling, not part of the component.

### 3b. The dots are unconditional, and they are the entire title bar

`.mockup-window:before` paints one circle plus `box-shadow: 1.4em 0, 2.8em 0, 4.2em 0` **[verified]** — the same trick as Browser Mockup, but attached to the root.

Consequences:

- **Every window mockup has three dots**, with no modifier to remove them. `plans/components/browser-mockup.md` §3c could at least omit the toolbar; here `before:hidden` is the only escape, and it also removes the `margin-bottom` that spaces the content.
- **`padding-top: 1.25rem` plus the pseudo-element's `margin-bottom: 1rem`** is what makes the title-bar gap **[verified]**. There is no element there — a caller who expects to put a window title beside the dots has nowhere to put it, and adding one as the first child pushes the content down rather than sitting inline.
- `align-self: flex-start`, mirrored to `flex-end` under `[dir=rtl]` **[verified]** — RTL handled, nothing to expose.

### 3c. `overflow: auto hidden` — horizontal scroll, vertical clip

**[verified]**, identical to `plans/components/browser-mockup.md` §3a and `plans/components/code-mockup.md` §3e. Content taller than a caller-set height is **cut off with no scrollbar**; both doc examples give the content div a fixed `h-80` **[verified]**, which is why it never bites there.

Same JSDoc line as its two siblings. The stray `pre[data-prefix]:before` rule **[verified]** means mockup-code-style prefixed lines work inside a window mockup for free, with no prop — the cross-component note from `plans/components/code-mockup.md` §3d applies here too.

### 3d. Unverified assumptions

1. **Slot sanitization** — the only markup at risk is the caller's content div. Mild; shared with the family.
2. **`corner-shape` is *not* used here** — unlike `plans/components/phone-mockup.md` §3d, this component's radius is a plain `var(--radius-box)` **[verified]**. Nothing to check.

**Not a risk here:** `.mockup-window:before` is a pseudo-element on the root and `pre[data-prefix]` is a **descendant** selector **[verified]** — no child selectors at all, so the shared slot-wrapping question that gates twenty-three sibling plans does not apply. Same conclusion as `plans/components/browser-mockup.md` §3e and `plans/components/code-mockup.md` §3f; **do not** copy the blocking language from `plans/components/phone-mockup.md` §3e.1, even though that component lives in the same CSS file.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * An OS-window frame. daisyUI supplies the rounded corners and the three
 * title-bar dots; the **border, background and width are yours** —
 * `class="border border-base-300 w-full"` is what both doc examples add
 * (plan §3a).
 *
 * The dots are a `::before` on this element, so every window mockup has them
 * and there is no space for a window title beside them (plan §3b).
 *
 * Content taller than a height you set is clipped with no scrollbar:
 * `overflow-y` is hidden (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {}

// No variant class map: daisyUI defines exactly one class for this component
// and no modifiers (plan §1).

const { class: className, ...rest } = Astro.props;
---

<div class:list={['mockup-window', className]} {...rest}>
  <slot />
</div>
```

Identical in shape to the current scaffold, which is already correct — like `plans/components/code-mockup.md` §4 and `plans/components/countdown.md` §4, and unlike `plans/components/otp.md` §0. The work here is the JSDoc and the stories.

No `<script>`: pure CSS, RTL included (§3b). Not polymorphic — daisyUI documents `mockup-window` on a wrapper `div`.

### Astro idioms gate

- [ ] Content arrives via a plain default slot — no `title` prop (§3b).
- [ ] No `Astro.slots.has()` gating — there is no optional part (§2).
- [ ] Root element is `div`, matching both doc examples.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] No `as` prop.
- [ ] No invented props: no `color` (§3a), no `dots` (§3b).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] Probe (§5c):
  ```astro
  <WindowMockup class="border border-base-300 w-full">Hello!</WindowMockup>
  <WindowMockup id="x" data-test="y" style="max-width:40rem">ok</WindowMockup>
  <WindowMockup title="Untitled">must error — no title bar element (§3b)</WindowMockup>
  <WindowMockup color="primary">must error — no colour axis (§1)</WindowMockup>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8) — there are only two:

| Doc-page example | Story | Notes |
|---|---|---|
| window mockup with border | `WithBorder` | `class: 'border border-base-300 w-full'`, content `grid place-content-center border-t border-base-300 h-80` |
| window mockup with background color | `WithBackgroundColor` | adds `bg-base-100`, content without the `border-t` |

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`Unframed`** — no `class` at all, showing §3a's dots-over-nothing.
- **`OverflowClipping`** — content taller than a set height, next to a correct `h-80` copy (§3c).
- **`WithPrefixedCode`** — a `<pre data-prefix="$"><code>` inside, demonstrating the free cross-component rule from §3c. Cheap, and it is the one behaviour shared with Code Mockup that nobody would guess.

## 6. Steps

- [ ] **Step 1:** Nothing to re-read. Note §3d removes the slot-wrapping unknown — despite `plans/components/phone-mockup.md` §3e.1 being blocking in the same CSS file.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Confirm `WindowMockup.astro` matches §4 — the scaffold's markup is already right, so this is adding the JSDoc and re-walking the gate.
- [ ] **Step 4:** Replace `WindowMockup.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `WithBorder` is a rounded frame with **three dots** top-left and a rule under the title bar; `WithBackgroundColor` fills and drops the rule; `Unframed` shows dots above unframed content (§3a); `OverflowClipping` cuts off with **no scrollbar** (§3c); `WithPrefixedCode` renders the `$` gutter; flip the canvas to RTL and confirm the dots move to the right (§3b).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="mockup-window[^"]*"[^>]*>' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Window` row (slug `window-mockup`) in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] The single daisyUI class is applied; no others exist to expose (§1).
- [ ] No invented axis — no colour, no `dots`, no `title` (§3a, §3b).
- [ ] Caller `class` merges through `class:list` — load-bearing, since border, background and width all arrive that way (§3a).
- [ ] JSDoc states: the frame is caller-supplied (§3a), the dots are unconditional with no title slot (§3b), and content clips vertically (§3c).
- [ ] One story per doc-page example, plus `Unframed`, `OverflowClipping` and `WithPrefixedCode`.
- [ ] Every box in §4's gate ticked.
