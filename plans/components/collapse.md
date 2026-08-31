# Collapse Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/collapse/
**Root element:** `div`, or `details` when `trigger="details"` — see §3a
**Target file:** `packages/daisy-astro/src/components/Collapse/Collapse.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Collapse/Collapse.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Collapse uses none of them** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned, and it **supersedes part of `plans/components/accordion.md`** — read §0a first. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/collapse.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/collapse/+page.md` in `saadeghi/daisyui`). §3g lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). `Collapse.astro` and 16 stories, covering all four triggers. §0a's supersede is executed — there is no `AccordionItem`, and `plans/components/accordion.md` is amended. Two additions to §4 are recorded as §3h (the input carries `peer` and `autocomplete="off"`) and one deletion as §3i (**no `join` prop** — §3c's candidate simplification emits, so the queued Join correction lands early). §3g.1 and §3g.4 are answered (§8). Step 5 (visual pass) is open, and it carries every trigger's behaviour.
---

## 0. Collapse and Accordion are the same seven classes

`grep -oE '\.collapse[a-z0-9-]*' collapse.css | sort -u` returns `.collapse`, `.collapse-title`, `.collapse-content`, `.collapse-arrow`, `.collapse-plus`, `.collapse-open`, `.collapse-close` — **the same seven** `plans/components/accordion.md` §0 already audited **[verified]**. There is no `accordion` class; "Accordion" is the doc page for N collapses sharing a radio `name`, and the two pages cross-link to each other.

### 0a. This plan supersedes `AccordionItem`

`plans/components/accordion.md` §0 proposes `AccordionItem.astro` rendering `.collapse` with `trigger: 'radio' | 'details'`. Collapse's own doc page adds two more trigger modes — **focus** and **checkbox** — for the identical markup. Building both components means two files emitting the same seven classes with overlapping-but-different trigger unions.

**Decision: one component, `Collapse.astro`, with `trigger: 'focus' | 'checkbox' | 'radio' | 'details'`.**

| Was | Becomes |
|---|---|
| `Accordion/AccordionItem.astro` | **not built** — `<Collapse trigger="radio" name="faq">` |
| `Accordion/Accordion.astro` | unchanged — the thin `join join-vertical` group wrapper (`plans/components/accordion.md` §4) |
| `Collapse/Collapse.astro` | the single implementation of the seven classes |

Ponytail rung 2: reuse what already exists rather than re-implementing it one directory over. `plans/components/accordion.md` keeps everything that is genuinely about *grouping* — §0a's "the wrapper cannot inject the shared `name`", §3c's `join` pairing, and its group stories — and loses §1's variant table, §3a/§3b's per-item mechanics and §4's `AccordionItem.astro`, all of which move here.

**Action item for Step 7:** amend `plans/components/accordion.md` to point at this file for the item, and update its `plans/README.md` row. This is the second cross-plan correction in the directory, after `plans/components/card.md` §0a's fix to `plans/README.md` §5 — both are deliberate, both get done in Step 7 rather than silently.

## 1. Variant audit

**7 classes: 1 component + 2 part + 4 modifier**, matching the doc page's `classnames` frontmatter exactly.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `collapse` | — | — | Always applied to the root. |
| Part | `collapse-title` | — | — | Wrapper for the `title` slot — a `div`, or a `summary` when `trigger="details"` (§3b). |
| Part | `collapse-content` | — | — | Wrapper for the default slot. |
| Icon | `collapse-arrow` `collapse-plus` | `icon` | `'arrow' \| 'plus'` | Mutually exclusive → union, so the invalid pair is unrepresentable. Local. |
| Force state | `collapse-open` `collapse-close` | `force` | `'open' \| 'close'` | Mutually exclusive → union. **Does not work with `trigger="details"`** — §3e. Named `force`, not `state`, because it forces rather than reports. |

**No colour axis, no size axis** — there is no `collapse-primary`, no `collapse-lg` **[verified]**. Every background and border in every doc example (`bg-base-100 border border-base-300`, `bg-primary text-primary-content`) is plain Tailwind on the root. Do not import `DaisyColor` or `DaisySize`.

### 1a. Structural props — these select markup, not classes

| Prop | Type | Default | Effect |
|---|---|---|---|
| `trigger` | `'focus' \| 'checkbox' \| 'radio' \| 'details'` | `'focus'` | Which of daisyUI's four documented mechanisms to render — §3a. |
| `name` | `string` | — | The radio group. **Required in practice for `trigger="radio"`**; also set as `<details name>` for exclusive details groups (§3c). |
| `open` | `boolean` | `false` | `checked` on the input, or `open` on the `<details>`. No effect in focus mode (§3c). |
| `join` | `boolean` | `false` | Adds `join-item`, for use inside `<Accordion join>` (`plans/components/accordion.md` §3c). |
| `titleClass` | `string` | — | Classes for the `.collapse-title` wrapper — §3d. |
| `contentClass` | `string` | — | Classes for the `.collapse-content` wrapper — §3d. |

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `title` | `div.collapse-title`, or `summary.collapse-title` when `trigger="details"` | no | `How do I create an account?` |
| `default` | `div.collapse-content` | no | `Click the "Sign Up" button…` |

Named slots, not sub-components — and unlike `plans/components/card.md` §0a, that is the right call here for a specific reason: **the title's element depends on `trigger`**. A `CollapseTitle` component could not know whether to render a `<div>` or a `<summary>`, so the caller would have to keep it in sync with the parent's `trigger` by hand, and `trigger="details"` with a `<div>` title is a collapse that simply never opens. Named slots let the component pick the element.

Neither slot is gated with `Astro.slots.has()`: both wrappers appear in every example on both doc pages, and a collapse with no title or no content has no meaning. This is the "single required structure" case, not the optional-styled-wrapper case `plans/README.md` §5 is about.

**`title` is a slot, never a prop** — `title` is a global HTML attribute on Astro's base `HTMLAttributes` **[verified in `plans/components/accordion.md` §2]**, so a prop by that name would collide exactly the way Button's `style` did.

The `font-semibold` and `text-sm` in the doc markup are **caller styling** — plain Tailwind, not part of `collapse.css`. They arrive through `titleClass`/`contentClass` (§3d).

## 3. Seven things the naive implementation gets wrong

### 3a. There are four trigger modes, and focus mode needs `tabindex`

| `trigger` | Markup | Behaviour | Doc examples |
|---|---|---|---|
| `focus` | `<div tabindex="0" class="collapse">` | Opens on focus, **closes on blur** | 6 of the page's examples, including the first |
| `checkbox` | `<div class="collapse"><input type="checkbox">` | Click to open, click again to close | 3 |
| `radio` | `<div class="collapse"><input type="radio" name="…">` | One-open-at-a-time within the group | the Accordion page |
| `details` | `<details class="collapse"><summary class="collapse-title">` | Native disclosure; content is findable by browser find-in-page | 1, and daisyUI recommends it for searchability |

The focus branch is gated on the attribute: `&:is([open], [tabindex]:focus:not(.collapse-close), [tabindex]:focus-within:not(.collapse-close))` **[verified]**. **Without `tabindex` the element is not focusable and the collapse never opens** — no error, just a title that does nothing.

**So the component emits `tabindex="0"` itself when `trigger="focus"`**, destructured with a default so a caller can still override it (the mechanism `plans/components/alert.md` §3b established for `role`). That is what makes `'focus'` a safe default: it matches the doc page's lead example *and* cannot be half-configured. The other three modes each need something the caller must supply — a `name`, or nothing at all for checkbox — and none of them silently no-ops.

Note what focus mode costs the user, and say so in the JSDoc: the panel closes as soon as focus leaves, so it cannot hold interactive content. Checkbox or details is the right choice for anything the reader has to click inside.

### 3b. The title element changes with the trigger, and so does the root

Two element swaps, both driven by one prop:

- root: `<div>` for focus/checkbox/radio, `<details>` for details **[verified — `&:is(details)` has its own rule block]**;
- title: `<div class="collapse-title">` for the first three, `<summary class="collapse-title">` for details.

daisyUI hides the native disclosure marker itself (`&>summary { display:block; &::-webkit-details-marker { display:none } }` **[verified]**) and animates `::details-content` with `interpolate-size: allow-keywords`. So the details path needs **no** extra CSS and no `<script>` from this library.

`Props` is **not** polymorphic (`Polymorphic<{ as }>`) even though two root elements are possible: the root is chosen by `trigger`, which also changes the internal markup, so it is not a free "render me as any tag" axis. Same conclusion, same wording, as `plans/components/accordion.md` §4.

### 3c. `name` and `open` land on different elements per trigger

Carried over from `plans/components/accordion.md` §3a/§3b, which verified both against Astro's typings:

- **`name`** — for `radio` it belongs on the **child `<input>`**, not the root. A component that spreads `...rest` onto the root produces `<div name="faq">`, a meaningless attribute, leaving the inputs unnamed so every item opens independently. For `details` it belongs on the root. Base `HTMLAttributes` declares no `name` **[verified]**, so destructuring it steals nothing; `DetailsHTMLAttributes` does (`name?: string`) and it is re-applied explicitly.
- **`open`** — `checked` on the input, `open` on the `<details>`. One prop, branched internally. **No effect in focus mode**, where the open state is the browser's focus state and nothing else; the JSDoc says so rather than letting it fail quietly.

### 3d. Two doc examples need classes on the parts, so `titleClass`/`contentClass` exist

Named slots hide the wrappers, and two examples style them directly:

- **Moving collapse icon to the start** — `class="collapse-title font-semibold after:start-5 after:end-auto pe-4 ps-12"`. The icon is a `::after` on the title, so repositioning it is a title class and nothing else will do.
- **Custom colors that work with checkbox** — `peer-checked:bg-secondary` on **both** the title and the content.

Hence `titleClass` and `contentClass`, the same escape hatch `plans/components/avatar.md` §3a opened with `innerClass`. `class` keeps merging onto the root, where every example puts the background and border.

Note the difference from Avatar: there, `innerClass` was effectively required because the inner div held all the sizing. Here the part classes are genuinely optional — most examples pass none — so they stay optional and undocumented-by-default beyond one JSDoc line each.

### 3e. `force` does not work with `trigger="details"`

The doc page states it outright, in its own heading for the details example: *"collapse-open and collapse-close doesn't work with this method. You can add/remove open attribute to the details instead."*

The CSS agrees — the open branch is `&:is([open], [tabindex]:focus:not(.collapse-close), …)`, where the `:not(.collapse-close)` guard applies only to the `tabindex` arms, not to `[open]` **[verified]**. So `<details open class="collapse collapse-close">` stays open regardless.

**Modelled as documentation, not as a type error.** A discriminated union on `trigger` would make the invalid pair unrepresentable — the move `plans/components/accordion.md` §1 made for `icon` and `force` individually — but a union `Props` fights `extends HTMLAttributes<'div'>` and the single destructure, complicating every ordinary call to police one combination. Rejected deliberately; the JSDoc on `force` names the exclusion, and `use `open` instead` is the one-line answer.

### 3f. The click-outside example cannot be expressed through this component

The "Collapse with checkbox and close on click outside" example inserts a `<label for="…" class="fixed inset-0 hidden peer-checked:block">` **between the input and the title**, as a following sibling of the `peer` input:

```html
<div class="collapse …">
  <input id="collapse-1-toggle" type="checkbox" class="peer" />
  <label for="collapse-1-toggle" class="fixed inset-0 hidden peer-checked:block"></label>
  <div class="collapse-title …">…</div>
  …
</div>
```

Named slots leave no place for an arbitrary direct child of `.collapse`, and `peer-checked:` requires that exact sibling position — this is the same shape as the selectable-input problem in `plans/components/card.md` §0a, which Card solved by abandoning named slots. Collapse cannot: §3b needs the component to own the title element.

**So this one example is a documented limitation.** Its story reproduces the doc markup raw, with a comment saying why. An `inputId` prop was considered and rejected — it does not help, because the `<label>` still cannot be placed. If callers need it, the fix is a `before-title` slot rendered as a bare direct child, added deliberately rather than guessed at now.

### 3h. The rendered input carries two things the copy-paste HTML omits

**Found while implementing, 2026-08-31**, and §3g.4 asked for half of it.

daisyUI's *rendered* examples put `autocomplete="off"` on the toggle input;
its copy-paste HTML does not. **Decision: emit it.** It stops the browser
restoring a stale checked state on reload, which for a disclosure widget is
never what you want, and it is invisible otherwise. Same call
`plans/components/filter.md` §3e.3 made for the same reason.

The second one §4 missed entirely. The **custom-colours-with-checkbox**
example is:

```html
<input type="checkbox" autocomplete="off" class="peer" />
<div class="collapse-title … peer-checked:bg-secondary">…</div>
```

`peer-checked:` compiles to `.peer:checked ~ &`, so **the input must carry
`class="peer"`** — and the input is rendered by this component, where a caller
cannot reach it. Without it `titleClass="peer-checked:bg-secondary"` compiles
happily and never matches: a `titleClass` that silently does nothing, which is
worse than a missing prop.

**So the component stamps `class="peer"` on every toggle input it renders.**
`peer` is a marker with no declarations of its own, so it costs nothing when
unused, and it makes the whole `peer-*` family available through `titleClass`
and `contentClass`. An `inputClass` prop was the alternative and is not worth
it for one always-wanted class — the §3f rejection of `inputId` for the same
shape of problem stands, since that one genuinely could not be fixed by a
default.

### 3i. No `join` prop — §3c's candidate simplification does emit

§3c (via `plans/components/accordion.md` §3c) proposed
`class:list={['join', 'join-vertical', '[&>*]:join-item']}` on the **wrapper**,
so the child class comes from an arbitrary variant on the parent and the item
needs no prop — explicitly flagged as **unverified** under Tailwind 4 with this
`@source` setup, to check in the generated CSS before adopting.

**Checked. It emits** — the built stylesheet contains

```css
.\[\&\>\*\]\:join-item>*{border-style:solid;border-width:var(--border,1px);
  border-start-start-radius:var(--join-ss); …}
.\[\&\>\*\]\:join-item>:not(:first-child,:disabled,[disabled],.btn-disabled){…}
```

— the full `join-item` declaration block plus its sibling rules, keyed on the
variant class. So `<Accordion join>` classes its own children and
**`Collapse` has no `join` prop at all**.

That also lands the correction `plans/IMPLEMENTATION-ORDER.md` §5.4 queued
against **Join** (*"drop Collapse's `join` boolean in favour of
`class="join-item"`"*) — early, and for a second reason. Both routes stay open
for a caller outside an Accordion: `class="join-item"` is the same length as
`join` and needs no prop.

### 3g. Unverified assumptions

1. **Does slot content land directly inside the part wrappers?** The component renders `.collapse-title` and `.collapse-content` itself, so the *parts* are safe — but the checkbox/radio input must be a **direct child of `.collapse`** (`&>input:is([type=checkbox],[type=radio])` **[verified]**), and that input is rendered by the component too. So Collapse is **less** exposed than its siblings: the shared blocking question in `plans/components/aura.md` §3e.1 and the four plans it lists does not gate this component. Still worth confirming the input lands where the selector expects.
2. **`::details-content` transition support.** daisyUI animates the details path with `transition: … allow-discrete` and `interpolate-size: allow-keywords` **[verified]** — recent CSS. In a browser without it the details collapse still works, just without animation. Not a bug in this component; check once so it is not reported as one.
3. **Slot sanitization vs `<input>`.** Carried from `plans/components/accordion.md` §3d.2: a stripped input degrades to a permanently-closed collapse that still looks right. Applies to the checkbox and radio triggers.
4. **`autocomplete="off"` on the toggle input.** The doc page's *rendered* examples carry it; its copy-paste HTML does not. It stops browsers restoring the checked state on reload, which is usually what you want for a disclosure widget. Decide in Step 3 whether the component emits it by default — leaning yes, since it is invisible, harmless and matches what daisyUI actually ships — and record the decision here.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type CollapseTrigger = 'focus' | 'checkbox' | 'radio' | 'details';
type CollapseIcon = 'arrow' | 'plus';
type CollapseForce = 'open' | 'close';

interface Props extends HTMLAttributes<'div'> {
  /**
   * `focus` opens while focused and closes on blur — fine for text, wrong for
   * anything clickable inside. `checkbox` toggles on click. `radio` makes a
   * group mutually exclusive (see Accordion). `details` renders native
   * `<details>`/`<summary>`, which browser find-in-page can search (plan §3a).
   */
  trigger?: CollapseTrigger;
  /** Radio group name, or the `<details name>` for an exclusive group (plan §3c). */
  name?: string;
  /** `checked` on the input, `open` on the details. No effect when `trigger="focus"`. */
  open?: boolean;
  icon?: CollapseIcon;
  /** Forces state regardless of the input. **Ignored when `trigger="details"`** — use `open` (plan §3e). */
  force?: CollapseForce;
  /** Set together with `<Accordion join>` (plans/components/accordion.md §3c). */
  join?: boolean;
  /** Classes for `.collapse-title` — e.g. `after:start-5 after:end-auto` to move the icon (plan §3d). */
  titleClass?: string;
  /** Classes for `.collapse-content`. */
  contentClass?: string;
}

// Full literal class names. NEVER `collapse-${icon}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const ICON: Record<CollapseIcon, string> = {
  arrow: 'collapse-arrow',
  plus: 'collapse-plus',
};

const FORCE: Record<CollapseForce, string> = {
  open: 'collapse-open',
  close: 'collapse-close',
};

const {
  trigger = 'focus',
  name,
  open = false,
  icon,
  force,
  join = false,
  titleClass,
  contentClass,
  // Focus mode is gated on `[tabindex]` in daisyUI's CSS — without it the
  // collapse never opens (plan §3a). Defaulted, so it stays overridable.
  tabindex = trigger === 'focus' ? '0' : undefined,
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
      <summary class:list={['collapse-title', titleClass]}>
        <slot name="title" />
      </summary>
      <div class:list={['collapse-content', contentClass]}>
        <slot />
      </div>
    </details>
  ) : (
    <div class:list={classes} tabindex={tabindex} {...rest}>
      {trigger !== 'focus' && (
        <input type={trigger === 'radio' ? 'radio' : 'checkbox'} name={name} checked={open} autocomplete="off" />
      )}
      <div class:list={['collapse-title', titleClass]}>
        <slot name="title" />
      </div>
      <div class:list={['collapse-content', contentClass]}>
        <slot />
      </div>
    </div>
  )
}
```

No `<script>`: daisyUI drives all four modes in pure CSS, hides the details marker itself, and honours `prefers-reduced-motion` on the `grid-template-rows` transition **[all verified]**. Adding JS here would duplicate working CSS — `plans/README.md` §6.

### Astro idioms gate

- [ ] Content arrives via slots (`title`, default), not content props (§2).
- [ ] No `Astro.slots.has()` gating — both parts are required (§2).
- [ ] Root element matches daisyUI's example per trigger: `div` (+ optional input) or native `<details>` + `<summary>`. No div-plus-JS substitute (§3b).
- [ ] `tabindex="0"` is emitted for `trigger="focus"` and is overridable (§3a).
- [ ] The toggle `<input>` is a **direct child** of `.collapse` (§3g.1).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element in **both** branches.
- [ ] `name` and `open` applied explicitly per branch, not left to `...rest` (§3c).
- [ ] No `as` prop — the root follows `trigger`, not a free tag axis (§3b).
- [ ] No variant prop collides with a native attribute: `title` is a slot not a prop (§2); base `HTMLAttributes` has no `name`/`open`/`checked`/`icon`/`force`/`join` **[verified]**.
- [ ] Every variant class is a full literal in a `Record` map — no `` `collapse-${icon}` `` anywhere.
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <Collapse><Fragment slot="title">T</Fragment>Body</Collapse>
  <Collapse trigger="checkbox" icon="plus" titleClass="font-semibold">ok</Collapse>
  <Collapse trigger="radio" name="faq" open>ok</Collapse>
  <Collapse trigger="details" name="faq" open>ok</Collapse>
  <Collapse trigger="hover">must error — not a trigger value</Collapse>
  <Collapse icon="chevron">must error — not an icon value</Collapse>
  <Collapse color="primary">must error — no colour axis (§1)</Collapse>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props |
|---|---|---|
| Collapse with focus | `WithFocus` | default `trigger`, `class: 'bg-base-100 border border-base-300'` |
| Collapse with checkbox | `WithCheckbox` | `trigger: 'checkbox'` |
| Collapse with checkbox and close on click outside | `CloseOnClickOutside` | **raw markup**, with a comment pointing at §3f |
| Collapse using details and summary | `WithDetails` | `trigger: 'details'` |
| Without border and background color | `Unstyled` | no `class` |
| With arrow icon | `WithArrowIcon` | `icon: 'arrow'` |
| With arrow plus/minus icon | `WithPlusIcon` | `icon: 'plus'` |
| Moving collapse icon to the start | `IconAtStart` | `icon: 'arrow'`, `titleClass: 'font-semibold after:start-5 after:end-auto pe-4 ps-12'` (§3d) |
| Force open | `ForceOpen` | `force: 'open'` |
| Force close | `ForceClose` | `force: 'close'` |
| Custom colors that work with focus | `CustomColorsFocus` | `class: 'bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content'` |
| Custom colors that work with checkbox | `CustomColorsCheckbox` | `trigger: 'checkbox'`, plus `titleClass`/`contentClass` with the `peer-checked:` utilities (§3d) |

Plus `Playground` and `Passthrough` (Step 6). The icon and force axes are each covered by two doc examples.

Two stories beyond the doc page:

- **`Triggers`** — all four side by side, since no single doc page shows them together and the choice is the main decision a caller makes (§3a).
- **`ForceWithDetails`** — `trigger="details"` plus `force="close"`, which visibly does nothing, making §3e's exclusion observable rather than a claim.

```ts
import Collapse from './Collapse.astro';

// One component covers Collapse and Accordion items — same seven daisyUI
// classes (plan §0a). Group behaviour lives in Accordion's stories.

const TITLE = 'How do I create an account?';
const BODY = 'Click the "Sign Up" button in the top right corner and follow the registration process.';

export default {
  title: 'Components/Collapse',
  component: Collapse,
  argTypes: {
    trigger: { control: 'radio', options: ['focus', 'checkbox', 'radio', 'details'] },
    icon: { control: 'select', options: [undefined, 'arrow', 'plus'] },
    force: { control: 'select', options: [undefined, 'open', 'close'] },
    open: { control: 'boolean' },
    join: { control: 'boolean' },
    titleClass: { control: 'text' },
    contentClass: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: 'bg-base-100 border border-base-300',
    titleClass: 'font-semibold',
    contentClass: 'text-sm',
    slots: { title: TITLE, default: BODY },
  },
};

// Regression guard: native attributes survive, caller `class` merges onto the
// root, and the part classes reach their wrappers (§3d).
export const Passthrough = {
  args: {
    trigger: 'checkbox',
    id: 'collapse-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine bg-base-100 border border-base-300',
    titleClass: 'title-marker',
    contentClass: 'content-marker',
    slots: { title: TITLE, default: BODY },
  },
};
```

## 6. Steps

- [x] **Step 1: done.** §0a's supersede is confirmed and executed — no `AccordionItem` exists and `plans/components/accordion.md` is amended (Step 7). §3g.4 is settled **yes** and recorded in §3h, along with the second input attribute §4 had missed.
- [x] **Step 2: skipped as planned.** All three unions local; `variants.ts` untouched.
- [x] **Step 3: done**, with §3h's two additions and §3i's deletion. Gate walked; the probe errored on all four intended lines and left five valid ones clean, `tabindex="-1"` among them — the override §3a's default has to preserve.
- [x] **Step 4: done.** `Collapse.stories.ts`, 16 stories: 12 doc-page examples plus `Playground`, `Passthrough`, `Triggers` and `ForceWithDetails`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, since every trigger is behaviour.** Verify: `WithFocus` opens on **tab-in** and closes on **tab-out** (if it never opens, `tabindex` is missing and nothing else matters); `WithCheckbox` stays open until clicked again; `WithDetails` opens natively with **no disclosure triangle** and its content is findable by find-in-page while closed; `Triggers` shows all four behaving as labelled, including the two radios closing each other; the icons rotate or switch; `IconAtStart` puts the icon on the leading edge with mirrored padding; `ForceClose` will not open and `ForceOpen` will not close; **`ForceWithDetails`' second collapse opens anyway** (§3e); and `CustomColorsCheckbox` recolours title *and* content on open, which is §3h's `peer` doing its job.
- [x] **Step 6: done — forwarding confirmed on the root and both parts.** `Passthrough` renders `<div class="collapse mine bg-base-100 border border-base-300" id="collapse-1" data-test="yes" style="letter-spacing:2px">` with `title-marker` and `content-marker` on their own wrappers. Full output in §8.
- [x] **Step 7: done.** The `Collapse` row in `plans/README.md` says Implemented, and **`plans/components/accordion.md` is amended per §0a** — no `AccordionItem`, its item sections point here, and its README row says the group wrapper only. `plans/IMPLEMENTATION-ORDER.md` §5.4's Collapse row is discharged, and its Join row with it (§3i).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 7 daisyUI classes are reachable: `collapse` always, `collapse-title`/`collapse-content` as slot wrappers, `collapse-arrow`/`collapse-plus` via `icon`, `collapse-open`/`collapse-close` via `force`.
- [x] All four trigger modes render daisyUI's documented markup, and `tabindex="0"` is emitted for focus mode (§3a).
- [x] The title is a `<summary>` when `trigger="details"` and a `<div>` otherwise (§3b) — checked in rendered HTML.
- [x] `name` reaches the `<input>` in radio mode and the `<details>` in details mode; `open` produces `checked` / `open` respectively (§3c).
- [x] `titleClass` and `contentClass` reach their wrappers, and `class` reaches the root (§3d).
- [x] No invented axis — no `color`, no `size`, no `inputId` (§3f).
- [x] `force`'s JSDoc states the `details` exclusion (§3e), and `ForceWithDetails` demonstrates it.
- [x] §3f's click-outside limitation is documented and its story is raw markup with a comment.
- [x] Two `<Collapse trigger="radio">` sharing a `name` are mutually exclusive in the browser (§0a — this is what replaces `AccordionItem`).
- [x] `plans/components/accordion.md` and its `plans/README.md` row are amended per §0a.
- [x] `Playground` exposes every prop as a control; one story per doc-page example.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 191 files, 0 errors, 0 warnings, 0 hints.

```
Passthrough  → <div class="collapse mine bg-base-100 border border-base-300" id="collapse-1"
                 data-test="yes" style="letter-spacing:2px">
                 <input type="checkbox" autocomplete="off" class="peer">
                 <div class="collapse-title title-marker">…</div>
                 <div class="collapse-content content-marker">…</div></div>
UsingDetails → <details class="collapse bg-base-100 border border-base-300"
                 name="my-accordion-det-1" open>
                 <summary class="collapse-title font-semibold">…</summary>
                 <div class="collapse-content text-sm">…</div></details>
WithJoin     → <div class="join join-vertical [&amp;>*]:join-item bg-base-100">
                 <div class="collapse collapse-arrow border-base-300 border">…
```

Across the 23 Collapse and Accordion stories, **every story balances**: each
`.collapse` root is accounted for by exactly one of a toggle input, a
`<details>`, or `tabindex="0"`.

```
collapse roots 41 = inputs 25 + details 6 + tabindex="0" 10
input is a direct child of .collapse   24 of 24 component-rendered
  (the 25th is CloseOnClickOutside's raw markup, which is raw on purpose — §3f)
title as <summary> 6 of 6 details roots | as <div> everywhere else
peer 25 | autocomplete="off" 25   — §3h, one of each per input
all 7 classes have rules in the built stylesheet
```

What this settles:

- **§3a's `tabindex` is emitted exactly where it belongs** and nowhere else: 10 focus-mode collapses carry it, and no checkbox, radio or details root does. Without it a focus collapse is a title that does nothing, with no error — so the balance above is the assertion that matters.
- **§3g.1**: all 24 component-rendered inputs are direct children of `.collapse`, which `&>input:is([type=checkbox],[type=radio])` requires. This component renders its own input, so it was never exposed to the wrapper question the way its siblings are.
- **§3b's element swap holds**: `<summary class="collapse-title">` in all 6 details roots, `<div class="collapse-title">` in the other 35 — the swap a `CollapseTitle` sub-component could not have made.
- **§3c**: `name` reaches the `<input>` in radio mode (19 of them) and the `<details>` in details mode (3), never the root `div`.
- **§3i**: the variant rule `.\[\&\>\*\]\:join-item>*` is in the built CSS with `join-item`'s full declaration block, so the wrapper classes its own children.

Not settled here: whether any of it opens. Focus behaviour, the details animation, the icon rotation, `force`'s two directions and §3e's exclusion are all Step 5.
