# Theme Controller Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/theme-controller/
**Root element:** `input` (`type="checkbox"` or `type="radio"` — nothing else works, §0b)
**Target file:** `packages/daisy-astro/src/components/ThemeController/ThemeController.astro`
**Story file:** `packages/daisy-astro/src/components/ThemeController/ThemeController.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'input'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- No shared variant union applies — this component has no colour or size axis of its own (§0c).
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).

---

## 0. What the evidence actually says

### 0a. There is no `.theme-controller` rule anywhere in daisyUI

`ls daisyui/components/` has no `themecontroller.css`. Grepping the whole package for the class returns matches only inside **theme** selectors:

```css
/* daisyui/theme/cupcake.css */
:root:has(input.theme-controller[value=cupcake]:checked),
[data-theme="cupcake"] { color-scheme: light; --color-base-100: …; … }
```

Verified: **all 35** files in `daisyui/theme/*.css` carry their own copy of that selector, and the bundled `daisyui.css` carries the light and dark ones in `@layer base`. There is not a single declaration block whose *subject* is `.theme-controller`.

Third component in this batch whose CSS is not where the name suggests: `join.md` §0 found Join in `utilities/`, `pagination.md` found that `.pagination` does not exist at all, and Theme Controller is a fourth shape again — **the class exists only as a selector hook inside other files' rules**.

Consequences, all of them load-bearing:

1. **The component has no appearance of its own.** Zero styles. Every doc example gets its look from a *different* daisyUI class on the same input: `toggle`, `checkbox`, `radio`, `btn`, or nothing at all when it is the hidden input inside a `swap`.
2. **`value` is not optional decoration — it is the entire mechanism.** The selector matches on `[value=<theme name>]`.
3. **Only themes actually present in the consumer's build have a selector.** daisyUI 5 emits a theme's CSS only when it is enabled in `@plugin "daisyui" { themes: … }`. A `value="cupcake"` controller in a build that ships only light and dark matches nothing and silently does nothing. This is the single most likely support question this component will generate — it belongs in the JSDoc.
4. `[data-theme="x"]` is the sibling selector in every one of those rules, which is why a JS theme switcher and a Theme Controller are interchangeable and can be mixed.

### 0b. Missing `type` — and this one was **not** on the audit list

```astro
<input class:list={['theme-controller', className]} {...rest} />
```

The selector requires `input.theme-controller[value=…]:checked`. `:checked` only ever matches a checkbox or a radio. An `<input>` with no `type` is `type="text"`, which can never be `:checked` — **the scaffold is inert**.

This is the same defect as Checkbox, File Input, Radio and Range (`file-input.md` §0), but it is **not** one of the five names that audit tracked, and `text-input.md` §0i declared the audit closed one plan ago. The reason it was missed is worth recording so the next sweep is drawn correctly:

> That audit's list was built from components **whose daisyUI class names an input type** (`checkbox`, `radio`, `range`, `file-input`, `input`). `theme-controller` names a behaviour, not a type, so it never entered the list — even though its CSS depends on the type more strictly than any of them.

**Correction to make:** reopen the note in `file-input.md` §0, add Theme Controller as a sixth finding, and restate the closing criterion as *"every component whose CSS matches on `:checked`, `:indeterminate`, or an `[type=…]` attribute"* rather than *"every component named after an input type"*. Under that criterion the list is complete: Checkbox, Radio, Range, File Input, Text Input, Theme Controller, OTP.

**Decision:** `type?: 'checkbox' | 'radio'`, defaulting to `'checkbox'`, and rendered explicitly. Narrowing is a legal override of `InputHTMLAttributes`' `type?: HTMLInputTypeAttribute | string`, the same move `text-input.md` §0d made — and here it is stronger, because every other value is *provably* broken rather than merely undocumented.

### 0c. The appearance is another component's class, and the two spellings are identical

Ten doc examples, and the visible control is never this component's doing:

| Doc example | Appearance class on the input | Extra structure |
|---|---|---|
| using a toggle | `toggle` | — |
| using a checkbox | `checkbox` | — |
| using a swap | *(none — visually hidden)* | `<label class="swap swap-rotate">` + two `<svg>` |
| toggle with text | `toggle` | `<label class="flex cursor-pointer gap-2">` + two `<span>` |
| toggle with icons | `toggle` | same wrapper + two `<svg>` |
| toggle with icons inside | *(none)* | `<label class="toggle text-base-content">` wrapper + two `<svg>` |
| toggle with custom colors | `toggle` + Tailwind colour utilities | — |
| using a radio input | `radio radio-sm` | `<fieldset class="fieldset">` + labels |
| using a radio button | `btn` | `<div class="join join-vertical">` |
| using a dropdown | `btn btn-sm btn-block btn-ghost` | `<div class="dropdown">` + `<ul class="dropdown-content">` |

**Decision: no `appearance` prop.** Every one of those classes belongs to a component this library already ships with its own colour and size axes; an `appearance` enum would either duplicate those axes or amputate them. The caller writes `class="toggle toggle-lg"` and `class:list` merges it — which is exactly what daisyUI documents.

The non-obvious corollary, and the thing to put in the JSDoc, is that **two spellings produce byte-identical HTML**:

```astro
<ThemeController theme="synthwave" class="toggle" />
<Toggle class="theme-controller" value="synthwave" />
```

Both emit `<input type="checkbox" class="toggle theme-controller" value="synthwave">`. Neither is wrong. Prefer the first when theming is the point, the second when an existing Toggle is gaining the behaviour. Say so rather than letting a reader wonder which is "the" way — it is the same question `mask.md` ↔ `rating.md` raised about overlapping components.

For the two examples where the input is visually hidden (`swap`, `toggle with icons inside`), the wrapper is `Swap` / `Toggle` and this component is the bare input inside it. Those are the cases where a bare `<input class="theme-controller">` is the *only* option, and they are why this component must exist at all rather than being a prop on Toggle.

### 0d. `value="default"` deliberately matches nothing

The radio, radio-button and dropdown examples all start with:

```html
<input type="radio" name="theme-radios" class="radio radio-sm theme-controller" value="default" />
```

There is no theme named `default` and therefore **no selector for it**. Checking it un-checks every other controller in the radio group, no `:root:has(…)` rule matches, and the page falls back to the bare `:root` block — the consumer's default theme. That is a designed idiom, not a placeholder someone forgot to fill in.

Worth one JSDoc line and one story, because a reader who "fixes" `value="default"` to a real theme name breaks the reset behaviour.

Related: only `type="radio"` gets this for free, since unchecking is what a radio group does. A **checkbox** controller has exactly two states — its `value` theme when checked, the page default when unchecked — which is why every checkbox example uses a single `value="synthwave"`.

### 0e. `:has()` is the browser floor, and it is higher than the rest of the library

The doc page carries an explicit `browserSupport` block:

```yaml
browserSupport:
  chrome: 105
  firefox: 121
  safari: 15.4
```

Firefox 121 shipped December 2023 — noticeably newer than the other two. This is the only component in the batch with a declared floor, so state it in the JSDoc rather than assuming the ambient one. Where it matters: on an unsupported browser the input still renders and still toggles, the page theme just never changes — a silent partial failure, which is the kind worth naming.

### 0f. Two prefix behaviours that differ, and one is a library-wide concern

Straight from the doc page's info box:

> If you're using a **Tailwind CSS prefix**, it won't add prefix to `theme-controller`.
> If you're using a **daisyUI prefix**, it will add prefix to `theme-controller`.

The second half is not specific to this component: **every class name this library emits is a literal string, so a consumer who sets daisyUI's `prefix` option breaks all of them.** `plans/README.md` §2b establishes daisyUI as a peerDependency with the consumer owning theme configuration, but nothing in it addresses `prefix`.

That is a library-level gap, not this component's to solve. Raise it as a README item (§6 Step 7) — one sentence stating that `prefix` is unsupported and why — rather than inventing a prefix mechanism inside Theme Controller.

### 0g. `autocomplete="off"` is in the live demos but not the copyable markup

Every rendered demo on the doc page has `autocomplete="off"`; not one of the `$$`-prefixed code blocks does. That asymmetry is real and not an oversight of the docs' own making: browsers restore checkbox and radio state across reloads, which fights any persisted-theme logic and produces a flash of the wrong theme.

**Do not hard-code it** — daisyUI's published markup omits it, and `autocomplete` flows through `...rest` for anyone who wants it. Mention it in the JSDoc alongside the persistence note below.

### 0h. Persistence is explicitly out of scope

The doc page's first info box:

> Theme Controller changes the theme using CSS only. You can then use JS to save the input state in the server or localStorage if you want it to persist on page refresh.

So: **no `<script>` in this component.** `plans/README.md` §6 already forbids adding script for behaviour daisyUI achieves in CSS, and here daisyUI says outright that persistence is the application's job. A component-level script would also be wrong on the mechanics — a bundled component script runs once per page while a page may hold many controllers (§6's `querySelectorAll` rule).

This also **corrects `plans/README.md` §254**, which lists Theme Controller among "script-backed components". It is not, and neither is Text Rotate (`text-rotate.md` §0h). Of the three named there, only Swap remains — and that one should be re-checked when `swap.md` is implemented, since Swap is also a checkbox-hack.

### 0i. Attribute collisions

- `theme` — free; not on `InputHTMLAttributes` or base `HTMLAttributes`.
- `type` — deliberately narrowed, not shadowed (§0b).
- `value`, `name`, `checked`, `autocomplete`, `aria-label` — all native, all reach the element through `...rest`. `aria-label` (`astro-jsx.d.ts:292`) carries the visible text in the `btn`-styled examples, which is the `filter.md` amendment to `button.md` all over again: a `<input type="radio" class="btn">` has no text node, so `aria-label` **is** the label.

---

## 1. Variant audit

daisyUI documents **one** class, `theme-controller`, with no modifiers. Neither prop below is a daisyUI class; both exist because the CSS selector will not match without them (§0a, §0b).

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Target theme | — (matched via `[value=…]`) | `theme` | `string` | Rendered as the `value` attribute. Must name a theme enabled in the consumer's daisyUI build (§0a). `"default"` deliberately matches nothing and resets (§0d). |
| Input kind | — (matched via `:checked`) | `type` | `'checkbox' \| 'radio'` | Default `'checkbox'`. Every other value is inert (§0b). |

`theme` stays a plain `string` rather than a union of daisyUI's 35 theme names: the valid set is whatever the *consumer* enabled, so a union would be wrong for most users and would have to be regenerated on every daisyUI release. Document the constraint instead of pretending to type it.

Deliberately **not** props: appearance (`toggle`/`checkbox`/`radio`/`btn` — §0c), persistence (§0h), `autocomplete` (§0g).

## 2. Slots

**No slots.** `<input>` is a void element.

Every doc example that shows text or icons puts them in a **wrapper the caller owns** — `<label class="flex cursor-pointer gap-2">`, `<label class="swap swap-rotate">`, `<label class="toggle">`, `<fieldset class="fieldset">`, `<div class="join">`, `<ul class="dropdown-content">`. None of them is this component's element, and each is an existing component in this library.

Apply the same guard `text-input.md` §2 introduced, for the same reason — silent loss of caller content:

```astro
if (Astro.slots.has('default')) {
  throw new Error('<ThemeController> takes no children — <input> is a void element. Put icons or text in the wrapper (Swap, Toggle, Label).');
}
```

The shared slot-wrapping unknown (`aura.md` §3e.1) does not apply: there is no slot.

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'input'> {
  /** Theme name to activate while this input is checked, rendered as `value`.
   *  Must be enabled in the consumer's daisyUI build — a theme that isn't
   *  compiled has no selector and this silently does nothing.
   *  Use "default" to match no theme and fall back to the page default. */
  theme: string;
  /** Only checkbox and radio can be `:checked`, which is what the selector
   *  matches. Defaults to "checkbox". */
  type?: 'checkbox' | 'radio';
}
---
```

`theme` is **required**. Without it there is no `value`, and the component is decorative — the one prop in the library so far that earns being non-optional.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference in generic components
// (plans/README.md §5c). Harmless to keep the order everywhere.
interface Props extends HTMLAttributes<'input'> {
  theme: string;
  type?: 'checkbox' | 'radio';
}

const { theme, type = 'checkbox', class: className, ...rest } = Astro.props;

if (Astro.slots.has('default')) {
  throw new Error('<ThemeController> takes no children — <input> is a void element. Put icons or text in the wrapper (Swap, Toggle, Label).');
}
---
{/* daisyUI ships no `.theme-controller` rule: the class is only a selector hook
    inside every theme's `:root:has(input.theme-controller[value=x]:checked)`.
    So this input has no appearance of its own — add `toggle`, `checkbox`,
    `radio` or `btn` via `class`, or hide it inside a Swap. Needs :has()
    (Chrome 105 / Firefox 121 / Safari 15.4). Persistence is the app's job. */}
<input
  type={type}
  value={theme}
  class:list={['theme-controller', className]}
  {...rest}
/>
```

No `Record` map: there are no variant classes to map. The only literal class is the base one.

### Astro idioms gate

- [ ] No slots, and children throw rather than vanishing (§2).
- [ ] Nothing optional to gate with `Astro.slots.has()` beyond that guard.
- [ ] Root element is `<input>` with an explicit `type`, matching every doc example (§0b).
- [ ] **No `<script>`** — theme switching is pure CSS and persistence is explicitly the application's job (§0h). Correct `plans/README.md` §254, which lists this component as script-backed.
- [ ] `...rest` spread onto the `<input>`, so `name`, `checked`, `autocomplete`, `aria-label`, `id` need no declared props.
- [ ] Not polymorphic: the frontmatter says "For a checkbox or radio input".
- [ ] `theme` and `type` collide with nothing; `type` is narrowed, not shadowed (§0i).
- [ ] No interpolated class names — there are none to interpolate.
- [ ] Not generic, so §5c's ordering rule is advisory — keep it anyway.
- [ ] Prop typing verified with a throwaway probe (below).
- [ ] `astro check` passes.

```astro
<ThemeController theme="synthwave" class="toggle" />
<ThemeController theme="retro" type="radio" name="t" class="btn" aria-label="Retro" />
<!-- each of these must be an error: -->
<ThemeController />
<ThemeController theme="x" type="text" />
<ThemeController theme="x">oops</ThemeController>
```

## 5. Storybook stories

| Doc-page example | Story name | Notes |
|---|---|---|
| using a toggle | `AsToggle` | `class="toggle"` |
| using a checkbox | `AsCheckbox` | `class="checkbox"` |
| using a swap | `InsideSwap` | compose `Swap` (`swap swap-rotate`) + sun/moon `<svg>`; input bare |
| toggle with text | `ToggleWithText` | wrapper `<label class="flex cursor-pointer gap-2">` + two `<span>` |
| toggle with icons | `ToggleWithIcons` | same wrapper + two `<svg>` |
| toggle with icons inside | `ToggleWithIconsInside` | compose `Toggle` as the wrapper; input bare |
| toggle with custom colors | `ToggleCustomColors` | the doc's Tailwind colour utilities, verbatim |
| using a radio input | `AsRadioGroup` | compose `Fieldset`; five inputs sharing `name`, first is `value="default"` |
| using a radio button | `AsRadioButtons` | compose `Join` (`join-vertical`); `class="btn"`, `aria-label` per option |
| using a dropdown | `InDropdown` | compose `Dropdown`; `btn btn-sm btn-block btn-ghost justify-start` |

Plus:
- `Playground` — `theme` (text control), `type`, `class`.
- `ResetToDefault` — a radio group demonstrating §0d, described as *"`value="default"` matches no selector on purpose."*

Four story-writing notes:

- **These stories only work if the Storybook preview actually loads the themes they name.** `synthwave`, `retro`, `cyberpunk`, `valentine` and `aqua` must be enabled in `.storybook/preview.ts`'s daisyUI config, or every story renders a control that does nothing (§0a). Check that **before** writing the stories; if the config only enables light/dark, either extend it or rewrite the story values to `light`/`dark` and say so in the descriptions. This is the same "is daisyUI's CSS actually wired up" prerequisite the template's Step 5 names, but here it is not a background assumption — it is the thing under test.
- **Storybook renders stories in an iframe.** `:root` is the iframe's `<html>`, so `:root:has(…)` resolves inside the canvas and a controller in a story themes that story's canvas — which is the desired behaviour. Confirm it rather than assuming; if the framework renders into a shadow root or a nested container instead, `:root:has()` will not see the input and every story will look broken for a reason that has nothing to do with this component.
- **Six stories need inline SVG in a wrapper.** Same sanitization risk flagged in `text-input.md` §5; write `InsideSwap` first.
- **Radio stories need distinct `name` values per story**, exactly as the doc page does (`theme-radios`, `theme-buttons`, `theme-dropdown`). Sharing one name across stories in a single canvas would silently couple them.

```ts
import ThemeController from './ThemeController.astro';

export default {
  title: 'Components/ThemeController',
  component: ThemeController,
  argTypes: {
    theme: { control: 'text' },
    type: { control: 'inline-radio', options: ['checkbox', 'radio'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { theme: 'synthwave', class: 'toggle' },
};

export const AsCheckbox = {
  args: { theme: 'synthwave', class: 'checkbox' },
};

// …one export per row of the table above, markup copied from the doc page.
```

## 6. Steps

- [ ] **Step 1:** Section 1 is already filled — the frontmatter lists one class, and §0a establishes that no rule targets it. Nothing to re-derive.
- [ ] **Step 2:** No union goes in `variants.ts`. `theme` stays `string` for the reason given in section 1; `type`'s two-literal union is local.
- [ ] **Step 3:** Rewrite `ThemeController.astro` per section 4 and run the probe block. Confirm in the built HTML that `type` and `value` are both present — the scaffold shipped neither.
- [ ] **Step 4:** **Before writing stories**, check `.storybook/preview.ts` for which themes the daisyUI config enables (§5). Then write `ThemeController.stories.ts`, starting with `InsideSwap`.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/ThemeController`, verify:
  - `AsToggle` flips the canvas to `synthwave` and back.
  - `AsRadioGroup` switches between four themes, and its `value="default"` option returns the canvas to the default theme (§0d).
  - `InsideSwap` and `ToggleWithIconsInside` keep the input invisible while still switching the theme.
  - `AsRadioButtons` shows the `aria-label` text as the visible button label (§0i) and squares its corners inside the Join with no prop.
  - A controller naming a theme that is **not** enabled does nothing at all — add it as a deliberate negative case, since silence is the documented failure (§0a).
- [ ] **Step 6:** Attribute forwarding story: `id`, `data-*`, `style`, `class`, plus `name`, `checked`, `autocomplete` and `aria-label`. Headless check:

```bash
pnpm build-storybook
grep -rhoE '<input[^>]*theme-controller[^>]*>' storybook-static/astro-prerendered-stories.json | head
```
- [ ] **Step 7:** Three documentation corrections, all in `plans/README.md` unless stated:
  1. Set the Theme Controller row to **Implemented**.
  2. Remove Theme Controller from the script-backed list in §254 (§0h) — leaving only Swap, flagged for re-check.
  3. Add a line to §2b stating that daisyUI's `prefix` option is unsupported by this library, because every emitted class name is a literal (§0f).
  4. In `file-input.md` §0, reopen the missing-`type` audit, add Theme Controller as a sixth finding, and restate its closing criterion as *"every component whose CSS matches on `:checked`, `:indeterminate`, or `[type=…]`"* (§0b).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] `type` is rendered explicitly and narrowed to `checkbox | radio`; the scaffold's inert `type="text"` default is gone (§0b).
- [ ] `theme` is required and rendered as `value` (§0a, section 3).
- [ ] No `appearance` prop; the toggle/checkbox/radio/btn equivalence is documented in JSDoc (§0c).
- [ ] `value="default"` idiom documented and given its own story (§0d).
- [ ] The `:has()` browser floor is in the JSDoc, with the silent-failure mode named (§0e).
- [ ] The "theme must be enabled in the consumer's build" constraint is in the JSDoc and has a negative story (§0a, §6 Step 5).
- [ ] No `<script>` anywhere in the component (§0h).
- [ ] Children throw rather than being dropped (§2).
- [ ] `Props` extends `HTMLAttributes<'input'>`; `class` merges through `class:list`.
- [ ] `Playground` exposes `theme`, `type` and `class`.
- [ ] Ten doc-example stories, composing the real `Swap`, `Toggle`, `Fieldset`, `Join` and `Dropdown` components.
- [ ] Storybook's iframe confirmed to be the `:root` the selector resolves against (§5).
- [ ] All four documentation corrections in §6 Step 7 made.
- [ ] Every box in section 4's Astro idioms gate ticked.
