# daisy-astro Component Plan — Overview

**Goal:** wrap every daisyUI component as an Astro component (`packages/daisy-astro/src/components/<Name>/<Name>.astro`), where every daisyUI variant/modifier class is a typed prop, every native HTML attribute for the underlying element is forwarded, and every component (with its variants) has Storybook coverage.

This document is the index and ruleset. Each component gets its own plan under `plans/components/<slug>.md`, written from `plans/TEMPLATE.md` when work on that component starts. This file does not implement anything — it defines the shared conventions so per-component plans don't each reinvent them, and tracks which components have a plan yet.

> **Building, not planning?** Read [`plans/IMPLEMENTATION-ORDER.md`](IMPLEMENTATION-ORDER.md) first. All 68 plans are written; that document derives the dependency graph between them, sequences the work into six stages, and gives the rules that stop a wrong order turning into silent debt. Start with Tier 0 — three probes and a Storybook theme setting gate roughly 35 plans.

## Source of truth

daisyUI component list confirmed against the official docs (`daisyui.com/components/`) and the `daisyui` npm package source (`packages/daisyui/src/components/*.css` in `saadeghi/daisyui` on GitHub) on 2026-08-23. All 68 are part of the free, open-source `daisyui` package — none require a paid tier.

## Shared conventions (apply to every component plan)

### 1. Props = daisyUI variants + full native attribute passthrough

Every component's `Props` type:
- Extends `astro/types`' `HTMLAttributes<'tag'>` for whatever native element the component renders (`'button'`, `'a'`, `'input'`, `'div'`, ...), so every valid native attribute (`id`, `data-*`, `aria-*`, event handlers passed as strings for non-hydrated use, etc.) is accepted and forwarded automatically.
- Adds one prop per daisyUI variant axis the component supports (color, size, style, behavior, placement — whichever apply; see each component's own doc page for its actual modifier list, don't assume every axis applies to every component).
- Destructures the variant props out of `Astro.props`, leaves everything else in `...rest`, spreads `rest` onto the root element.

### 1b. Variant classes MUST be static literals in a lookup map

**Never build a class name by interpolation.** Tailwind scans source *text* for class-name candidates; daisyUI 5 tree-shakes and only emits CSS for classes it finds. `` `btn-${color}` `` produces a class that no CSS rule ever backs — the markup looks right and the component is invisibly unstyled.

Measured with `tailwindcss` v4.3.3 + `daisyui` v5.7.22:

```
source: class:list={['btn', color && `btn-${color}`]}
  → .btn        in output CSS: yes
  → .btn-primary in output CSS: NO

source: const COLOR = { primary: 'btn-primary', … }; class:list={['btn', color && COLOR[color]]}
  → .btn-primary in output CSS: yes
  → .btn-secondary, .btn-accent (named in map, unused at runtime): yes
  → .btn-error (never named anywhere): no   ← tree-shaking still works
```

So every variant axis gets a `Record<Union, string>` map of full literal class names, as in `packages/daisy-astro/src/components/Button/Button.astro`. Granularity stays per-component: importing Button pulls in all `btn-*` variants, but a component you never import contributes nothing.

Booleans are already safe when written as object keys — `{ 'btn-active': active }` is a literal in source, so it is detected.

### 1c. Consumers must point Tailwind at this package

Tailwind 4 auto-detects sources but ignores `node_modules`, so an app that installs this library gets **no** daisyUI CSS for it by default. Verified: a consumer's own `p-4` is picked up, the library's `btn-primary` is not, until the app's CSS adds

```css
@source "../node_modules/daisy-astro/src";
```

This belongs in the published README's install steps — without it the library appears completely unstyled, which is the first thing a new user will hit.

### 2. Class merging: `class:list`, never manual string concatenation

Astro does **not** auto-merge a caller-supplied `class` with a class you hardcode on the root element — `class` must be destructured (renamed, since `class` is a reserved word) and merged explicitly. Astro's `class:list` directive is powered by `clsx` (bundled with Astro, no new dependency) and handles this:

```astro
---
import type { HTMLAttributes } from 'astro/types';

type Color = 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props extends HTMLAttributes<'button'> {
  color?: Color;
  size?: Size;
  outline?: boolean;
}

const COLOR: Record<Color, string> = {
  primary: 'btn-primary', secondary: 'btn-secondary', accent: 'btn-accent',
  neutral: 'btn-neutral', info: 'btn-info', success: 'btn-success',
  warning: 'btn-warning', error: 'btn-error',
};
const SIZE: Record<Size, string> = {
  xs: 'btn-xs', sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg', xl: 'btn-xl',
};

const { color, size, outline, class: className, ...rest } = Astro.props;
---
<button
  class:list={['btn', color && COLOR[color], size && SIZE[size], { 'btn-outline': outline }, className]}
  {...rest}
>
  <slot />
</button>
```

This is the pattern every component plan implements. `class:list` skips `false`/`null`/`undefined` entries, so `color && ...` and `{ 'btn-outline': outline }` compose cleanly without manual filtering. The map lookups are not decoration — see §1b for why an interpolated class name silently produces no CSS.

### 2b. Dependencies: daisyUI and Tailwind are peers, not runtime deps

This package ships `.astro` files that emit class names; it ships no CSS. The consumer's own Tailwind build is what turns those classes into styles, and the consumer owns theme configuration. So:

```jsonc
"peerDependencies": {
  "astro": "^7.0.0",
  "daisyui": "^5.0.0",
  "tailwindcss": "^4.0.0"
}
```

with the same packages in `devDependencies` so Storybook renders styled locally. A runtime `dependency` would be wrong — it risks a second, conflicting daisyUI in the consumer's build and takes theme control away from them.

**daisyUI's `prefix` option is not supported.** Every class name this package emits is a literal string in a `.astro` file (§1b requires that — an interpolated name gets no CSS). daisyUI's `prefix` config renames every class it generates, so a consumer who sets it gets a component library emitting names their build no longer defines, and the failure is silent: unstyled markup, no error. Tailwind's own prefix option is a separate setting and does not affect daisyUI's class names.

Found while planning Theme Controller, whose doc page documents the two prefixes behaving differently (`components/theme-controller.md` §0f). If prefix support is ever wanted, it needs a build-time or config-driven mechanism across every component — not something a single component can solve.

daisyUI 5 requires Tailwind 4 and is CSS-first: no `tailwind.config.js`. Storybook gets its styles from `.storybook/preview.css`:

```css
@import "tailwindcss";
@plugin "daisyui";
@source "../src";
```

The `@source` line is required for the same reason as §1c — Storybook renders components with no app to scan. Tailwind's Vite plugin is registered in `astro.config.mjs`, which `@storybook-astro/framework` picks up automatically. Verified: the built Storybook CSS contains real rules for `btn-primary`, `btn-outline`, `btn-lg`, `btn-circle`, `btn-error`, `btn-disabled`.

### 3. Shared variant types live in one place

`packages/daisy-astro/src/lib/variants.ts` exports the reusable union types (`DaisyColor`, `DaisySize`, etc.) that most components share, so 68 files don't each redeclare `'primary' | 'secondary' | ...`. A component only imports the axes it actually supports — don't force a component into an axis its daisyUI classes don't have (e.g. not every component has all 5 sizes; check the real doc page).

This file is a **prerequisite**, created once, before or during the first component's implementation — not part of any single component's plan.

### 3b. One directory per component

Each component owns a directory named after it, holding the component and its stories:

```
src/
  lib/variants.ts
  components/
    Button/
      Button.astro
      Button.stories.ts
    Accordion/
      Accordion.astro          ← the group wrapper
      Accordion.stories.ts
      AccordionItem.astro      ← sub-component, same daisyUI doc page
      AccordionItem.stories.ts
```

**Sub-components live with their parent, not in their own directory.** A component that only exists to be nested inside another (an `Accordion`'s items, a `Card`'s body) belongs to the same daisyUI doc page and the same plan file, so it belongs in the same directory. The directory is one *daisyUI component*, not one `.astro` file. A component that has its own row in the checklist below gets its own directory.

Two consequences:

- **Shared unions import as `'../../lib/variants'`**, one level deeper than the flat layout. Getting this wrong is caught by `astro check`, not silently.
- **Storybook needs no config change** — `.storybook/main.ts` already globs `../src/**/*.stories.@(js|ts)`, which is recursive.

`title` in a story stays flat (`'Components/Button'`); the directory is a filesystem concern and does not dictate the sidebar hierarchy.

### 4. Storybook runs on `@storybook-astro/framework`

The community Astro framework for Storybook (`storybook-astro.org`, MIT, ~24k downloads/week, Astro 5–7 + Storybook 10). Stories import the `.astro` file directly and pass slot content through `args.slots`:

```ts
import Button from './Button.astro';

export default { title: 'Components/Button', component: Button };

export const Default = {
  args: { color: 'primary', slots: { default: 'Click me' } },
};
```

Named slots use matching keys (`slots: { header: '…', default: '…' }`). Slot content can be an HTML string, another Astro component, or an array mixing them.

**This replaced a hand-rolled Container-API bridge.** The earlier setup wired the Container API into a Vite middleware manually because Astro is absent from Storybook's own framework list — the adapter lives outside Storybook's repo and was missed. The framework does the same thing properly and additionally handles scoped styles, client script execution, static-build prerendering, framework components, and Vitest portable stories. Do not reintroduce a custom bridge.

Story conventions:
- `Playground` story: full `argTypes` controls for every prop, default args.
- One story per daisyUI doc-page example (§8).
- One story per variant axis (e.g. `Colors`, `Sizes`) rendering all values side by side, for axes the doc examples don't already cover.

**Story files are plain objects, not `Meta`/`StoryObj`.** Storybook 10 ships those generics from framework packages (`@storybook/react`, `@storybook/vue3`, …) and `@storybook-astro` has no equivalent; `storybook/internal/types` doesn't export them either. Untyped story objects are what the framework's own docs use. Don't burn time re-deriving this — it was checked.

To make `import Button from './Button.astro'` resolve under `tsc`, `src/env.d.ts` carries:

```ts
/// <reference types="astro/client" />
/// <reference types="@storybook-astro/framework/shim" />
```

**Slot sanitization is on by default** — the framework sanitizes slot HTML with conservative defaults. Stories containing inline SVG (icons, mockups) may have markup stripped. If an SVG vanishes from a story, that is the cause; see the framework's Sanitization guide to widen the allowlist rather than assuming the component is broken.

### 5. Slots

Content always comes in through slots, never through content props — no `label="Save"` where `<slot />` will do. A component that renders caller markup takes a slot.

If the component wraps multiple content areas (e.g. Card's figure/body/actions, Modal's header/body/actions), use named slots (`<slot name="..." />`) — document them explicitly in the component's plan, don't infer from memory.

**Gate optional wrappers with `Astro.slots.has()`.** daisyUI styles its wrapper elements (`figure`, `card-actions`, ...) with padding, gaps and borders, so unconditionally rendering a wrapper around an unused slot produces a visible empty box. Check before rendering:

```astro
---
const hasFigure = Astro.slots.has('figure');
---
{hasFigure && (
  <figure>
    <slot name="figure" />
  </figure>
)}
```

Verified behaviour (probe rendered server-side, 2026-08-24):

```
slots {}                                        → <div class="card"><div class="card-body">FALLBACK_BODY</div></div>
slots {"default":"BODY"}                        → <div class="card"><div class="card-body">BODY</div></div>
slots {"default":"BODY","figure":"<img …>",
       "actions":"<button>OK</button>"}         → <div class="card"><figure><img …></figure><div class="card-body">BODY</div><div class="card-actions"><button>OK</button></div></div>
```

**Fallback content** goes inside the slot tag — `<slot>default text</slot>` renders only when the caller passes nothing (confirmed in the first line above). Use it where daisyUI's own example has placeholder content; don't invent fallbacks the library doesn't imply.

**Forwarding slots to a nested component** uses both attributes on one tag: `<slot name="head" slot="head" />`. Relevant for compound components (Card wrapping a Card body, Drawer wrapping its content area).

`Astro.slots.render('name')` returns slot content as an HTML string. Reach for it only when markup must be inspected or injected via `set:html` — `Astro.slots.has()` plus a plain `<slot />` covers the ordinary case.

### 5b. Type-checking: `astro check`, not `tsc`

`tsc` does not parse `.astro` files at all — it silently checks nothing in them. Real type errors in a component only surface under `astro check`. Run it as the gate; `tsc` alone will happily report success on a broken component.

Two constraints that come with it:

- **TypeScript must be 6.x.** `astro check` uses the language server's programmatic API, which TypeScript 7's native compiler does not yet expose (it errors out and refuses to run). Pinned to `typescript@6.0.3`.
- **Scope `tsconfig.json`.** Without an explicit `exclude`, `astro check` walks `storybook-static/` and reports thousands of errors from minified build output.

### 5c. Declaration order breaks generic `Props` inference

In a component using a generic `Props<Tag extends HTMLTag>`, **`Props` must be declared before any `const` in the frontmatter.** With a `const` above it, Astro stops inferring `Props` and the component accepts no props at all — every call site fails with "not assignable to type `IntrinsicAttributes`", while the component body's props silently degrade to `any`.

This is a silent, confusing failure: the component still renders correctly, so only a type probe catches it. Bisected against Astro 7.2.4.

Also annotate the destructure, since `Astro.props` is untyped inside a generic component:

```astro
const { as: Tag = 'button', color, ...rest } = Astro.props as Props<HTMLTag>;
```

**Two more ways `Props` inference dies silently**, both found on 2026-08-30 while building Mask and Status, and both with the same symptom as the `const` rule above — the component renders fine while every call site errors with "not assignable to `IntrinsicAttributes`" (or, worse, accepts anything at all):

1. **An angle bracket anywhere in the frontmatter — either direction, comments included — breaks `Props` inference.** A `<` reads as the start of the template, so everything after it, `type Props` included, stops being TypeScript. A bare `>` breaks it too, in a subtler way: the type survives but its generic parameter stops being inferred from `as`, so `<Breadcrumbs as="div">` fails with `Type '"div"' is not assignable to type '"nav"'` — the *default* type argument wins. Found first as `<`, on 2026-08-30; the `>` half surfaced the same day when a JSDoc line reading ``the rules all target `li > *` `` made exactly one call site fail. Bisected against a generic component:

   | Comment content above `type Props` | Result |
   |---|---|
   | plain prose, or `as="div"` in backticks | inference works |
   | `a < b and c > d` | **broken** — and accepts *anything*, no errors at all |
   | `a < b` alone | **broken**, same way |
   | `a > b` alone | **broken** — `as` no longer narrows `Tag` |
   | `Defaults to <img>` | **broken** |
   | ```` ```astro <Status color="info" /> ``` ```` | **broken** |
   | the same JSDoc with the markup line removed | works |

   **Scope, narrowed 2026-08-31:** every observed failure was on a **generic** `type Props<Tag extends HTMLTag>`. A **non-generic** `interface Props` tolerates angle brackets in its JSDoc — verified twice, on Kbd and on Aura, both of which document themselves with tags in the comment and infer their props correctly. So the ban is real but scoped: **a component with a generic `Props` must have no angle brackets anywhere in its frontmatter**, and a non-generic one may keep them. When in doubt, write prose — a JSDoc that says "a native `kbd` element" costs nothing.

   It is **not** about JSDoc vs `//` — both forms break with an angle bracket and both work without one. So: **no angle brackets in the frontmatter of a generic component, in either direction.** Write "a native `kbd` element", not `` `<kbd>` ``, and "child elements of the item" rather than `` `li > *` ``; put markup examples in the stories, where they are executable anyway.

   Two failure shapes, and the quiet ones are worse than the loud one: every call site erroring is easy to spot, a component that silently accepts *every* prop is not, and a single call site failing on `as` looks like a bug in that one usage rather than in the component. `src/_typecheck.astro` catches all three.

2. **A polymorphic `Props` needs a default type parameter, or the default tag's own attributes are rejected.** `type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag; … }>` only resolves `Tag` when the caller passes `as`. Omit `as` and `Tag` stays unresolved, so `<Button type="submit">`, `<Badge title="t">` and `<Mask src="/a.webp">` are all type errors — ordinary calls, on the component's *own* default element. Declare the default the component actually renders:

```astro
type Props<Tag extends HTMLTag = 'button'> = Polymorphic<{ as: Tag; … }>;
```

Button and Badge both shipped with this defect and were fixed when Mask found it. Any new polymorphic component gets the default type parameter and a probe line that passes a native attribute of the default tag **without** `as`.

**Verify prop typing with a throwaway probe** rather than assuming it works — a component that accepts nothing and one that accepts everything both pass `astro check` on their own. Write a scratch `.astro` that uses the component correctly *and* incorrectly, confirm only the incorrect lines error, then delete it:

```astro
<Button color="primary">ok</Button>
<Button as="a" href="/ok">ok</Button>
<Button id="x" type="submit">ok — native attrs of the default tag, no `as`</Button>
<Button color="banana">must error</Button>
<Button href="/nope">must error — href needs as="a"</Button>
```

The third line is not filler: it is the only one that catches the missing default type parameter above.

**A throwaway probe is not enough on its own — keep `src/_typecheck.astro` current.** Once the probe is deleted, nothing in `src` uses the component: story files are `.ts`, and `astro check` does not type-check story args against component props. So a component whose `Props` broke afterwards passes a clean `astro check` while every real call site fails. Mask shipped exactly that way for one commit — its frontmatter comment contained `<img>`, and the breakage only surfaced when the next component's probe went looking.

`packages/daisy-astro/src/_typecheck.astro` closes that: one file, never imported, holding valid usages of every implemented component — including at least one native attribute of each default element passed **without** `as`. Add lines as components land. Lines that must *not* compile still belong in a throwaway probe; this file only holds what should pass. Verified 2026-08-30 that it fails when the bug is reintroduced and passes when it is not.

**Probe lines that will never error, so don't write them: `color` or `title` on a component that declares neither.** Astro's base `HTMLAttributes` declares `color?: string` in its non-standard/obsolete attribute list (`astro-jsx.d.ts:563`, verified 2026-08-30 while building Avatar), so `<Avatar color="primary">` type-checks on every component in this library and forwards through `...rest` as a plain attribute — `<div class="avatar" color="primary">`. It emits no class and does nothing. Components that *do* have a colour axis declare `color` themselves and narrow it, so they are unaffected; components that don't cannot reject it, and a caller reaching for it gets silence rather than an error. Found in `plans/components/avatar.md` §3e.3.

The general rule, which is `plans/components/button.md` §3a one level up: check a variant prop name against base `HTMLAttributes`, not only against the element's own attributes. `color`, `style`, `title`, `role` and `translate` are all on the base interface.

### 6. Other Astro idioms this library depends on

- **Polymorphic `as`.** Where daisyUI documents a class on several elements (Button on `button`/`a`/`input`/`div`, Link on `a`/`button`), use `Polymorphic<{ as: Tag }>` from `astro/types` rather than a hand-rolled generic, so the accepted attribute set follows the tag — `href` type-checks on `as="a"` and is rejected on `as="button"`. Worked example in `plans/components/button.md` §4.
- **Zero JS by default.** Astro components ship no client JavaScript unless a `<script>` or `client:*` directive is added. Most daisyUI components are pure CSS (many use the checkbox/details hack deliberately to avoid JS) — do not add a script to reimplement behaviour daisyUI already gets from CSS.
- **`<script>` runs once per page, not once per instance.** Astro bundles component scripts, so a script inside a component executes a single time no matter how many instances are on the page. Any script must therefore use `document.querySelectorAll(...)` and wire up every instance — `querySelector` will silently bind only the first. Use `is:inline` only when a script genuinely must be duplicated per instance, knowing it then skips bundling, TypeScript and import resolution. `define:vars` implies `is:inline`.
- **Scoped styles and `...rest`.** Astro scopes component styles by adding a `data-astro-cid-*` attribute. Because these components spread `...rest` onto the root element, a parent's scoped styles reach the component correctly — one more reason the spread is mandatory and not optional polish.
- **Prefer CSS and native elements over script.** Native `<dialog>` for Modal, `<details>` for Collapse/Accordion, the checkbox hack for Drawer/Swap — daisyUI is built around these. Match the element daisyUI's own example uses rather than substituting a div plus JavaScript.

### 7. Interactive components in Storybook

Handled by the framework: its renderer applies scoped styles and executes client scripts after injecting the SSR'd HTML, so script-backed components behave in the canvas.

That list used to name Theme Controller, Swap and Text Rotate. Two of the three were wrong, and planning them established why:

- **Text Rotate** is pure `@keyframes` plus `:has()` child counting, with no JavaScript at all (`components/text-rotate.md` §0h).
- **Theme Controller** switches themes entirely in CSS; daisyUI's own docs hand persistence to the application (`components/theme-controller.md` §0h).
- **Swap** is a checkbox hack and should be re-checked when `components/swap.md` is implemented — on current evidence it is CSS too.

The framework capability is real and worth keeping recorded; the examples were not. Interactivity that genuinely needs script in this library is caller-side (a Theme Controller persisting to `localStorage`, a Toggle's `indeterminate` DOM property, a Validator story's form submit), never inside a component.

This was a real limitation of the previous hand-rolled bridge, which injected HTML with `container.innerHTML` — scripts inserted that way are never executed by the browser, so those components previewed as dead markup. Adopting the framework removed the problem rather than working around it. Noted here so the constraint isn't reintroduced from memory.

Static builds also prerender Astro stories, so `pnpm build-storybook` produces real component HTML — verified by grepping the build output for rendered `btn` markup. The old bridge produced none, since its middleware only existed in dev.

### 8. Stories mirror the daisyUI docs examples

Every story reproduces the corresponding example from that component's daisyUI doc page — same markup structure, same slot content, same wording, same order as the page presents them. Two reasons: the examples are the library's own definition of correct usage, and matching them makes a wrong wrapper or a missing element obvious on sight when comparing the story against the doc page.

Copy the example markup from the doc page into the story rather than inventing demo content. Where the daisyUI example shows raw HTML classes (`<button class="btn btn-primary">`), the story passes the equivalent props instead (`{ color: 'primary' }`) — the rendered output should match the doc example's HTML, which is exactly what makes it a useful check. Add extra stories beyond the doc examples only for variant axes the page shows only as a class table.

## Status legend

- **Not started** — no plan file yet.
- **Planned** — `plans/components/<slug>.md` exists.
- **Implemented** — component + stories exist in `packages/daisy-astro/src/components/<Name>/`.

## Component checklist (68)

### Actions
| Component | Slug | Status |
|---|---|---|
| Button | `button` | **Implemented** — [`plans/components/button.md`](components/button.md) (21 stories; Step 6, the visual pass, still open) |
| Dropdown | `dropdown` | Planned — [`plans/components/dropdown.md`](components/dropdown.md) (3 methods; component covers 2, popover is composition) |
| FAB / Speed Dial | `fab` | Planned — [`plans/components/fab.md`](components/fab.md) (focus-driven, :nth-child-ordered, flower caps at 4 actions) |
| Modal | `modal` | Planned — [`plans/components/modal.md`](components/modal.md) (4 methods, one component; `open` is not the same as modal) |
| Swap | `swap` | Planned — [`plans/components/swap.md`](components/swap.md) (`Swap`+on/off/indeterminate; two drivers, don`t combine) |
| Theme Controller | `theme-controller` | Planned — [`plans/components/theme-controller.md`](components/theme-controller.md) (no .theme-controller rule exists; class is a selector hook inside all 35 theme files) |

### Data Display
| Component | Slug | Status |
|---|---|---|
| Accordion | `accordion` | Planned — [`plans/components/accordion.md`](components/accordion.md) (wrapper + `AccordionItem`; current code is a dummy scaffold) |
| Avatar | `avatar` | **Implemented** — [`plans/components/avatar.md`](components/avatar.md) (`Avatar` + `AvatarGroup`, one row for both; §3e.1 open until the visual pass) |
| Aura | `aura` | **Implemented** — [`plans/components/aura.md`](components/aura.md) (17 stories; wraps a direct child; colour/duration are caller classes; visual pass open) |
| Badge | `badge` | **Implemented** — [`plans/components/badge.md`](components/badge.md) (16 stories; §3b mechanism corrected; visual pass open) |
| Card | `card` | Planned — [`plans/components/card.md`](components/card.md) (wrapper + `CardBody`/`CardTitle`/`CardActions`; current code is a dummy scaffold) |
| Carousel | `carousel` | **Implemented** — [`plans/components/carousel.md`](components/carousel.md) (`Carousel` + `CarouselItem`, one row for both; 15 stories; no JS by design; visual pass open) |
| Chat bubble | `chat-bubble` | Planned — [`plans/components/chat-bubble.md`](components/chat-bubble.md) (`Chat`/`ChatBubble`/`ChatHeader`/`ChatFooter`; `chat-image` served by `Avatar`) |
| Collapse | `collapse` | Planned — [`plans/components/collapse.md`](components/collapse.md) (single impl of the 7 `collapse-*` classes; supersedes `AccordionItem`) |
| Countdown | `countdown` | **Implemented** — [`plans/components/countdown.md`](components/countdown.md) (`Countdown` + `CountdownValue`, one row for both; 12 stories; visual pass open) |
| Diff | `diff` | **Implemented** — [`plans/components/diff.md`](components/diff.md) (7 stories; native CSS `resize`, no JS; **no drag on iOS Safari**; visual pass open) |
| Hover 3D card | `hover-3d-card` | **Implemented** — [`plans/components/hover-3d-card.md`](components/hover-3d-card.md) (5 stories; generates the 8 hover zones; pass exactly one child; visual pass open) |
| Hover Gallery | `hover-gallery` | **Implemented** — [`plans/components/hover-gallery.md`](components/hover-gallery.md) (6 stories; first child is a resting frame; caps at 10; visual pass open) |
| Kbd | `kbd` | **Implemented** — [`plans/components/kbd.md`](components/kbd.md) (10 stories; no `as`, no `keys` prop; visual pass open) |
| List | `list` | Planned — [`plans/components/list.md`](components/list.md) (`List`+`ListRow`; second child grows by default) |
| Stat | `stat` | Planned — [`plans/components/stat.md`](components/stat.md) (`stats` is the component; 7 files — most in the library) |
| Status | `status` | **Implemented** — [`plans/components/status.md`](components/status.md) (10 stories; no slot; uneven size steps; visual pass open) |
| Table | `table` | Planned — [`plans/components/table.md`](components/table.md) (one class, no parts; ships in the utilities layer so daisyUI emits responsive variants) |
| Text Rotate | `text-rotate` | **Implemented** — [`plans/components/text-rotate.md`](components/text-rotate.md) (8 stories; generated inner track, 6-item ceiling; visual pass open) |
| Timeline | `timeline` | **Implemented** — [`plans/components/timeline.md`](components/timeline.md) (five components, one row for all; 16 stories; connector `hr`s generated by `TimelineItem`; visual pass open) |

### Navigation
| Component | Slug | Status |
|---|---|---|
| Breadcrumbs | `breadcrumbs` | **Implemented** — [`plans/components/breadcrumbs.md`](components/breadcrumbs.md) (8 stories; `nav` root by default; visual pass open) |
| Dock | `dock` | **Implemented** — [`plans/components/dock.md`](components/dock.md) (`Dock`/`DockItem`/`DockLabel`, one row for all three; 16 stories; `position: fixed` is built in; visual pass open) |
| Link | `link` | **Implemented** — [`plans/components/link.md`](components/link.md) (15 stories; `hover` removes the underline; visual pass open) |
| Megamenu | `megamenu` | Planned — [`plans/components/megamenu.md`](components/megamenu.md) (Popover API + anchor positioning; max 10 items) |
| Menu | `menu` | Planned — [`plans/components/menu.md`](components/menu.md) (16 classes, 5 as props; items are bare `<li><a>`) |
| Navbar | `navbar` | Planned — [`plans/components/navbar.md`](components/navbar.md) (`Navbar`+start/center/end; 50%/50% halves) |
| Pagination | `pagination` | Planned — [`plans/components/pagination.md`](components/pagination.md) (**no component**: daisyUI has no pagination class; served by `Join` + `Button`) |
| Steps | `steps` | **Implemented** — [`plans/components/steps.md`](components/steps.md) (`Steps`+`Step`+`StepIcon`, one row for all three; 18 stories; visual pass open) |
| Tab | `tab` | **Implemented** — [`plans/components/tab.md`](components/tab.md) (`Tabs`/`Tab`/`TabContent`, one row for all three; 22 stories; `tabs` is the component; panels need the radio shape; visual pass open) |

### Feedback
| Component | Slug | Status |
|---|---|---|
| Alert | `alert` | Planned — [`plans/components/alert.md`](components/alert.md) (current code is a dummy scaffold) |
| Loading | `loading` | **Implemented** — [`plans/components/loading.md`](components/loading.md) (12 stories; no colour prop, no slot; animation unverified until the visual pass) |
| Progress | `progress` | **Implemented** — [`plans/components/progress.md`](components/progress.md) (15 stories; indeterminate asserted in the build; visual pass open) |
| Radial progress | `radial-progress` | **Implemented** — [`plans/components/radial-progress.md`](components/radial-progress.md) (10 stories; `value` required; aria derived from it; visual pass open) |
| Skeleton | `skeleton` | **Implemented** — [`plans/components/skeleton.md`](components/skeleton.md) (9 stories; no size of its own; visual pass open) |
| Toast | `toast` | Planned — [`plans/components/toast.md`](components/toast.md) (position:fixed escapes the Storybook canvas; align/position naming shared with Indicator) |
| Tooltip | `tooltip` | Planned — [`plans/components/tooltip.md`](components/tooltip.md) (seven colors, not eight — neutral is the base; align swaps axis on left/right) |

### Data Input
| Component | Slug | Status |
|---|---|---|
| Calendar | `calendar` | Planned — [`plans/components/calendar.md`](components/calendar.md) (daisyUI Calendar is theme CSS for 3rd-party calendars, not a component; plan scopes to Cally only) |
| Checkbox | `checkbox` | Planned — [`plans/components/checkbox.md`](components/checkbox.md) (scaffold is missing `type="checkbox"` — renders a text input) |
| Fieldset | `fieldset` | Planned — [`plans/components/fieldset.md`](components/fieldset.md) (`Fieldset`+`FieldsetLegend`; children are grid rows, keep them flat) |
| File Input | `file-input` | Planned — [`plans/components/file-input.md`](components/file-input.md) (scaffold missing `type="file"`, same bug as Checkbox) |
| Filter | `filter` | Planned — [`plans/components/filter.md`](components/filter.md) (options are `Button as="input"`; label comes from `aria-label`) |
| Label | `label` | Planned — [`plans/components/label.md`](components/label.md) (`Label`+`FloatingLabel`; neither is a plain form label) |
| Radio | `radio` | **Implemented** — [`plans/components/radio.md`](components/radio.md) (15 stories; scaffold's missing `type` fixed; visual pass open) |
| Range | `range` | **Implemented** — [`plans/components/range.md`](components/range.md) (20 stories; scaffold's missing `type` fixed; visual pass open) |
| Rating | `rating` | Planned — [`plans/components/rating.md`](components/rating.md) (radio group + Mask shapes; `:has(~ :checked)` fill) |
| Select | `select` | Planned — [`plans/components/select.md`](components/select.md) (first component where the `size` collision has a real cost) |
| Text Input | `text-input` | Planned — [`plans/components/text-input.md`](components/text-input.md) (dual root: input or label wrapper; type narrowed to daisyUI documented twelve) |
| Textarea | `textarea` | Planned — [`plans/components/textarea.md`](components/textarea.md) (scaffold whitespace kills placeholder; sizes change font only) |
| Toggle | `toggle` | Planned — [`plans/components/toggle.md`](components/toggle.md) (size classes select [type=checkbox]; colors only render while checked) |
| Validator | `validator` | Planned — [`plans/components/validator.md`](components/validator.md) (**no Validator component**: the class only sets --input-color for other controls; ships `ValidatorHint` only) |
| OTP | `otp` | **Implemented** — [`plans/components/otp.md`](components/otp.md) (10 stories; scaffold's `div` root fixed to `label`; visual pass open) |

### Layout
| Component | Slug | Status |
|---|---|---|
| Divider | `divider` | **Implemented** — [`plans/components/divider.md`](components/divider.md) (11 stories; empty divider verified to have zero child nodes; visual pass open) |
| Drawer sidebar | `drawer` | Planned — [`plans/components/drawer.md`](components/drawer.md) (`Drawer`+`DrawerButton`; sibling-order-dependent skeleton, required `toggleId`) |
| Footer | `footer` | Planned — [`plans/components/footer.md`](components/footer.md) (`Footer`+`FooterTitle`; grid of grids, center changes the flow axis) |
| Hero | `hero` | Planned — [`plans/components/hero.md`](components/hero.md) (`Hero`+`HeroContent`+`HeroOverlay`; one-cell grid) |
| Indicator | `indicator` | Planned — [`plans/components/indicator.md`](components/indicator.md) (`Indicator`+`IndicatorItem`; placement is two axes, on the item) |
| Join (group items) | `join` | Planned — [`plans/components/join.md`](components/join.md) (a *utility*, not a component; items may be nested) |
| Mask | `mask` | **Implemented** — [`plans/components/mask.md`](components/mask.md) (21 stories; `shape` required; found the two §5c inference rules; visual pass open) |
| Stack | `stack` | Planned — [`plans/components/stack.md`](components/stack.md) (first child is the front; only 3 distinct layers) |

### Mockup
| Component | Slug | Status |
|---|---|---|
| Browser | `browser-mockup` | **Implemented** — [`plans/components/browser-mockup.md`](components/browser-mockup.md) (7 stories; gated `toolbar` slot carries the dots; visual pass open) |
| Code | `code-mockup` | **Implemented** — [`plans/components/code-mockup.md`](components/code-mockup.md) (9 stories; bare `pre` lines, `data-prefix` is the API; visual pass open) |
| Phone | `phone-mockup` | **Implemented** — [`plans/components/phone-mockup.md`](components/phone-mockup.md) (`PhoneMockup`+camera+display, one row for all three; 6 stories; visual pass open) |
| Window | `window-mockup` | **Implemented** — [`plans/components/window-mockup.md`](components/window-mockup.md) (7 stories; one class, frame is caller-supplied; visual pass open) |

## Workflow for a new component

1. Copy `plans/TEMPLATE.md` to `plans/components/<slug>.md`.
2. Fill it in against the real daisyUI doc page for that component (`daisyui.com/components/<slug>/`) — read the actual modifier class list, don't guess from memory or from another component's axes. Capture the page's examples too; they become the stories (§8).
3. Prototype the component and render it in Storybook before finalising the plan. Button's plan found two defects this way (a variant prop name that silently ate a native attribute, and a disabled state that was inaccessible on `<a>`) — neither was visible from reading the docs. `pnpm build-storybook` then grepping `storybook-static/` for the rendered markup is a quick headless check when a browser isn't handy.
4. Update this file's table row to **Planned**.
5. Implement per the plan (component + stories).
6. Update the table row to **Implemented**.
