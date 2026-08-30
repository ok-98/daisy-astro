# Kbd Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/kbd/
**Root element:** `kbd`
**Target file:** `packages/daisy-astro/src/components/Kbd/Kbd.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Kbd/Kbd.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'kbd'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Kbd.astro` and 10 stories are in the repo per §4/§5; markup, type probe and CSS coverage verified (§8). One deviation from §4's listing: the JSDoc holds no markup examples, because a less-than sign anywhere in the frontmatter breaks Props inference (`plans/README.md` §5c). Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/kbd.css` and the doc page source. §3d lists what is **unverified**.

---

## 0. The simplest component in the library

One class, one axis, one native element, one slot. There is no trap in the CSS:

```css
.kbd { display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;
       --size: calc(var(--size-selector, .25rem) * 6);
       height: var(--size); min-width: var(--size); padding-inline: .5em;
       border-radius: var(--radius-field); background-color: var(--color-base-200);
       border: var(--border) solid color-mix(in srgb, var(--color-base-content) 20%, #0000);
       border-bottom: calc(var(--border) + 1px) solid …;   /* the "keycap" edge */
       font-size: .875rem; vertical-align: middle }
.kbd-xs { --size: calc(var(--size-selector,.25rem) * 4); font-size:.625rem }  /* …sm, md, lg, xl */
```

**[all verified]**. This plan is short on purpose — §3 has three real notes and nothing invented to pad it.

## 1. Variant audit

**6 classes: 1 base + 5 size**, matching the doc page's frontmatter. `grep -oE '\.kbd[a-z0-9-]*' kbd.css | sort -u` returns exactly those 6 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `kbd` | — | — | Always applied. |
| Size | `kbd-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Each sets `--size` **and** `font-size` **[verified]**. `md` is the default and still emittable. |

**No colour or style axis** — there is no `kbd-primary`, no `kbd-outline` **[verified]**.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer.)

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — the `<kbd>` is the root | no | `K`, `ctrl`, `⌘`, `▲` |

Single default slot, no gating, no fallback content.

**No `key` prop.** Content comes in through slots (`plans/README.md` §5), and the examples put single characters, words and symbols in it.

## 3. Four things worth knowing

### 3a. `<kbd>` is the point, and combinations are separate elements

`.kbd` is a class-only selector **[verified]**, so it would work on a `<span>`. It must not: `<kbd>` is the native element for user input, and it is what a screen reader announces as a key.

So **no `as` prop** — the opposite call to `plans/components/badge.md` §3a, where the element genuinely varied across the doc page. Here every example is a `<kbd>`.

Note that daisyUI models a **key combination as several `<kbd>` elements with plain text between them** — `<kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>del</kbd>` **[verified]**, not one `<kbd>` containing the whole shortcut. That matches the HTML spec's guidance and means **there is no `combo` prop and no separator prop**; the `+` is caller text. One JSDoc line, because a `keys={['ctrl','shift']}` API is the obvious thing to reach for and would produce worse markup.

### 3b. `min-width` equals `height`, which is what makes single keys square

`height: var(--size); min-width: var(--size); padding-inline: .5em` **[verified]** — a one-character key is a square, and longer text grows the width while the height stays put. That is why `Xsmall`…`Xlarge` in the sizes example render as pills rather than squares, and why the full-keyboard example lines up without any width classes.

Nothing to expose; worth stating so nobody adds a `square` prop for behaviour that is already automatic.

### 3c. The bottom border is one pixel thicker on purpose

`border-bottom: calc(var(--border) + 1px)` against a uniform `border` on the other three sides **[verified]** — that asymmetry is the entire keycap illusion, and `box-shadow: none` is set explicitly to stop a theme's shadow from competing with it.

A caller adding `shadow-md` will flatten the effect rather than deepen it. One JSDoc line.

### 3d. Unverified assumptions

1. **Slot sanitization vs symbol characters.** The function-key and arrow examples are `⌘ ⌥ ⇧ ⌃ ▲ ◀︎ ▶︎ ▼` — including variation-selector sequences (`◀︎` is U+25C0 U+FE0E). If they render as coloured emoji instead of glyphs, that is font fallback, not the component. Worth one look.
2. **`vertical-align: middle` in running text.** The "in text" example inlines a `kbd-sm` in a sentence **[verified]**; confirm the baseline looks right rather than assuming, since `inline-flex` plus `vertical-align` is exactly the combination that drifts.

**Not a risk here:** there are no child selectors, no `:nth-child` rules and no parts **[verified]**, so the shared slot-wrapping question that gates sixteen sibling plans does not apply. Same conclusion as `plans/components/divider.md` §3f.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A keyboard key. Renders a native `<kbd>`, which is what assistive tech
 * announces as user input — there is no `as` prop (plan §3a).
 *
 * A shortcut is **several `Kbd`s with text between them**, matching daisyUI
 * and the HTML spec:
 *
 * ```astro
 * <Kbd>ctrl</Kbd> + <Kbd>shift</Kbd> + <Kbd>del</Kbd>
 * ```
 *
 * Single characters render square automatically (plan §3b). The thicker
 * bottom border is the keycap effect — adding a `shadow-*` flattens it
 * (plan §3c).
 */
interface Props extends HTMLAttributes<'kbd'> {
  size?: DaisySize;
}

// Full literal class names. NEVER `kbd-${size}` (plans/README.md §1b).
const SIZE: Record<DaisySize, string> = {
  xs: 'kbd-xs', sm: 'kbd-sm', md: 'kbd-md', lg: 'kbd-lg', xl: 'kbd-xl',
};

const { size, class: className, ...rest } = Astro.props;
---

<kbd class:list={['kbd', size && SIZE[size], className]} {...rest}>
  <slot />
</kbd>
```

No `<script>`: pure CSS. Not polymorphic (§3a).

### Astro idioms gate

- [ ] Content arrives via the default slot — no `key` or `keys` prop (§2, §3a).
- [ ] Root is `<kbd>` with **no `as` prop** (§3a).
- [ ] No `Astro.slots.has()` gating, no fallback content.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] `size` uses `DaisySize`, imported, not redeclared; no collision (`size` is not an attribute of `<kbd>`).
- [ ] Every variant class is a literal in a `Record` map — no `` `kbd-${size}` ``.
- [ ] Probe (§5c):
  ```astro
  <Kbd>K</Kbd>
  <Kbd size="lg" id="x" data-test="y" class="mx-1">⌘</Kbd>
  <Kbd color="primary">must error — no colour axis (§1)</Kbd>
  <Kbd size="2xl">must error — DaisySize stops at xl</Kbd>
  <Kbd keys={['ctrl','K']}>must error — a combo is several Kbds (§3a)</Kbd>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default`, `Sizes` (five), `InText`, `KeyCombination`, `FunctionKeys`, `FullKeyboard`, `ArrowKeys`.

Plus `Playground` and `Passthrough`. The size axis is covered by `Sizes`, so no extra axis story is needed.

One beyond the doc page:

- **`WithShadow`** — a plain `Kbd` beside one with `class="shadow-md"`, showing §3c's flattened keycap. Cheap, and it pre-empts a "why does mine look wrong" question.

## 6. Steps

- [x] **Step 1: done.** §3d does remove the slot-wrapping unknown, which is settled library-wide anyway (`plans/IMPLEMENTATION-ORDER.md` §2, Tier 0.3).
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4 and the gate walked. The probe errored on exactly the two intended lines (`size="2xl"`, a `keys` prop). `color="primary"` was dropped from the probe: it cannot error on any component (`plans/components/avatar.md` §3e.3).
- [x] **Step 4: done.** `Kbd.stories.ts`, 10 stories per §5, markup copied from the doc page.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Default` is a square key with a visibly thicker bottom edge; `Sizes` shows five heights **and** five font sizes; `InText` sits on the sentence's baseline (§3d.2); `FullKeyboard` rows align with no width classes (§3b); `FunctionKeys` and `ArrowKeys` render as glyphs, not emoji (§3d.1); `WithShadow` shows the keycap flattening (§3c).
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<kbd class="kbd kbd-lg mine" id="kbd-1" data-test="yes" style="letter-spacing:2px">⌘</kbd>`. Full output in §8.
- [x] **Step 7: done — the `Kbd` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 6 daisyUI classes reachable: base plus 5 sizes.
- [x] `size` uses `DaisySize`, imported, not redeclared.
- [x] Root is a native `<kbd>`; no `as`, no `keys` prop (§3a).
- [x] JSDoc states: a shortcut is several `Kbd`s (§3a), single keys are square automatically (§3b), and `shadow-*` flattens the keycap (§3c).
- [x] No invented axis — no colour, no style.
- [x] One story per doc-page example, plus `WithShadow`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default        → <kbd class="kbd">K</kbd>
Sizes          → <kbd class="kbd kbd-xs">Xsmall</kbd> … <kbd class="kbd kbd-xl">Xlarge</kbd>
InText         → <span>Press <kbd class="kbd kbd-sm">F</kbd> to pay respects.</span>
KeyCombination → <kbd class="kbd">ctrl</kbd>+<kbd class="kbd">shift</kbd>+<kbd class="kbd">del</kbd>
FunctionKeys   → <kbd class="kbd">⌘</kbd><kbd class="kbd">⌥</kbd><kbd class="kbd">⇧</kbd><kbd class="kbd">⌃</kbd>
FullKeyboard   → three rows of bare <kbd class="kbd">, no width classes anywhere
ArrowKeys      → <kbd class="kbd">▲</kbd> / <kbd class="kbd">◀︎</kbd><kbd class="kbd">▶︎</kbd> / <kbd class="kbd">▼</kbd>
WithShadow     → <kbd class="kbd">K</kbd><kbd class="kbd shadow-md">K</kbd>
Passthrough    → <kbd class="kbd kbd-lg mine" id="kbd-1" data-test="yes" style="letter-spacing:2px">⌘</kbd>
```

What this settles: the root is a real `kbd` element everywhere; a combination is separate elements with caller text between them, not one element (§3a); the variation-selector arrows survive the pipeline byte for byte (§3d.1 — whether the *font* honours them is Step 5); all 6 classes have rules in the built stylesheet.
