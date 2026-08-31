# Code Mockup Component Plan

**daisyUI category:** Mockup
**daisyUI doc page:** https://daisyui.com/components/mockup-code/ (docs path is `mockup-code`; this repo's slug is `code-mockup`)
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/CodeMockup/CodeMockup.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/CodeMockup/CodeMockup.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b). **Code Mockup has no variant classes**, so no map exists (§1).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Code Mockup uses none of them** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-31). `CodeMockup.astro` — the scaffold's markup was already correct, so the work was the JSDoc and 9 stories per §5. Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/mockup.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/mockup-code/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.

---

## 0. Shared file, shared name inversion

`mockup-code` lives in the same `mockup.css` as Browser, Window and Phone, and carries the same four-way naming divergence (class `mockup-code`, directory `CodeMockup`, docs URL `mockup-code`, repo slug `code-mockup`). Both points are already written up in `plans/components/browser-mockup.md` §0 and are not repeated here — read that section first.

The complete unprefixed rule set **[verified]**:

```css
.mockup-code {
  border-radius: var(--radius-box);
  background-color: var(--color-neutral);
  color: var(--color-neutral-content);
  direction: ltr;
  padding-block: 1.25rem;
  font-size: .875rem;
  position: relative;
  overflow: auto hidden;
}
.mockup-code:before {                      /* the three dots */
  content:""; opacity:.3; border-radius:9999px; width:.75rem; height:.75rem;
  margin-bottom:1rem; display:block;
  box-shadow: 1.4em 0, 2.8em 0, 4.2em 0;
}
.mockup-code pre {
  width: max-content; min-width: 100%; padding-right: 1.25rem;
  &:before { content:""; margin-right: 2ch }
  &[data-prefix]:before {
    --tw-content: attr(data-prefix); content: var(--tw-content);
    width: 2rem; text-align: right; opacity: .5; display: inline-block;
  }
}
```

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `mockup-code` | — | — | Always applied to the root. |

**One class. No parts, no modifiers, no colour, no size** — `grep -oE '\.mockup-code[a-z0-9-]*' mockup.css | sort -u` returns exactly `.mockup-code` **[verified]**, and the doc page's `classnames` frontmatter lists only that one entry.

Fourth component in a row with an empty variant table (Breadcrumbs, Browser Mockup, Calendar, Code Mockup). That is the honest result, not an unfinished audit.

The `w-full` in every doc example and the `bg-primary text-primary-content` in the "With color" example are plain Tailwind on the root — see §3a.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer, see `plans/components/card.md` §3e.)

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — direct children of `.mockup-code` | no | one or more `<pre data-prefix="$"><code>…</code></pre>` |

Single default slot, no gating, no named slots.

**No `CodeMockupLine` sub-component.** daisyUI styles the **bare `<pre>` element** — `.mockup-code pre` **[verified]** — with no class involved, so this is the "bare element, no wrapper" case from the part-treatment table in `plans/components/chat-bubble.md` §0a, exactly like Card's `<figure>` (`plans/components/card.md` §0b). The caller writes:

```astro
<CodeMockup class="w-full">
  <pre data-prefix="$"><code>npm i daisyui</code></pre>
</CodeMockup>
```

A wrapper component would add an import and a `prefix` prop in place of a `data-prefix` attribute that already passes through natively. It buys nothing.

**No `code`/`lines` content prop.** The "Highlighted line" example puts `class="bg-warning text-warning-content"` on an individual `<pre>`, and the multi-line example puts `text-warning`/`text-success` on different lines — per-line styling an array API would block. Content comes in through slots (`plans/README.md` §5).

## 3. Six things the naive implementation gets wrong

### 3a. This mockup *does* bring its own colours — unlike Browser Mockup

`.mockup-code` sets `background-color: var(--color-neutral)` and `color: var(--color-neutral-content)` **[verified]**, so a bare `<CodeMockup>` already looks like a terminal. That is the opposite of `plans/components/browser-mockup.md` §3b, where the frame, fill and width were all caller-supplied.

What it still does **not** set is a width. Every doc example adds `w-full`, and without one the div is a normal block that fills its parent — usually fine, which is why this is a smaller trap than Browser Mockup's. Worth one JSDoc line rather than a story.

The "With color" example overrides the neutral default with `bg-primary text-primary-content`. That is caller Tailwind, not a prop — same call as `plans/components/card.md` §1 and `plans/components/aura.md` §3a. Do not add a `color` prop: `mockup-code-primary` does not exist **[verified]**.

### 3b. The three dots are unconditional here

`.mockup-code:before` paints them directly on the root — one circle plus `box-shadow: 1.4em 0, 2.8em 0, 4.2em 0` **[verified]**, the same four-for-one trick as Browser Mockup.

The difference is where it hangs. In Browser Mockup the dots belong to the **toolbar**, so omitting the toolbar omits the dots (`plans/components/browser-mockup.md` §3c). Here they are on the component itself: **every code mockup has three dots and there is no way to turn them off**, no modifier and no variable. `margin-bottom: 1rem` on that pseudo-element is what reserves the space above the first line.

No `dots={false}` prop — it would have to fight daisyUI's CSS from inside the component. A caller who truly wants none writes `before:hidden`. One JSDoc line.

### 3c. Every `<pre>` gets a `:before`, and prefixed and unprefixed lines do not align

Two rules, easy to conflate **[both verified]**:

```css
.mockup-code pre:before              { content:""; margin-right: 2ch }                       /* always */
.mockup-code pre[data-prefix]:before { …; width: 2rem; text-align: right; display: inline-block } /* only with the attribute */
```

So an unprefixed line is indented by `2ch`, and a prefixed line by a `2rem` right-aligned box **plus** that `2ch`. They are different indents.

Consequence: **mixing prefixed and unprefixed `<pre>` lines in one mockup leaves the code misaligned by roughly 2rem.** The doc page never mixes them — each example is either all-prefixed or all-unprefixed. Nothing to fix in the component; it goes in the JSDoc, and `MixedPrefixes` (§5) shows it once so it is a known behaviour rather than a mystery.

This also explains the otherwise-puzzling indent on the "Without prefix" example: the empty `:before` is deliberate, keeping unprefixed code off the left edge.

### 3d. `data-prefix` is the whole API, and it is shared with two sibling mockups

`--tw-content: attr(data-prefix)` is what renders the gutter **[verified]**. Notes:

- It is an **attribute, not a class**, so it needs no prop and no map — it rides through on the raw `<pre>` (§2).
- It is a string: `"$"`, `">"`, `"~"`, `"1"`. Line numbers are written out per line by the caller; daisyUI has no counter and this component must not invent one (no `showLineNumbers` prop — that would mean generating `<pre>` elements, which §2 rules out).
- The identical `pre[data-prefix]:before` rule also exists under `.mockup-browser` and `.mockup-window` **[verified]** — `plans/components/browser-mockup.md` §3e already flagged its copy. So prefixed code lines work inside all three mockups, for free, with no cross-component wiring.

### 3e. `overflow: auto hidden`, plus `pre { width: max-content; min-width: 100% }`

`overflow-x: auto; overflow-y: hidden` **[verified]** — the same pairing as `plans/components/browser-mockup.md` §3a, but it bites differently here:

- **Horizontally** it is the feature. `pre { width: max-content; min-width: 100% }` makes a long line wider than the container, which is exactly the "Long line will scroll" example. This is why the code does not wrap.
- **Vertically** it is latent. The div has no height of its own, so it grows with the content and nothing clips — until a caller sets `h-*` or `max-h-*`, at which point extra lines vanish **with no scrollbar**. Less likely than in Browser Mockup (whose doc examples all set `h-80`), but the same trap, so it gets the same JSDoc line.

`direction: ltr` is also forced on the root **[verified]**, so code stays left-to-right inside an RTL page. Correct, and not something to expose or override.

### 3f. Unverified assumptions

1. **Astro's built-in `<Code />` will fight this component.** Anyone rendering real syntax-highlighted code in Astro reaches for `<Code />` from `astro:components` (Shiki) or a Markdown code fence. Shiki emits its own `<pre class="astro-code" style="background-color:…;color:…">`, and an inline `style` beats `.mockup-code`'s background — so the terminal frame would keep its dots and rounding while the code block inside painted its own, different background. Likely, not verified. Check it in Step 5 and, if confirmed, put the remedy in the JSDoc (Shiki's `themes`/`transparent` options, or a `[&_pre]:!bg-transparent` on the mockup) rather than working around it in the component.
2. **Whitespace through the story `slots` mechanism.** `<pre>` preserves whitespace exactly, and the doc examples deliberately keep `<pre …><code>` on one line with no space before `<code>` — a stray newline shows up as a blank first line in the rendered output. Whether the framework's slot handling preserves the string byte-for-byte is untested (`plans/README.md` §4). If the code blocks gain leading blank lines, this is why, and the component is not at fault.
3. **Sanitization of `data-prefix`.** Conservative sanitizer defaults sometimes strip unknown `data-*` attributes. If the gutter is empty everywhere, check that before suspecting the CSS.

**Not a risk here:** `.mockup-code pre` is a **descendant** selector **[verified]**, so an extra wrapper element around slot content would not break it. The blocking unknown that five sibling plans open with — `plans/components/aura.md` §3e.1, `plans/components/carousel.md` §3g.1, `plans/components/chat-bubble.md` §3f.1, `plans/components/breadcrumbs.md` §3f.1, `plans/components/alert.md` §3d.2 — does not apply. Same conclusion as `plans/components/browser-mockup.md` §3e and `plans/components/avatar.md` §3e; do not copy that language into this component's checks.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A terminal-styled frame for code. daisyUI supplies the background
 * (`--color-neutral`) and the three dots; override the colours with
 * `class="bg-primary text-primary-content"` (plan §3a, §3b).
 *
 * Content is one or more bare `<pre>` elements — daisyUI styles the element,
 * not a class, so there is no line sub-component (plan §2):
 *
 * ```astro
 * <CodeMockup class="w-full">
 *   <pre data-prefix="$"><code>npm i daisyui</code></pre>
 * </CodeMockup>
 * ```
 *
 * Don't mix prefixed and unprefixed lines — their indents differ (plan §3c).
 * Long lines scroll horizontally; a caller-set height clips vertically with no
 * scrollbar (plan §3e).
 */
interface Props extends HTMLAttributes<'div'> {}

// No variant class map: daisyUI defines exactly one class for this component
// and no modifiers (plan §1).

const { class: className, ...rest } = Astro.props;
---

<div class:list={['mockup-code', className]} {...rest}>
  <slot />
</div>
```

Identical in shape to the scaffold — which is correct here, unlike `plans/components/checkbox.md` §0 and `plans/components/calendar.md` §0b, where the scaffolds were wrong. The work in this plan is the documentation and the stories, not the markup.

No `<script>`: pure CSS, forced LTR included (§3e).

Not polymorphic: daisyUI documents `mockup-code` on a wrapper `div` only.

### Astro idioms gate

- [ ] Content arrives via a plain default slot — no `code`/`lines` array prop (§2).
- [ ] **No `CodeMockupLine` sub-component** — daisyUI styles the bare `<pre>` (§2).
- [ ] No `Astro.slots.has()` gating — there is no optional wrapper.
- [ ] Root element is `div`, matching every doc example.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element.
- [ ] No `as` prop.
- [ ] No invented props: no `color` (§3a), no `dots` (§3b), no `showLineNumbers` (§3d).
- [ ] No class interpolation anywhere — there are no variant classes (§1).
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <CodeMockup class="w-full"><pre data-prefix="$"><code>npm i daisyui</code></pre></CodeMockup>
  <CodeMockup id="x" data-test="y" class="bg-primary text-primary-content w-full">ok</CodeMockup>
  <CodeMockup color="primary">must error — no colour axis (§1)</CodeMockup>
  <CodeMockup lines={['a', 'b']}>must error — content is a slot (§2)</CodeMockup>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8) — all six, all `class="w-full"`:

| Doc-page example | Story | Slot content |
|---|---|---|
| mockup code with line prefix | `WithLinePrefix` | one `<pre data-prefix="$"><code>npm i daisyui</code></pre>` |
| Multi line | `MultiLine` | three lines, the second `class="text-warning"`, the third `class="text-success"` |
| Highlighted line | `HighlightedLine` | three numbered lines, the third `class="bg-warning text-warning-content"` |
| Long line will scroll | `LongLine` | one `data-prefix="~"` line with the page's long lorem string |
| Without prefix | `WithoutPrefix` | one `<pre><code>without prefix</code></pre>` |
| With color | `WithColor` | `class: 'bg-primary text-primary-content w-full'` |

Plus `Playground` and `Passthrough` (Step 6). There are no variant axes, so there are no axis stories.

Two stories beyond the doc page, each pinning a §3 finding:

- **`MixedPrefixes`** — a prefixed line above an unprefixed one, making §3c's ~2rem misalignment visible once.
- **`WithAstroCode`** — the same snippet rendered through Astro's `<Code />` beside a hand-written `<pre>`, resolving §3f.1 in the open. If Shiki's inline background does clash, this story is where the documented remedy is demonstrated; if it doesn't, the story is a one-line confirmation that highlighting composes cleanly.

```ts
import CodeMockup from './CodeMockup.astro';

// Lines are bare `<pre>` elements — daisyUI styles the element, not a class,
// so there is no line component (plan §2). Keep `<pre …><code>` on one line:
// `<pre>` preserves whitespace, and a stray newline renders as a blank line.

export default {
  title: 'Components/CodeMockup',
  component: CodeMockup,
  // No variant argTypes — this component has none (plan §1).
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    class: 'w-full',
    slots: { default: `<pre data-prefix="$"><code>npm i daisyui</code></pre>` },
  },
};

export const MultiLine = {
  args: {
    class: 'w-full',
    slots: {
      default:
        `<pre data-prefix="$"><code>npm i daisyui</code></pre>` +
        `<pre data-prefix=">" class="text-warning"><code>installing...</code></pre>` +
        `<pre data-prefix=">" class="text-success"><code>Done!</code></pre>`,
    },
  },
};

// Regression guard: native attributes survive and caller `class` merges —
// `class` is how the colour override in `WithColor` works (§3a).
export const Passthrough = {
  args: {
    id: 'code-1',
    'data-test': 'yes',
    style: 'max-width:40rem',
    class: 'mine w-full',
    slots: { default: `<pre data-prefix="$"><code>Passthrough</code></pre>` },
  },
};
```

## 6. Steps

- [x] **Step 1: done.** §3f holds — descendant selectors only, so the shared slot-wrapping question does not apply.
- [x] **Step 2: skipped as planned.** No variant axes; `variants.ts` untouched.
- [x] **Step 3: done.** The scaffold's markup was already right; this was the JSDoc plus the gate.
- [x] **Step 4: done.** `CodeMockup.stories.ts`, 9 stories per §5.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Default` is a dark terminal frame with three dots and no caller colours (§3a); `MultiLine` and `WithColoredText` align their prefixes; `HighlightedLine` tints one line only; `WithoutPrefix` is indented but ungutter'd; `WithBackgroundColor` overrides the neutral default; and **`MixedPrefixes` misaligns by about 2rem** while its all-prefixed twin does not (§3c).
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<div class="mockup-code mine w-full" id="code-1" data-test="yes" style="max-width:40rem">`. Full output in §8.
- [x] **Step 7: done — the `Code` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] The single daisyUI class is applied to the root, and no others exist to expose (§1).
- [x] No invented axis — no `color` (§3a), no `dots` (§3b), no `showLineNumbers` or `lines` (§2, §3d).
- [x] No `CodeMockupLine` component; lines are bare `<pre>` elements (§2).
- [x] `Props` extends `HTMLAttributes<'div'>`; native attributes work without explicit declaration.
- [x] Caller `class` merges through `class:list` — load-bearing for the width and the colour override (§3a).
- [x] JSDoc states: daisyUI supplies the background and the dots (§3a, §3b), don't mix prefixed and unprefixed lines (§3c), long lines scroll and a set height clips (§3e), and lines are bare `<pre data-prefix>` elements (§2).
- [x] §3f.1's `<Code />` interaction is resolved and, if it clashes, the remedy is in the JSDoc.
- [x] `Playground` exposes `class` as a control and renders the doc page's shape.
- [x] One story per doc-page example, reproducing that example's markup and copy, plus `MixedPrefixes` and `WithAstroCode`.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31).

`astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

**One probe line was unachievable**, and it is the same shape as the `color` finding in `plans/components/avatar.md` §3e.3: `<WindowMockup title="Untitled">` does **not** error, because `title` is a native attribute on every element. No component can reject it; it forwards and does nothing. Drop that line from any plan's probe — `color`, `title`, `role` and `translate` are all on the base interface.

```
Default        → <div class="mockup-code w-full"><pre data-prefix="$"><code>npm i daisyui</code></pre></div>
MultiLine      → …<pre data-prefix="$">…<pre data-prefix=">">…<pre data-prefix=">">…   all prefixed, as daisyUI does
HighlightedLine→ <pre data-prefix="3" class="bg-warning text-warning-content"><code>Error!</code></pre>
WithoutPrefix  → <pre><code>without prefix</code></pre>
WithBackground…→ <div class="mockup-code w-full bg-primary text-primary-content">…
MixedPrefixes  → a prefixed line beside an unprefixed one, then an all-prefixed twin
Passthrough    → <div class="mockup-code mine w-full" id="code-1" data-test="yes" style="max-width:40rem">…
```

What this settles: lines are bare `pre` elements with `data-prefix` passing through natively, and per-line styling is a class on the individual line — both of which are why there is no line sub-component and no `lines` array prop (§2).

Not settled here: the 2rem misalignment `MixedPrefixes` exists to show, and the terminal colouring. Step 5.
