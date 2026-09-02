# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Scope: the `daisy-astro` package. Repo-wide context is in the root `CLAUDE.md`; the reasoning and
measurements behind every rule below are in `plans/README.md`, cited by section.

## The component shape

Every component is the same shape, and deviations are usually a bug:

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props FIRST — a `const` above it silently breaks generic inference (§5c).
interface Props extends HTMLAttributes<'button'> {
  color?: DaisyColor;
}

const COLOR: Record<DaisyColor, string> = { primary: 'btn-primary', /* … */ };

const { color, class: className, ...rest } = Astro.props;
---
<button class:list={['btn', color && COLOR[color], className]} {...rest}><slot /></button>
```

- **Variant classes are literal strings in a `Record` map.** Never interpolated — Tailwind finds
  nothing in an interpolated name and the component renders invisibly unstyled (§1b).
- **`class:list` merges, never string concatenation.** It skips falsy entries, so `color && MAP[color]`
  and `{ 'btn-active': active }` compose directly. The caller's `class` is destructured (reserved word)
  and merged last.
- **`...rest` on the root is mandatory**, not polish — it carries native attributes *and* the parent's
  `data-astro-cid-*` scoped-style attribute (§6).
- **Shared unions** (`DaisyColor`, `DaisySize`) come from `src/lib/variants.ts`. Import only the axes
  the component's real daisyUI doc page has — not every component has all five sizes (§3).
- **Content comes through slots**, never content props. Gate an optional wrapper with
  `Astro.slots.has('name')` or daisyUI's padding renders a visible empty box (§5).
- **Zero JS.** No component here needs a script; daisyUI uses `<dialog>`, `<details>` and the checkbox
  hack deliberately. Interactivity that genuinely needs script is caller-side (§6, §7).
- **Polymorphic `as`** uses `Polymorphic<{ as: Tag }>` from `astro/types`, not a hand-rolled generic.

## Adding a component means editing four places

`src/components/<Name>/<Name>.astro` is one of them. The other three are silent if forgotten:

1. **`src/index.ts`** — the package's whole export surface. Missing line = unimportable by consumers,
   and every check still passes (§3c).
2. **`src/_typecheck.astro`** — a never-imported file holding one valid usage of every component,
   including a native attribute of its default element passed **without** `as`. Without it, nothing in
   `src` uses the component (stories are `.ts`), so a broken `Props` passes `astro check`. Mask shipped
   that way for a commit (§5c).
3. **`plans/README.md`'s checklist row** → **Implemented**.

Sub-components live in the parent's directory (`Card/CardBody.astro`), because the directory is one
daisyUI *doc page*, not one file (§3b).

## Traps that fail silently

Each was found by measurement, not reasoning, and each produces working-looking markup:

- **`multiple={false}` renders as enabled.** Astro drops `disabled`/`required`/`checked` when false but
  not `multiple`, and HTML treats any value as on. Normalise: `multiple={multiple ? true : undefined}`.
  Any enumerated-not-boolean native attribute needs this (§5d).
- **A hardcoded attribute plus `...rest` emits it twice**, and the parser keeps the first — so the
  component's value wins and the caller's is dropped without a warning. If a caller's value should ever
  win, make it a prop (§5e).
- **`color` and `title` type-check on every component**, declared or not, because Astro's base
  `HTMLAttributes` has them. They forward as plain attributes and emit no class. Check a new prop name
  against the base interface, not just the element's own attributes (§5d).

## Storybook

`@storybook-astro/framework` on Storybook 10. Stories are plain objects — no `Meta`/`StoryObj`
annotations, since the framework ships no equivalents. Slot content goes through `args.slots`, whose
values may be HTML strings or `{ component, props, slots }` descriptors, so a row-of-all-variants story
is a plain array (see `Button.stories.ts`).

- **`component:` must be the direct `.astro` import, never the barrel.** The framework filters its
  prerender pass on a `.astro` path, so a barrel import leaves the story in the sidebar with no rendered
  output and no error (§3d). Components inside a slot tree may come from anywhere.
- **Stories mirror the daisyUI doc-page examples** — same markup, same order, same wording, with props
  substituted for the classes. That is what makes a wrong wrapper visible on sight (§8).
- Slot sanitization is disabled in `.storybook/main.ts` on purpose: the default allowlist has no `svg`,
  `button` or form elements, which is most story content here.
- Styling reaches the preview via `.storybook/preview.css` plus the Tailwind Vite plugin in
  `astro.config.mjs`, which the framework picks up automatically.

## Type-checking

`npx astro check` from this directory. `tsc` does not parse `.astro` at all and will report success on a
broken component. TypeScript is pinned to **6.x** — `astro check` uses the language-server API that
TypeScript 7 does not expose (§5b). `tsconfig.json`'s `exclude` is load-bearing: without it the check
walks `storybook-static/` and reports thousands of errors from minified output.
