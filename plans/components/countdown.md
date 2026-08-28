# Countdown Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/countdown/
**Root element:** `span` (both components)
**Target files:** `packages/daisy-astro/src/components/Countdown/Countdown.astro`, `CountdownValue.astro` (`Countdown.astro` is a dummy scaffold whose markup is already right; `CountdownValue.astro` does not exist) — see §0a
**Story file:** `packages/daisy-astro/src/components/Countdown/Countdown.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'span'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b). **Countdown has no variant classes**, so no map exists — and note the ban is about class names, not the CSS custom property this component is built on (§3b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Countdown uses none of them** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/countdown.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/countdown/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.

---

## 0. This is a transition effect, not a timer

daisyUI's own description: *"Countdown gives you a transition effect when you change a number between 0 to 999."* The doc page's info box is blunter: *"you need to change the span text and the `--value` CSS variable using JS."*

There is no timer, no interval, no target date, and no JavaScript in `countdown.css` **[verified — the file is one class and a pile of `calc()`]**. The animated demos on the doc page are driven by the docs site's own Svelte state.

**So this component ships no `<script>`, no `to`/`from`/`interval`/`autostart` props, and no timer of any kind.** It renders a number with daisyUI's rolling-digit styling; making that number change is the caller's job, in whatever runs their page. `plans/README.md` §6 is explicit about not adding a script for behaviour daisyUI does not have.

Unlike `plans/components/carousel.md` §0 — where the doc page's anchor-link pattern gave a genuine no-JS interaction — a server-rendered countdown genuinely does not count. That is still useful (it is the digit *display* for a value the app owns), but the JSDoc has to say so plainly rather than let the name imply otherwise. §3e gives the caller-side one-liner.

### 0a. Two files, and the second one breaks a precedent on purpose

`.countdown > *` is a **direct child** selector **[verified]**: each digit group is a child element, and the "Clock countdown" example has three of them with literal `h`/`m`/`s` text between. So the container cannot own a single value.

| File | Renders | Owns |
|---|---|---|
| `Countdown.astro` | `<span class="countdown">` | the class, and a plain default slot |
| `CountdownValue.astro` | `<span style="--value:N" aria-live="polite" aria-label="N">N</span>` | one digit group |

The child span carries **no daisyUI class** — it is styled entirely through `.countdown > *`. By the part-treatment table in `plans/components/chat-bubble.md` §0a that is the "bare element, no wrapper" case, and the precedents (`plans/components/card.md` §0b's `<figure>`, `plans/components/code-mockup.md` §2's `<pre>`) say *don't build a component*.

**This one is different, and gets a component anyway.** Those bare elements need nothing from the caller but their tag. This one needs **the same number written three times, in three different places, kept in sync**:

```html
<span style="--value:59;" aria-live="polite" aria-label="59">59</span>
```

Miss the `aria-label` and screen-reader users get nothing at all, because the visible digits are CSS `content` and the text node is `visibility: hidden` (§3a). Miss the text node and copy-paste and no-CSS fallback break. That is exactly the boilerplate a wrapper exists to remove, and the failure mode is an accessibility bug rather than a visual one.

So `CountdownValue` takes one prop, `value`, and emits all three. Recorded here as a deliberate exception so the bare-element rule stays meaningful.

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `countdown` | — | — | Always applied to `Countdown`'s root. |

**One class. No parts, no modifiers, no colour, no size** — `grep -oE '\.countdown[a-z0-9-]*' countdown.css | sort -u` returns exactly `.countdown` **[verified]**, matching the doc page's single `classnames` entry.

Fifth component in a row with an empty variant table (Breadcrumbs, Browser Mockup, Calendar, Code Mockup, Countdown). The honest result, not an unfinished audit.

Everything that varies in the doc examples is either a **CSS custom property** (§3b) or plain Tailwind on the container (`font-mono`, `text-2xl`…`text-6xl`, and the `flex`/`grid` wrappers in the "labels" and "boxes" examples).

### 1a. The real API is two CSS custom properties

| Property | Where | Range | Effect |
|---|---|---|---|
| `--value` | the child span | 0–999 | The number. Clamped by `mod(max(0, var(--value)), 1000)` **[verified]** — negatives read as 0, ≥1000 wraps. |
| `--digits` | the child span | 1 (default), 2, 3 | Minimum digits shown, so the box does not resize as the number crosses 10 or 100 **[verified — `clamp(0, var(--digits,1) - 2, 1)` etc.]**. |

Both become props on `CountdownValue` (§4). Neither is a class, so §1b does not apply — see §3b.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Countdown` | `default` | none — direct children of `.countdown` | no | one or more `CountdownValue`s, plus literal `h`/`m`/`s` or `:` separators |
| `CountdownValue` | **none** | — | — | the component writes its own text node (§0a) |

`CountdownValue` deliberately has **no slot**: its text content is the number, derived from `value`, and letting a caller supply different content would desynchronise the three copies §0a exists to keep together. Second component in the library with no slot, after `plans/components/checkbox.md` §2 — for the opposite reason (there the element was void; here the content is generated).

Separators are plain text in `Countdown`'s slot, exactly as the doc page writes them. No `separator` prop: the page uses `h`/`m`/`s` in one example and `:` in another, both as bare text nodes between children, and either is one keystroke at the call site.

## 3. Six things the naive implementation gets wrong

### 3a. The visible digits are CSS `content` — the text node is hidden

`.countdown > *` sets `visibility: hidden`, and its `::before`/`::after` set `visibility: visible` with a `--tw-content` string listing `"00\a 01\a 02\a … 99\a "`, then slide it with `transition: all 1s cubic-bezier(1,0,0,1)` **[all verified]**. `overflow-y: clip` on the child crops it to one line.

Consequences, in order of how badly they bite:

1. **`aria-label` is not decoration — it is the only accessible name.** A screen reader cannot read generated `content` reliably, and the real text node is `visibility: hidden`, which removes it from the accessibility tree. Every doc example carries `aria-live="polite" aria-label="{n}"`. `CountdownValue` emits both by default (§4).
2. **The text node still matters** for copy-paste, for no-CSS rendering, and as the thing the caller's JS usually updates alongside `--value`. Keep it.
3. **Only 0–99 rolls.** The `::before`/`::after` list is two digits; the hundreds digit is computed separately via `--value-hundreds` **[verified]**. Not something to expose or fix — just don't be surprised that a 3-digit countdown animates differently from a 2-digit one.

### 3b. `--value` is an inline style, and interpolating it is fine

The reflex in this repo — `plans/README.md` §1b — is "never build a class name by interpolation". That rule is about **class names**, because Tailwind scans source text for class candidates. A CSS custom property in an inline `style` attribute is not a class, is not scanned by Tailwind, and needs no literal map:

```astro
<span style={`--value:${value}; --digits:${digits};`} …>
```

is correct and is the only way this component can work. Stating it explicitly because the surrounding plans repeat the interpolation ban often enough that someone will reach for a `Record<number, string>` of 1000 literals.

Astro's `style` attribute accepts `string | Record<string, any>` **[verified in `astro-jsx.d.ts`]**, so an object form is also available; whether custom properties survive that path is §3f.1.

**But `style` is also a native attribute**, so a caller's own `style` would be overwritten by the component's. `CountdownValue` therefore destructures `style` and concatenates rather than clobbering — the same class of trap `plans/components/button.md` §3a hit with a variant prop named `style`, arriving from the other direction.

### 3c. `--digits` is what stops the layout jumping

The child's width is `calc(1ch + var(--show-tens) * 1ch + var(--show-hundreds) * 1ch)` with `transition: width .4s ease-out .2s` **[verified]**. So a value crossing 9→10 physically widens the box and shifts everything after it.

`--digits: 2` pins the minimum at two, which is why the doc page's "Large text with 2 digits" and "Clock countdown with colons" examples set it. A clock without it visibly jitters at every rollover past 9.

Not defaulted to 2 — daisyUI's default is 1 and the first example relies on it — but the JSDoc says what it is for, and `Playground` exposes it, because "my countdown wobbles" is otherwise a mystery.

The doc page pairs it with `font-mono` and daisyUI adds `font-variant-numeric: tabular-nums` **[verified]**; together those are what make the digits stop dancing. `font-mono` is a caller class on the container.

### 3d. `direction: ltr` is forced on the child

**[verified]** — plus `direction: rtl; text-align: end` on the pseudo-elements, which is how the digit list right-aligns. So numbers stay left-to-right inside an RTL page, correctly, with no prop and nothing to override. Same call as `plans/components/code-mockup.md` §3e.

### 3e. Making it actually count is the caller's job, and it is three lines

Since §0 rules out a component script, the JSDoc carries the recipe instead of leaving the reader to invent it:

```html
<span class="countdown"><span id="secs" style="--value:59" aria-label="59">59</span></span>
<script>
  const el = document.getElementById('secs');
  setInterval(() => {
    const n = (Number(el.style.getPropertyValue('--value')) + 59) % 60;
    el.style.setProperty('--value', String(n));
    el.setAttribute('aria-label', String(n));
    el.textContent = String(n);
  }, 1000);
</script>
```

Three things get updated together, which is the same synchronisation §0a is about — worth showing once so callers do not update only `--value` and silently break the accessible name.

If a caller writes this as an Astro component `<script>`, `plans/README.md` §6 applies: it runs **once per page**, so it must `querySelectorAll` and wire every instance. Named here because a countdown is exactly the component someone puts three of on one page.

### 3f. Unverified assumptions

1. **Custom properties through Astro's object `style` form.** `style?: string | Record<string, any>` **[verified in the typings]**, but whether `style={{ '--value': 59 }}` serialises to `--value:59` or is dropped is untested. §4 uses the string form, which is unambiguous; only revisit if merging caller styles turns out to be cleaner with objects.
2. **Does slot content land as direct children of `.countdown`?** Blocking — `.countdown > *` is a child selector **[verified]**, so an injected wrapper would make the wrapper the only digit group and every `CountdownValue` inside it would go unstyled and stay `visibility: hidden`, i.e. **invisible**. Same shared question as `plans/components/aura.md` §3e.1, `plans/components/carousel.md` §3g.1, `plans/components/chat-bubble.md` §3f.1, `plans/components/breadcrumbs.md` §3f.1 and `plans/components/alert.md` §3d.2 — six plans, one answer. Record it in all of them. This is the loudest failure of the six: not a layout glitch, but nothing on screen at all.
3. **`round()` and `mod()` support.** daisyUI computes every digit with CSS `round(to-zero, …)` and `mod()` **[verified]**. Both are recent CSS Values 4 functions; in a browser without them the whole calculation collapses and the digits do not render. Worth one check in Step 5 so it is not mistaken for a component bug — and worth knowing before recommending this component for a wide-support project.
4. **Storybook controls and a static value.** Every story is a fixed number, so nothing animates in the canvas. That is correct per §0, but it makes the component look inert. `Animated` (§5) uses a story-local script to prove the transition; whether the framework executes it is the usual `plans/README.md` §7 question.

## 4. Component implementation

### `Countdown.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * daisyUI's Countdown is a **transition effect**, not a timer — it renders a
 * number 0–999 with rolling digits. Changing that number is your job; see the
 * recipe in plans/components/countdown.md §3e.
 *
 * Children must be `CountdownValue`s (and any literal separators) — daisyUI
 * styles `.countdown > *`, so a wrapper element makes them invisible.
 *
 * Size and font are caller classes; `font-mono` is what the doc examples use
 * to keep the digits from dancing (plan §3c).
 */
interface Props extends HTMLAttributes<'span'> {}

// No variant class map: daisyUI defines exactly one class here (plan §1).

const { class: className, ...rest } = Astro.props;
---

<span class:list={['countdown', className]} {...rest}>
  <slot />
</span>
```

Markup identical to the current scaffold, which is already correct — like `plans/components/code-mockup.md` §4 and unlike `plans/components/checkbox.md` §0. The work here is the JSDoc and the sibling component.

### `CountdownValue.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
interface Props extends HTMLAttributes<'span'> {
  /** 0–999. Values outside that range are clamped/wrapped by daisyUI (plan §1a). */
  value: number;
  /** Minimum digits shown, so the box doesn't resize on rollover (plan §3c). */
  digits?: 1 | 2 | 3;
}

const {
  value,
  digits,
  // `style` is native and would otherwise be clobbered by the custom
  // properties below (plan §3b).
  style,
  // The accessible name — the visible digits are CSS `content` and the text
  // node is `visibility: hidden`, so without this there is nothing to announce
  // (plan §3a). Defaulted, still overridable.
  'aria-label': ariaLabel = String(value),
  'aria-live': ariaLive = 'polite',
  ...rest
} = Astro.props;

// A CSS custom property in an inline style — NOT a class name, so
// plans/README.md §1b's interpolation ban does not apply (plan §3b).
const vars = `--value:${value};${digits ? ` --digits:${digits};` : ''}`;
---

<span style={[vars, style].filter(Boolean).join(' ')} aria-label={ariaLabel} aria-live={ariaLive} {...rest}>
  {value}
</span>
```

No `class:list` and no daisyUI class: this element is styled entirely by `.countdown > *` (§0a). A caller's `class` still passes through `...rest` untouched.

No `<script>` in either file (§0).

Neither is polymorphic: daisyUI documents `countdown` on a `span`, and the child is a `span` in every example.

### Astro idioms gate

- [ ] `Countdown`'s content arrives via a plain default slot; `CountdownValue` has **no slot** and writes its own text node (§2, §0a).
- [ ] `<slot />` has **no wrapper element** — `.countdown > *` is a child selector and a wrapper makes the digits invisible (§3f.2).
- [ ] No `Astro.slots.has()` gating — nothing is optional.
- [ ] Root is `span` in both, matching every doc example.
- [ ] **No `<script>`, and no `to`/`from`/`interval`/`autostart` prop** (§0).
- [ ] `...rest` spread onto the root element in both files.
- [ ] `CountdownValue` emits `--value` **and** `aria-label` **and** the text node, all from one `value` prop (§0a, §3a).
- [ ] A caller's `style` is **merged**, not overwritten (§3b).
- [ ] `aria-label` and `aria-live` are destructured with defaults, not hardcoded beside the spread (§3a) — the mechanism from `plans/components/alert.md` §3b.
- [ ] No class interpolation anywhere — there are no variant classes; the `--value` interpolation is a style, not a class (§3b).
- [ ] Neither is generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the components correctly *and* incorrectly (§5c):
  ```astro
  <Countdown class="font-mono text-2xl"><CountdownValue value={59} /></Countdown>
  <CountdownValue value={24} digits={2} class="mine" style="color:red" id="x" />
  <CountdownValue />                     <!-- must error — value is required -->
  <CountdownValue value="59" />          <!-- must error — number, not string -->
  <CountdownValue value={5} digits={4} />  <!-- must error — 1 | 2 | 3 -->
  <Countdown color="primary">must error — no colour axis (§1)</Countdown>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props / slots |
|---|---|---|
| Countdown | `Default` | one value, 59, no extra classes |
| Large text with 2 digits | `LargeTwoDigits` | `class: 'font-mono text-6xl'`, `digits: 2` |
| Clock countdown | `Clock` | three values (10, 24, 59) with `h`/`m`/`s` text between, `class: 'font-mono text-2xl'` |
| Clock countdown with colons | `ClockWithColons` | same three with `:` separators; the last two `digits: 2` |
| Large text with labels | `WithLabels` | four countdowns in a `flex gap-5`, labels beside |
| Large text with labels under | `WithLabelsUnder` | the page's `grid grid-flow-col auto-cols-max` wrapper, labels below |
| In boxes | `InBoxes` | as above plus `bg-neutral rounded-box text-neutral-content p-2` on each cell |

Plus `Playground` and `Passthrough` (Step 6). There are no variant axes, so there are no axis stories — `digits` is exercised by two doc examples and by `Playground`.

Three stories beyond the doc page:

- **`Animated`** — one countdown plus the §3e script, so the rolling transition is actually visible; every other story is static by design (§3f.4). If the framework will not run it, the story says so instead of pretending.
- **`DigitsJitter`** — `digits` unset beside `digits={2}`, both at a value that crosses 9, making §3c's width shift observable.
- **`AccessibleName`** — a `CountdownValue` inspected for `aria-label`, with a comment explaining §3a. Cheap, and it is the one thing that cannot be checked by looking at the canvas.

```ts
import Countdown from './Countdown.astro';

// daisyUI's Countdown is a transition effect, not a timer — these stories
// render fixed values. See plans/components/countdown.md §0 and §3e.

const val = (n: number, digits?: number) =>
  `<span style="--value:${n};${digits ? ` --digits:${digits};` : ''}" aria-live="polite" aria-label="${n}">${n}</span>`;

export default {
  title: 'Components/Countdown',
  component: Countdown,
  // No variant argTypes — this component has none (plan §1). The knobs live on
  // CountdownValue and on `class`.
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: { class: 'font-mono text-2xl', slots: { default: val(59) } },
};

export const Clock = {
  args: {
    class: 'font-mono text-2xl',
    slots: { default: `${val(10)}h ${val(24)}m ${val(59)}s` },
  },
};

// Regression guard: native attributes survive and caller `class` merges —
// `class` is where the size and font come from (§1).
export const Passthrough = {
  args: {
    id: 'cd-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine font-mono text-2xl',
    slots: { default: val(59) },
  },
};
```

Whether the stories can use `CountdownValue` as a component rather than the `val()` helper depends on `plans/components/card.md` §3f.4 — resolve once, apply everywhere.

## 6. Steps

- [ ] **Step 1:** Resolve §3f.2 (direct children of `.countdown`) — blocking, and the shared question across six plans now. Its failure here is total invisibility, so it is worth answering first.
- [ ] **Step 2:** No new shared unions, and no use of the existing ones — there are no variant axes (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Add the JSDoc to `Countdown.astro` (its markup is already correct) and create `CountdownValue.astro` per §4, then walk the Astro idioms gate.
- [ ] **Step 4:** Replace `Countdown.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Countdown`, verify:
  - `Default` shows **59** — if it shows nothing, either the digits are not direct children (§3f.2) or `round()`/`mod()` are unsupported (§3f.3). Check the DOM before either conclusion.
  - `Clock` shows `10h 24m 59s` on one line with the separators inline.
  - `LargeTwoDigits` renders at `text-6xl` with a fixed two-digit width.
  - `DigitsJitter`: the unset one changes width across the 9→10 boundary and the `digits={2}` one does not (§3c).
  - `Animated` actually rolls, and the transition slides rather than cutting (§3e, §3f.4).
  - Inspect a `CountdownValue` in devtools: the text node is `visibility: hidden` and `aria-label` carries the number (§3a). This is `AccessibleName`'s point and cannot be seen in the canvas.
  - Flip the canvas to RTL if the toolbar offers it: digits stay LTR (§3d).
- [ ] **Step 6:** Confirm forwarding via `Passthrough` — `id`, `data-*`, `class` survive, and the caller's `style` is **merged** with `--value` rather than replacing it (§3b). Headless check:
  ```bash
  pnpm build-storybook
  grep -rhoE '<span class="countdown[^"]*"[^>]*><span style="--value' storybook-static/astro-prerendered-stories.json | head
  grep -rhoE 'style="--value:[0-9]+;[^"]*"[^>]*aria-label="[0-9]+"' storybook-static/astro-prerendered-stories.json | head
  ```
  The first proves the digit span is a direct child (§3f.2); the second proves `--value` and `aria-label` agree (§3a).
- [ ] **Step 7:** Update the `Countdown` row in `plans/README.md` to **Implemented**, noting `CountdownValue` as part of it (same convention as Accordion/AccordionItem).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] The single daisyUI class is applied to `Countdown`'s root, and no others exist to expose (§1).
- [ ] **No `<script>`, no timer, no `to`/`from`/`interval` prop** — daisyUI's Countdown is a transition effect (§0).
- [ ] `CountdownValue` emits `--value`, `aria-label` and the text node from one `value` prop, and they always agree (§0a, §3a).
- [ ] `digits` reaches `--digits` and pins the width (§3c).
- [ ] A caller's `style` is merged with the custom properties, not overwritten (§3b).
- [ ] Digit spans render as **direct children** of `.countdown` — checked in the build output, not by eye (§3f.2).
- [ ] No invented axis — no colour, no size, no `separator` prop (§2).
- [ ] JSDoc states: this is a display, not a timer, with the update recipe (§0, §3e); `--digits` prevents jitter (§3c); children must be direct (§3f.2).
- [ ] `Playground` exposes `class` and, via `CountdownValue`, `value` and `digits`.
- [ ] One story per doc-page example, reproducing that example's markup and copy, plus `Animated`, `DigitsJitter` and `AccessibleName`.
- [ ] Every box in §4's Astro idioms gate ticked.
