# Accordion Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/accordion/
**Root element:** `div` (wrapper `Accordion`); `div` or `details` per `trigger` (item `AccordionItem`)
**Target files:** `packages/daisy-astro/src/components/Accordion/Accordion.astro`, `packages/daisy-astro/src/components/Accordion/AccordionItem.astro` (`Accordion.astro` is currently a dummy scaffold; `AccordionItem.astro` does not exist yet)
**Story files:** `packages/daisy-astro/src/components/Accordion/Accordion.stories.ts`, `packages/daisy-astro/src/components/Accordion/AccordionItem.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` / `HTMLAttributes<'details'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare. **Accordion uses none of them** (see §1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented yet. Facts marked **[verified]** were checked against `daisyui@5.7.22`'s shipped CSS and `astro@7.2.4`'s typings during planning; items in §3d are explicitly **unverified** and are prototype checks for Step 3.


> **Status:** **Implemented** (2026-08-31) — **as one thin wrapper, not two components.**
>
> `plans/components/collapse.md` §0a supersedes the item half of this plan, and that is now executed: **`AccordionItem.astro` does not exist and will not be built.** §1's variant table, §2's slot table, §3a/§3b's per-item mechanics and §4's `AccordionItem.astro` listing all moved to `plans/components/collapse.md` and are **superseded here** — read them there, where they are implemented and verified. What survives in this plan is what is genuinely about *grouping*: §0a's "the wrapper cannot inject the shared `name`", §3c's join pairing, and the group stories.
>
> Two corrections to what survives: **§3c's candidate simplification works**, so the wrapper classes its own children and nothing takes a `join` prop (§3e); and §3d's three unknowns are all answered (§3e). 7 stories. Step 5 (visual pass) is open.
---

## 0. Why this component is two files

daisyUI has **no `accordion` class**. Grep of `daisyui@5.7.22/components/collapse.css` returns exactly 7 class names — `collapse`, `collapse-title`, `collapse-content`, `collapse-arrow`, `collapse-plus`, `collapse-open`, `collapse-close` — and nothing else **[verified]**. "Accordion" is the doc page for *N `.collapse` items sharing a `name`*, where the shared name is what makes opening one close the others. The grouping is emergent, not a class.

That leaves the group with only one piece of real markup to own — the `join join-vertical` wrapper from the doc page's last example — so:

Both files live in `src/components/Accordion/` — one directory per daisyUI component, sub-components included (`plans/README.md` §3b).

| File | Renders | Owns |
|---|---|---|
| `Accordion.astro` | `<div>`, optionally `class="join join-vertical"` | the group: vertical join grouping, and the documented place where the shared `name` convention is explained |
| `AccordionItem.astro` | one `.collapse` (`div` + radio `input`, or `details` + `summary`) | every daisyUI modifier from §1 |

### 0a. The wrapper cannot inject the shared `name` — accepted cost

Astro has no context API: a component cannot pass values to components the *caller* placed in its slot. `Astro.slots.render()` returns already-rendered HTML, so the only way to push `name` down would be to regex-rewrite that string — fragile, and rejected.

**So `name` is a required prop on every `AccordionItem` and repeats at each call site.** This is a known ergonomic cost of the wrapper+item shape, chosen deliberately. Do not "fix" it later with `Astro.locals` (request-scoped, so nested accordions on one page clobber each other) or with HTML string rewriting.

```astro
<Accordion join>
  <AccordionItem name="faq" open>…</AccordionItem>
  <AccordionItem name="faq">…</AccordionItem>   <!-- name repeats. intended. -->
</Accordion>
```

## 1. Variant audit

Full class list, read from the doc page's class table and cross-checked against `node_modules/daisyui/components/collapse.css` (v5.7.22) on 2026-08-29. 7 classes: 1 base + 2 part + 4 modifier. All 7 are covered below.

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `collapse` | — | — | Always applied to the item root. |
| Part | `collapse-title` | — | — | Wrapper for the `title` slot (§2). Not a prop. |
| Part | `collapse-content` | — | — | Wrapper for the `default` slot (§2). Not a prop. |
| Icon | `collapse-arrow` `collapse-plus` | `icon` | `'arrow' \| 'plus'` | Mutually exclusive — a union makes the invalid pair unrepresentable, same reasoning as Button's `shape`/`width` (`plans/components/button.md` §1). Component-specific, stays local. |
| Force state | `collapse-open` `collapse-close` | `force` | `'open' \| 'close'` | Also mutually exclusive. Overrides the input/details state entirely: `collapse-close` beats a checked radio, `collapse-open` beats an unchecked one **[verified — `&:not(.collapse-close):has(> input:checked)` gates every open rule in the CSS]**. Named `force`, not `state`, because it forces rather than reports. |

**No color axis, no size axis.** `DaisyColor` and `DaisySize` are not imported — `collapse.css` defines no `collapse-primary`, no `collapse-lg`. Background and border in every doc example come from plain Tailwind/daisyUI utilities (`bg-base-100 border border-base-300`) passed through `class`, not from a component prop. Do not invent a `color` prop for this component.

### 1a. Non-class props (structure, not modifiers)

These are not daisyUI classes; they select which markup daisyUI documents.

| Prop | Type | Default | Effect |
|---|---|---|---|
| `trigger` | `'radio' \| 'details'` | `'radio'` | `radio` → `<div class="collapse"><input type="radio" name=…>`; `details` → `<details class="collapse" name=…><summary class="collapse-title">`. Both are first-class daisyUI examples. |
| `name` | `string` (**required**) | — | Radio: the `<input name>`. Details: the `<details name>`. Items sharing it form one accordion. |
| `open` | `boolean` | `false` | Radio: `checked` on the input. Details: `open` on the `<details>`. One prop, two attributes — see §3b. |
| `join` | `boolean` | `false` | Adds `join-item`, required when inside `<Accordion join>` — see §3c. |

## 2. Slots

### `AccordionItem`

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `title` | `div.collapse-title` (radio) / `summary.collapse-title` (details) | no | `<div class="collapse-title font-semibold">How do I create an account?</div>` |
| `default` | `div.collapse-content` | no | `<div class="collapse-content text-sm">Click the "Sign Up" button…</div>` |

Neither is gated with `Astro.slots.has()`. Both wrappers appear in every example on the page, and an accordion item with no title or no content has no meaning — this is the "single required structure" case, not the optional-styled-wrapper case `plans/README.md` §5 is about. No fallback content: daisyUI's examples show real copy, not placeholders.

`font-semibold` and `text-sm` in the doc markup are **caller styling, not component styling** — they are plain Tailwind, not part of `collapse.css`. Stories reproduce them via the title/content slot content's own wrapper or via `class`; the component does not hardcode them.

**`title` is a slot, never a prop.** `title` is a global HTML attribute present on Astro's base `HTMLAttributes` **[verified — `astro-jsx.d.ts` base interface declares `title?: string`]**, so a prop by that name would collide exactly the way Button's `style` did (`plans/components/button.md` §3a). As a slot it cannot collide: slots and props are separate namespaces.

### `Accordion`

Single default slot, holding the `AccordionItem`s. No gating.

## 3. Four things the naive implementation gets wrong

### 3a. `name` is not passthrough — and it lands on a different element per trigger

For `trigger="radio"` the root is a `<div>` and `name` belongs on the **child `<input>`**, not the root. For `trigger="details"` the root **is** the `<details>` and `name` belongs on the root. A component that just spreads `...rest` onto the root gets the radio form silently wrong: `<div name="faq">` is a meaningless attribute and the inputs end up unnamed, so every item opens independently and it is not an accordion at all — while looking completely normal until you click a second item.

So `name` is destructured out and placed explicitly per branch. This is safe from the Button §3a trap because Astro's base `HTMLAttributes` (and therefore `HTMLAttributes<'div'>`) declares **no** `name` **[verified]** — nothing is being stolen from `...rest` in the radio case. In the details case `name` *is* native (`DetailsHTMLAttributes` declares `name?: string` **[verified — `astro-jsx.d.ts:708`]**) but is re-applied explicitly, so nothing is lost.

### 3b. `open` maps to two different attributes

Radio form uses `checked` on the input; details form uses `open` on the `<details>`. Exposing both props would let a caller set the one that does nothing for their trigger and get silence. One `open` prop, branched internally:

- `trigger="radio"` → `<input type="radio" checked={open} …>`
- `trigger="details"` → `<details open={open} …>`

`DetailsHTMLAttributes` declares `open?: boolean | string` **[verified — `astro-jsx.d.ts:707`]**, and base `HTMLAttributes` declares neither `open` nor `checked` **[verified]**, so the explicit prop is additive on the div branch and a re-application on the details branch.

Note the semantic difference the caller inherits from HTML, which the component does not paper over: `<details name>` is browser-native exclusive-accordion behaviour, and radio exclusivity comes from the radio group. Both give one-open-at-a-time; the details form additionally allows *all* closed by clicking the open item, while a checked radio cannot be unchecked by clicking it. That is daisyUI's/HTML's behaviour, not a bug to fix in the wrapper.

### 3c. `join` has to be a prop on the item, not just the wrapper

daisyUI's join example puts `join-item` on **each** `.collapse`, and `join join-vertical` on the parent:

```html
<div class="join join-vertical bg-base-100">
  <div class="collapse collapse-arrow join-item border-base-300 border">…</div>
</div>
```

Per §0a the wrapper cannot reach its slotted children, so `<Accordion join>` alone cannot add `join-item`. Each item therefore takes `join` too, and the two must be set together.

**Candidate simplification to test in Step 3, not to assume:** give the wrapper `class:list={['join', 'join-vertical', '[&>*]:join-item']}` so the child class comes from an arbitrary Tailwind variant on the parent and `AccordionItem` needs no `join` prop at all. `[&>*]:join-item` is a literal in source, so §1b's tree-shaking constraint is satisfied in principle — but that it actually emits daisyUI's `join-item` rules under Tailwind 4 + the `@source` setup is **unverified**. Check the generated CSS before adopting; keep the explicit `join` prop on the item if it doesn't emit.

### 3d. Unverified assumptions — resolve these in Step 1/Step 3, don't build on them

1. **Slot content with props.** `plans/README.md` §4 records that slot content may be "another Astro component", but the framework's shipped typings do not describe the shape (`slots?: string[]` is the only reference in `dist/*.d.ts` **[verified]**), and passing a component *with its own props and nested slots* is untested here. §5 assumes it does **not** work and uses HTML strings for the group stories; switch them to components if it does.
2. **Slot sanitization stripping `<input>`.** The framework sanitizes slot HTML with conservative defaults (`plans/README.md` §4). The group stories pass `<input type="radio">` inside slot HTML, which is exactly the kind of element a conservative sanitizer drops — and a dropped input degrades to a permanently-closed collapse that still *looks* right. If group stories render but never open, check the Sanitization guide before touching the component.
3. **`[&>*]:join-item`** — see §3c.

### 3e. What Step 1 and Step 3 actually found

**2026-08-31**, resolving §3d's three unknowns and §3c's candidate.

1. **`[&>*]:join-item` emits, so §3c's candidate wins.** The built stylesheet
   contains `.\[\&\>\*\]\:join-item>*{border-style:solid; …}` with
   `join-item`'s full declaration block and its sibling rules. Tailwind 4
   composes daisyUI's class under an arbitrary variant with this `@source`
   setup. So `<Accordion join>` renders
   `class="join join-vertical [&>*]:join-item"` and classes its own children —
   **the item needs no `join` prop, and `Collapse` no longer has one**
   (`plans/components/collapse.md` §3i). §3c's "keep the explicit prop if it
   doesn't emit" branch is dead.
2. **Slot content with props works** (§3d.1). The group stories pass real
   `Collapse` components with their own props *and* named slots, nested inside
   `Accordion`'s slot. §5's HTML-string fallback is not needed and is not used.
3. **The sanitizer strips nothing** (§3d.2) — sanitization is disabled
   library-wide (`.storybook/main.ts`), so `<input type="radio">` reaches the
   output. The hazard this plan predicted — a stripped input degrading to a
   permanently-closed collapse that still looks right — cannot occur here.

**What did not change:** §0a's accepted cost. Astro still has no context API,
so `name` still repeats on every item, and the stories build their items from
an array precisely because of it.

## 4. Component implementation

### `AccordionItem.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type AccordionTrigger = 'radio' | 'details';
type AccordionIcon = 'arrow' | 'plus';
type AccordionForce = 'open' | 'close';

interface Props extends HTMLAttributes<'div'> {
  /** Shared across the items of one accordion. Repeats per item — see plan §0a. */
  name: string;
  trigger?: AccordionTrigger;
  /** `checked` on the radio, `open` on the `<details>` — see plan §3b. */
  open?: boolean;
  icon?: AccordionIcon;
  /** Forces state regardless of the input — see plan §1. */
  force?: AccordionForce;
  /** Set together with `<Accordion join>` — see plan §3c. */
  join?: boolean;
}

// Full literal class names. NEVER `collapse-${icon}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const ICON: Record<AccordionIcon, string> = {
  arrow: 'collapse-arrow',
  plus: 'collapse-plus',
};

const FORCE: Record<AccordionForce, string> = {
  open: 'collapse-open',
  close: 'collapse-close',
};

const {
  name,
  trigger = 'radio',
  open = false,
  icon,
  force,
  join = false,
  class: className,
  ...rest
} = Astro.props;

const classes = [
  'collapse',
  icon && ICON[icon],
  force && FORCE[force],
  { 'join-item': join },
  className,
];
---

{
  trigger === 'details' ? (
    <details class:list={classes} name={name} open={open} {...rest}>
      <summary class="collapse-title">
        <slot name="title" />
      </summary>
      <div class="collapse-content">
        <slot />
      </div>
    </details>
  ) : (
    <div class:list={classes} {...rest}>
      <input type="radio" name={name} checked={open} />
      <div class="collapse-title">
        <slot name="title" />
      </div>
      <div class="collapse-content">
        <slot />
      </div>
    </div>
  )
}
```

No `<script>`: daisyUI drives both forms in pure CSS, and it already hides the `<details>` marker itself (`summary { &::-webkit-details-marker { display: none } }`) and animates `::details-content` **[verified in `collapse.css`]**. Adding JS here would duplicate working CSS — `plans/README.md` §6.

`Props` is not polymorphic (`Polymorphic<{ as }>`) even though two root elements are possible: the root is chosen by `trigger`, which also changes the internal markup, so it is not a free "render me as any tag" axis. The cost is that `details`-only native attributes beyond `name`/`open` are not type-visible; that set is empty in practice.

### `Accordion.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
  /** Renders the doc page's `join join-vertical` grouping — see plan §3c. */
  join?: boolean;
}

const { join = false, class: className, ...rest } = Astro.props;
---

<div class:list={[{ join: join, 'join-vertical': join }, className]} {...rest}>
  <slot />
</div>
```

Deliberately thin: daisyUI has no wrapper class, so inventing one would be markup this library made up. Without `join` the wrapper is a plain `<div>` that exists to hold the group and carry the caller's own layout classes.

### Astro idioms gate

Check each before considering §4 done (`plans/README.md` §6):

- [ ] Content arrives via slots (`title`, default), not content props.
- [ ] No optional styled wrapper needing `Astro.slots.has()` — both parts are required (§2).
- [ ] Root element matches daisyUI's example per trigger: `div` + radio `input`, or native `<details>` + `<summary>`. No div-plus-JS substitute.
- [ ] No `<script>` added — daisyUI handles both forms in CSS.
- [ ] `...rest` spread onto the root element in **both** branches.
- [ ] `name` and `open` applied explicitly per branch, not left to `...rest` (§3a, §3b).
- [ ] No variant prop collides with a native attribute: `title` is a slot not a prop (§2); base `HTMLAttributes` has no `name`/`open`/`checked`/`icon`/`force`/`join` **[verified]**.
- [ ] Every variant class is a full literal in a `Record` map — no `` `collapse-${icon}` `` anywhere.
- [ ] Not a generic component, so §5c's `type Props`-before-`const` rule is advisory here — but the order is kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <AccordionItem name="faq">ok</AccordionItem>
  <AccordionItem name="faq" trigger="details" open icon="plus">ok</AccordionItem>
  <AccordionItem>must error — name is required</AccordionItem>
  <AccordionItem name="faq" icon="chevron">must error — not an icon value</AccordionItem>
  <AccordionItem name="faq" color="primary">must error — no color axis (§1)</AccordionItem>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two story files. `AccordionItem.stories.ts` is the props-driven one (every axis from §1); `Accordion.stories.ts` covers grouping, where multiple items are needed at once.

Doc-page examples, in page order (`plans/README.md` §8):

| Doc-page example | Story | File | Slots / props |
|---|---|---|---|
| Accordion using radio inputs | `UsingRadioInputs` | `Accordion.stories.ts` | 3 items, shared `name="my-accordion-1"`, first `open` |
| Accordion using details | `UsingDetails` | `Accordion.stories.ts` | 3 items, `trigger="details"`, `name="my-accordion-det-1"`, first `open` |
| Accordion with arrow icon | `WithArrowIcon` | `Accordion.stories.ts` | as above + `icon="arrow"`, `name="my-accordion-2"` |
| Accordion with plus/minus icon | `WithPlusMinusIcon` | `Accordion.stories.ts` | as above + `icon="plus"`, `name="my-accordion-3"` |
| Using Accordion and Join together | `WithJoin` | `Accordion.stories.ts` | `<Accordion join>` + 3 items with `join`, `icon="arrow"`, `name="my-accordion-4"` |

Plus, for axes the page shows only as a class table: `Playground`, `Icons` (none/arrow/plus), `ForceState` (`collapse-open` / `collapse-close`), and `Passthrough` (Step 6).

The doc page's per-item copy is reused verbatim across every example, so it is hoisted to one constant:

```ts
export const ITEMS = [
  ['How do I create an account?', 'Click the "Sign Up" button in the top right corner and follow the registration process.'],
  ['I forgot my password. What should I do?', 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.'],
  ['How do I update my profile information?', 'Go to "My Account" settings and select "Edit Profile" to make changes.'],
] as const;
```

### `AccordionItem.stories.ts`

```ts
import AccordionItem from './AccordionItem.astro';

export default {
  title: 'Components/AccordionItem',
  component: AccordionItem,
  argTypes: {
    name: { control: 'text' },
    trigger: { control: 'radio', options: ['radio', 'details'] },
    open: { control: 'boolean' },
    icon: { control: 'select', options: [undefined, 'arrow', 'plus'] },
    force: { control: 'select', options: [undefined, 'open', 'close'] },
    join: { control: 'boolean' },
  },
};

export const Playground = {
  args: {
    name: 'playground',
    open: true,
    icon: 'arrow',
    class: 'bg-base-100 border border-base-300',
    slots: {
      title: 'How do I create an account?',
      default: 'Click the "Sign Up" button in the top right corner and follow the registration process.',
    },
  },
};

// Regression guard: native attributes must survive, caller `class` must merge.
export const Passthrough = {
  args: {
    name: 'passthrough',
    id: 'item-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { title: 'Passthrough', default: 'Body' },
  },
};
```

`Icons` and `ForceState` render every value of one axis side by side. Compose multiples the way the framework's docs recommend (a decorator or a wrapping story) — check that before inventing a helper.

### `Accordion.stories.ts`

Group stories need three items inside one slot. §3d.1 says component-with-props slot content is unverified, so these pass the doc page's markup as HTML strings — which is also what makes them a direct visual diff against the doc page (§8). Convert them to `AccordionItem` components if Step 1 shows that works.

```ts
import Accordion from './Accordion.astro';

const item = (title: string, body: string, name: string, extra = '', checked = false) =>
  `<div class="collapse ${extra} bg-base-100 border border-base-300">
     <input type="radio" name="${name}"${checked ? ' checked="checked"' : ''} />
     <div class="collapse-title font-semibold">${title}</div>
     <div class="collapse-content text-sm">${body}</div>
   </div>`;
```

…with `UsingRadioInputs`, `WithArrowIcon` (`extra: 'collapse-arrow'`), `WithPlusMinusIcon` (`extra: 'collapse-plus'`), a `<details>` variant for `UsingDetails`, and `WithJoin` passing `args: { join: true }` with `join-item` on each child.

**If the group stories render but clicking never opens an item, read §3d.2 first** — a stripped `<input>` looks exactly like a broken component.

## 6. Steps

- [x] **Step 1: done** — all three of §3d's unknowns answered, with §3c's candidate adopted. See §3e.
- [x] **Step 2: skipped as planned.** No colour or size axis anywhere in this component; `variants.ts` untouched.
- [x] **Step 3: done, reduced to one file.** `Accordion.astro` replaces the scaffold; **`AccordionItem.astro` was not created** (`plans/components/collapse.md` §0a). The wrapper is three lines of markup and carries §0a's `name` caveat in its JSDoc, where a caller meets it.
- [x] **Step 4: done.** `Accordion.stories.ts`, 7 stories, composing the real `Collapse` — not the HTML strings §5 fell back to (§3e.2).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and grouping is the only thing this component does.** Verify: in `UsingRadioInputs`, opening the second item **closes the first** — the whole point of the shared `name`, and the one thing that fails silently; `UsingDetails` does the same and additionally allows **all** closed, which the radio form cannot; and **`WithJoin` is a single bordered stack**, not three separately-rounded boxes, which is §3e.1's variant proving itself in the browser rather than in the stylesheet.
- [x] **Step 6: done — forwarding confirmed at both levels.** `Passthrough` renders `<div class="join join-vertical [&>*]:join-item mine bg-base-100" id="accordion-1" data-test="yes" style="letter-spacing:1px">` around a marked item. Full output in §8.
- [x] **Step 7: done.** The `Accordion` row in `plans/README.md` says Implemented and names the wrapper only; there is no `AccordionItem` row, because there is no such component.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

**Superseded in part.** Every box below about the *item* — the 7 classes, the
trigger branches, `name`/`open` placement, the probe — belongs to
`plans/components/collapse.md` §7 and is ticked there. What remains here is the
group:

- [x] There is **no `AccordionItem.astro`** (`plans/components/collapse.md` §0a).
- [x] `Accordion` renders a plain `div` without `join`, and `join join-vertical [&>*]:join-item` with it (§3c, §3e.1).
- [x] The items need no prop to be joined — the wrapper classes them (§3e.1).
- [x] `class` merges through `class:list`, and native attributes survive (§8).
- [x] The JSDoc states §0a's accepted cost: `name` repeats per item, because a wrapper cannot reach into its own slot content.
- [x] One story per doc-page example, reproducing that example's copy, plus `Playground` and `Passthrough`.
- [ ] Items sharing a `name` are mutually exclusive in the browser (Step 5).


## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 191 files, 0 errors, 0 warnings, 0 hints.

```
UsingRadioInputs → <div class="flex flex-col gap-2">
  <div class="collapse bg-base-100 border border-base-300">
    <input type="radio" name="my-accordion-1" checked autocomplete="off" class="peer">
    <div class="collapse-title font-semibold">How do I create an account?</div>
    <div class="collapse-content text-sm">Click the "Sign Up" button…</div></div> ×3
                                    ↑ one shared name, one checked — §0a
WithJoin         → <div class="join join-vertical [&amp;>*]:join-item bg-base-100">
                     <div class="collapse collapse-arrow border-base-300 border">…
                       ↑ no join prop on the item; the wrapper classes it (§3e.1)
Passthrough      → <div class="join join-vertical [&amp;>*]:join-item mine bg-base-100"
                     id="accordion-1" data-test="yes" style="letter-spacing:1px">
                     <div class="collapse item-marker border-base-300 border" id="item-1"
                     data-test="item">…
```

What this settles:

- **§3e.1 in the output as well as the stylesheet**: the wrapper carries the variant class and the items carry nothing extra, which is the shape §3c hoped for and could not confirm at planning time.
- **§3e.2**: every item is a real `Collapse` component with its own props and two named slots, nested in `Accordion`'s slot. The plan assumed this would not work and wrote an HTML-string helper for it; the helper is unused and unwritten.
- **§0a's cost is visible**: `name="my-accordion-1"` appears once per item, three times per story. That is the repetition Astro's missing context API forces, not an oversight.
- Exactly one item per group renders `checked`, so the initial state is one-open, as the doc page shows.

Not settled here: whether opening one closes the others, and whether the joined stack renders as one bordered block. Both Step 5.
