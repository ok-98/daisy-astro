# Text Rotate Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/text-rotate/
**Root element:** `span` (**not** `div` — see §0a)
**Target file:** `packages/daisy-astro/src/components/TextRotate/TextRotate.astro`
**Story file:** `packages/daisy-astro/src/components/TextRotate/TextRotate.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'span'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- No shared variant union applies — this component has no colour or size axis.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).

---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/textrotate.css` (the whole file is ~30 rules) and the doc page.

The frontmatter lists **one** class and nothing else:

```yaml
component:
  - class: text-rotate
    desc: Wrapper for texts
```

No colour, no size, no style, no modifiers. Everything this component does is structural and driven by `:has()` on the child count.

### 0a. The root is a `<span>`, and the scaffold's `<div>` produces invalid HTML

`.text-rotate` sets `display: inline-block; vertical-align: bottom; white-space: nowrap; height: 1lh`. Every doc example uses `<span class="text-rotate">`, and the third one — *"Rotating words in a sentence"* — puts it **inside a text run**:

```html
<span>
  Providing AI Agents for
  <span class="text-rotate">…</span>
</span>
```

A `<div>` there is not merely unidiomatic: `<span>` has phrasing content model, so a `<div>` inside it is a parse error and the browser closes the `<span>` early, breaking the sentence.

The scaffold uses `<div>`. **Scaffold bug #7**, same category as OTP's wrong root element (`otp.md` §0) and distinct from the missing-`type` group (closed in `text-input.md` §0i) and Textarea's whitespace defect (`textarea.md` §0a).

### 0b. There is a required inner wrapper, and the scaffold has no place for it

The markup is **three levels**, not two:

```html
<span class="text-rotate">   <!-- viewport: height 1lh, overflow hidden -->
  <span>                     <!-- track: display grid, height items × 100%, animated -->
    <span>ONE</span>         <!-- items -->
    <span>TWO</span>
    <span>THREE</span>
  </span>
</span>
```

The CSS confirms every level:

```css
.text-rotate      { height:1lh; overflow:hidden; display:inline-block }
.text-rotate > *  { display:grid; height:calc(var(--items,1) * 100%); justify-items:start }
.text-rotate > * > * { clip-path:inset(.5px 0); align-content:baseline }
```

The scaffold renders `<div class="text-rotate"><slot /></div>` — one level. Dropping three `<span>`s straight into the slot makes each of them a `.text-rotate > *`, i.e. three independent full-height grids stacked in a `nowrap` inline-block, and no animation at all (the `:has()` rules look for `> :nth-child(n)` *inside* the track).

**Decision: the component renders both wrappers; the slot holds the items.** A `TextRotateTrack` sub-component would be pure ceremony — it has exactly one legal parent, one legal use, and no classes of its own beyond alignment (§0c).

### 0c. `justify-items` is the only real prop, and it belongs on the **track**

```css
.text-rotate > * { justify-items: start }
```

Four of the five doc examples override it with `class="justify-items-center"` — **on the inner track span, not on the root**. Since the component owns that element, a caller cannot reach it with `class` (which merges onto the root). So this needs a prop:

`align?: 'start' | 'center' | 'end'`, default `'start'`, mapped through a literal `Record` to `justify-items-start` / `justify-items-center` / `justify-items-end`.

This is the standing rule once more — *"the prop belongs on whichever component's root daisyUI writes the class on"* (carousel `snap`, chat `color`, dock `active`, indicator placement, steps `color`, tab `active`, textarea/input `size` for floating-label). Here the owning element is one the component generates, which is exactly why the prop is unavoidable rather than a convenience.

`justify-items-*` are Tailwind utilities, not daisyUI classes, but the §1b no-interpolation rule applies identically — they are still class names Tailwind must find as literal text in the source.

### 0d. Six items is a hard ceiling, and the seventh breaks it silently

```css
.text-rotate > *:has(> :nth-child(2)) { --items:2; animation: rotator … linear(0 0% 49%, .5 50% 99%, 1 100% 100%) infinite }
… :nth-child(3) → --items:3 …
… :nth-child(4) → --items:4 …
… :nth-child(5) → --items:5 …
.text-rotate > *:has(> :nth-child(6)) { --items:6; animation: … linear(0 0% 15%, …, 1 100% 100%) infinite }
```

`:has(> :nth-child(6))` matches whenever there are **at least** six children, and there is no seventh rule. With 7+ items the track still gets `--items: 6`, so its height is `6 × 100%` while it holds seven rows, and the keyframes' `translate: 0 -100%` step lands on the wrong offsets — items are clipped and the loop skips.

The doc's own `desc` says so up front ("can show up to 6 lines of text"), so this is documented, not a bug. But it fails *silently and only at runtime*, so:

- Put the ceiling in the component's JSDoc.
- Add one story, `TooManyItems`, with seven items and a description saying this is the documented failure. It is the only way a reader learns the limit before shipping it.
- Do **not** try to enforce it in the component: slot content is opaque to Astro at build time, and counting it would mean parsing rendered HTML.

Also note `--items` defaults to `1`: a single item gets no animation at all and simply displays. That is the correct degenerate behaviour, not a bug.

### 0e. Duration is a Tailwind utility, not a prop

```css
.text-rotate { --duration: var(--tw-duration) }
.text-rotate > * { animation: rotator var(--duration, 10s) … }
```

`--tw-duration` is what Tailwind's `duration-*` utilities set. The doc's fourth example writes `class="text-rotate … duration-6000"` for a 6-second loop — a **caller class on the root**, which `class:list` already merges.

No `duration` prop. Adding one would mean emitting `style="--tw-duration: …"`, duplicating a utility that already works, and it would fight any `duration-*` class a caller also passes. Document the utility in JSDoc instead; that is the whole feature.

Same reasoning for the two other knobs the doc examples use, both plain caller classes on the root:
- **Font size** — `text-7xl max-md:text-3xl` (the root is `inline-block`, so it scales the `1lh` viewport with it).
- **Line height** — `leading-[2]`, the *"Custom line height"* example. `height: 1lh` means the viewport tracks the computed line-height, so this is the supported way to add vertical breathing room for tall fonts.

### 0f. Reduced motion degrades to nothing above two items

```css
&:has(>:nth-child(2)) {
  @media (prefers-reduced-motion: no-preference) { animation: rotator var(--duration,10s) linear(…) infinite }
  @media (prefers-reduced-motion: reduce)        { animation: rotator var(--duration,10s) steps(var(--items), jump-end) infinite }
}
&:has(>:nth-child(3)) { --items:3; @media (prefers-reduced-motion: no-preference) { animation: … } }
… same for 4, 5, 6 …
```

The `reduce` branch exists **only** in the two-item rule. For 3–6 items the `no-preference` rule in the more specific `:has()` block wins the cascade and is media-gated off, and no `reduce` fallback replaces it — so a reduced-motion user sees a static first item.

That is daisyUI's behaviour, faithfully. Do not patch it in the component (a `@media` override would be CSS this library does not ship, per README §6's "no script/CSS for what daisyUI already does"). Record it, and mention it in the accessibility line of the story descriptions so nobody reports it as our bug.

Hover pausing is free and needs no prop: `.text-rotate:hover > * { animation-play-state: paused }`.

### 0g. No responsive variants — unlike the form controls

`textrotate.css` opens `@layer utilities{.text-rotate{…` but contains **no** `.sm\:text-rotate` / `.md\:…` rules. Contrast with Table (`table.md` §0a), Textarea (`textarea.md` §0b) and Text Input (`text-input.md` §0b), where being in the utilities layer *did* produce breakpoint copies of every class. Being in `@layer utilities` is not by itself the trigger — check the file, don't infer. Nothing to expose here either way, since the component has no variant classes.

### 0h. Correction to `plans/README.md` §254

That line currently reads:

> Handled by the framework: its renderer applies scoped styles and executes client scripts after injecting the SSR'd HTML, so script-backed components (Theme Controller, Swap, **Text Rotate**) behave in the canvas.

Text Rotate is **not** script-backed. It is a CSS `@keyframes` animation driven by `:has()` child counting, with zero JavaScript — the whole file is quoted above. Drop it from that list when this plan is implemented (§6 Step 7). The sentence stays true for the other two.

### 0i. Attribute collisions: none

`align` is not on `HTMLAttributes` or on any span-specific interface — Astro's `align` declarations live on `TableHTMLAttributes` (`astro-jsx.d.ts:963`), `TdHTMLAttributes` (`:993`) and `ThHTMLAttributes` (`:1003`), none of which apply to `<span>`. Free to use.

---

## 1. Variant audit

daisyUI documents **no** modifier classes for this component — one class, `text-rotate`. The single prop below is not a daisyUI class; it exists because the element it targets is generated by the component and therefore unreachable by the caller (§0c).

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Item alignment | — (Tailwind `justify-items-*` on the track) | `align` | `'start' \| 'center' \| 'end'` | Default `'start'`, matching `.text-rotate > * { justify-items:start }`. Four of five doc examples use `center`. |

Deliberately **not** props, all caller classes on the root (§0e): loop duration (`duration-6000`), font size (`text-7xl`), line height (`leading-[2]`).

Deliberately **not** enforced: the six-item ceiling (§0d).

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | the generated track `<span>` (inside the root `<span>`) | no | The 2–6 item `<span>`s |

Single default slot, but it lands **two levels deep**, which is unusual enough to spell out in the JSDoc: the caller writes only the items, and the component supplies both the clipping viewport and the animated track (§0b).

Items are **bare elements**, per the four-treatments rule (`chat-bubble.md` §0a): they carry no daisyUI classes at all — the sentence example decorates them with plain Tailwind (`bg-teal-400 text-teal-800 px-2`). No `TextRotateItem`.

**The shared slot-wrapping unknown (`aura.md` §3e.1) is decisive here.** `.text-rotate > * > *` and, more importantly, `:has(> :nth-child(n))` count the track's **direct children**. If Astro interposes any element around slot content, `--items` collapses to 1 and the animation stops entirely — a total failure, not a cosmetic one. `textarea.md` §2 and `text-input.md` §2 both queued this probe; if it is still open when this plan starts, run it here first (§6 Step 3).

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'span'> {
  /** Horizontal alignment of the rotating items. Applied to the generated
   *  track element, which a caller's `class` cannot reach. */
  align?: 'start' | 'center' | 'end';
}
---
```

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference in generic components
// (plans/README.md §5c). Harmless to keep the order everywhere.
interface Props extends HTMLAttributes<'span'> {
  align?: 'start' | 'center' | 'end';
}

// Full literal class names. NEVER `justify-items-${align}` — Tailwind scans
// source text and finds nothing in an interpolated name (plans/README.md §1b).
const ALIGN: Record<'start' | 'center' | 'end', string> = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
};

const { align = 'start', class: className, ...rest } = Astro.props;
---
{/* Three levels: viewport (1lh, overflow hidden) > animated track > items.
    Callers supply only the items. Up to 6 — a 7th silently breaks the loop.
    Speed, font size and line height are caller classes on the root:
    duration-6000, text-7xl, leading-[2]. */}
<span class:list={['text-rotate', className]} {...rest}>
  <span class:list={[ALIGN[align]]}><slot /></span>
</span>
```

`align` has a default, so `ALIGN[align]` is unconditional — no `align && …` guard, and no `Astro.slots.has()` gating anywhere (the track is never optional).

### Astro idioms gate

- [ ] Content arrives via the slot, not content props.
- [ ] No optional styled wrappers — the track is always required, so nothing to gate.
- [ ] Root element is `<span>`, matching every doc example, and legal inside a sentence (§0a).
- [ ] **No `<script>`** — the rotation is `@keyframes` + `:has()` child counting. Correct `plans/README.md` §254, which currently lists this component as script-backed (§0h).
- [ ] `...rest` spread onto the root `<span>`.
- [ ] Not polymorphic: the frontmatter's one class is "Wrapper for texts" and every example is a `<span>`.
- [ ] `align` collides with nothing on `<span>` (§0i).
- [ ] **Every class is a full literal in a `Record` map** — including the Tailwind `justify-items-*` values.
- [ ] Not generic, so §5c's ordering rule is advisory — keep it anyway.
- [ ] Prop typing verified with a throwaway probe: `<TextRotate align="center">…</TextRotate>` passes, `<TextRotate align="middle">` errors.
- [ ] `astro check` passes.

## 5. Storybook stories

| Doc-page example | Story name | Slots / props it needs |
|---|---|---|
| Text Rotate (3 words, 10s) | `Default` | three `<span>` items |
| Rotating 6 words | `SixWords` | `align="center"`, root `class="text-7xl max-md:text-3xl"`, six items |
| Rotating words in a sentence | `InSentence` | three items with `bg-*`/`text-*`/`px-2`; rendered inside surrounding prose |
| Rotating 3 words with custom duration | `CustomDuration` | `align="center"`, root `class="text-7xl duration-6000"` |
| Custom line height | `CustomLineHeight` | `align="center"`, root `class="text-7xl leading-[2]"`, six emoji items |

Plus:
- `Playground` — `align` control, plus a `class` control so the duration/size/leading caller classes from §0e are discoverable.
- `Alignment` — the one variant-axis story: `start` / `center` / `end` side by side.
- `TooManyItems` — seven items, documented as daisyUI's ceiling failing, not ours (§0d).
- `SingleItem` — one item, which correctly does not animate (§0d).

Three story-writing notes:

- **`InSentence` cannot be expressed with props alone.** The component is the inner half of a sentence; the surrounding text is not a slot. Use a wrapper story (a decorator or a small `.astro` story component) rather than pushing the prose into `slots.default`, which would put it *inside* the track as a seventh item.
- **Story descriptions carry the accessibility note.** Under `prefers-reduced-motion: reduce`, everything above two items shows a static first item (§0f). Say so on `SixWords` and `CustomLineHeight`.
- **Emoji in `CustomLineHeight`** are the reason that example exists — they raise the line box. Keep them; substituting plain words makes the story prove nothing.

```ts
import TextRotate from './TextRotate.astro';

export default {
  title: 'Components/TextRotate',
  component: TextRotate,
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    class: { control: 'text' },
  },
};

const ITEMS = '<span>ONE</span><span>TWO</span><span>THREE</span>';

export const Playground = {
  args: { slots: { default: ITEMS } },
};

export const CustomDuration = {
  args: {
    align: 'center',
    class: 'text-7xl duration-6000',
    slots: { default: '<span>BLAZING</span><span class="font-bold italic px-2">FAST ▶︎▶︎</span>' },
  },
};

// …one export per row of the table above.
```

## 6. Steps

- [ ] **Step 1:** Section 1 is already filled — the frontmatter lists exactly one class and the CSS file is quoted in full above. Nothing to re-derive.
- [ ] **Step 2:** No union goes in `variants.ts`; the three-value `align` union is one-component-specific and stays local, the same carve-out `text-input.md` §6 Step 2 used for `TextInputType`.
- [ ] **Step 3:** Rewrite `TextRotate.astro` per section 4 — root `<span>`, generated track, slot two levels deep. **Then probe the shared slot-wrapping question first** (§2): render three items and confirm in the built HTML that they are direct children of the track. If anything is interposed, the animation is dead and nothing else in this plan is testable. Record the result in `aura.md` §3e.1.
- [ ] **Step 4:** Write `TextRotate.stories.ts` per section 5.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/TextRotate`, verify:
  - `Default` cycles three words on a 10s loop and **pauses on hover** (free, §0f).
  - `Alignment` shows three visibly different horizontal positions.
  - `CustomDuration` completes a cycle in 6s, proving `duration-6000` reaches `--tw-duration` (§0e).
  - `CustomLineHeight` gives the emoji items room without clipping — `height: 1lh` tracking `leading-[2]`.
  - `InSentence` keeps the words on the sentence's baseline (`vertical-align: bottom` + `align-content: baseline`).
  - `TooManyItems` is visibly broken, matching §0d's description.
  - With OS reduced-motion enabled, `SixWords` goes static (§0f) — expected, not a defect.
- [ ] **Step 6:** Attribute forwarding story: `id`, `data-*`, `style`, `class`, plus `title` and `lang`. Headless check:

```bash
pnpm build-storybook
grep -rhoE '<span[^>]*text-rotate[^>]*>' storybook-static/astro-prerendered-stories.json | head
```
- [ ] **Step 7:** Update `plans/README.md`'s Text Rotate row to **Implemented**, **and remove Text Rotate from the script-backed list in §254** (§0h).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] Root is `<span>`, not the scaffold's `<div>` (§0a).
- [ ] Both wrapper levels are generated by the component; the slot holds only items (§0b).
- [ ] `align` renders on the **track**, and all three values are literals in a `Record` (§0c).
- [ ] Slot items confirmed to be direct children of the track, recorded in `aura.md` §3e.1 (§2) — the animation is dead otherwise.
- [ ] The six-item ceiling is in the JSDoc and has a story showing the failure (§0d).
- [ ] No `duration` / `size` / `leading` props — documented as caller classes and demonstrated in stories (§0e).
- [ ] No `<script>` anywhere in the component (§0h).
- [ ] `Props` extends `HTMLAttributes<'span'>`; `class` merges onto the root through `class:list`.
- [ ] `Playground` exposes `align` and `class` as controls.
- [ ] Five doc-example stories plus `Alignment`, `TooManyItems` and `SingleItem`.
- [ ] Reduced-motion behaviour noted in the story descriptions, not patched (§0f).
- [ ] `plans/README.md` §254 corrected (§6 Step 7).
- [ ] Every box in section 4's Astro idioms gate ticked.
