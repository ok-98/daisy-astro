# daisy-astro Component Plan — Overview

**Goal:** wrap every daisyUI component as an Astro component (`packages/daisy-astro/src/components/<Name>.astro`), where every daisyUI variant/modifier class is a typed prop, every native HTML attribute for the underlying element is forwarded, and every component (with its variants) has Storybook coverage.

This document is the index and ruleset. Each component gets its own plan under `plans/components/<slug>.md`, written from `plans/TEMPLATE.md` when work on that component starts. This file does not implement anything — it defines the shared conventions so per-component plans don't each reinvent them, and tracks which components have a plan yet.

## Source of truth

daisyUI component list confirmed against the official docs (`daisyui.com/components/`) and the `daisyui` npm package source (`packages/daisyui/src/components/*.css` in `saadeghi/daisyui` on GitHub) on 2026-08-23. All 68 are part of the free, open-source `daisyui` package — none require a paid tier.

## Shared conventions (apply to every component plan)

### 1. Props = daisyUI variants + full native attribute passthrough

Every component's `Props` type:
- Extends `astro/types`' `HTMLAttributes<'tag'>` for whatever native element the component renders (`'button'`, `'a'`, `'input'`, `'div'`, ...), so every valid native attribute (`id`, `data-*`, `aria-*`, event handlers passed as strings for non-hydrated use, etc.) is accepted and forwarded automatically.
- Adds one prop per daisyUI variant axis the component supports (color, size, style, behavior, placement — whichever apply; see each component's own doc page for its actual modifier list, don't assume every axis applies to every component).
- Destructures the variant props out of `Astro.props`, leaves everything else in `...rest`, spreads `rest` onto the root element.

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

const { color, size, outline, class: className, ...rest } = Astro.props;
---
<button
  class:list={['btn', color && `btn-${color}`, size && `btn-${size}`, { 'btn-outline': outline }, className]}
  {...rest}
>
  <slot />
</button>
```

This is the pattern every component plan implements. `class:list` skips `false`/`null`/`undefined` entries, so `color && ...` and `{ 'btn-outline': outline }` compose cleanly without manual filtering.

### 3. Shared variant types live in one place

`packages/daisy-astro/src/lib/variants.ts` exports the reusable union types (`DaisyColor`, `DaisySize`, etc.) that most components share, so 68 files don't each redeclare `'primary' | 'secondary' | ...`. A component only imports the axes it actually supports — don't force a component into an axis its daisyUI classes don't have (e.g. not every component has all 5 sizes; check the real doc page).

This file is a **prerequisite**, created once, before or during the first component's implementation — not part of any single component's plan.

### 4. Storybook: one story file per component, one story per variant axis + a Playground

Following the pattern already proven in `packages/daisy-astro/.storybook/` (Container-API render bridge, see `plans/TEMPLATE.md` for the exact story shape):
- `Playground` story: full `argTypes` controls for every prop, default args.
- One additional story per meaningful variant axis (e.g. `Colors`, `Sizes`, `States`) rendering all values of that axis side by side, so a reviewer can see every option at a glance without clicking through controls one at a time.

### 5. Slots

If the component wraps multiple content areas (e.g. Card's figure/body/actions, Modal's header/body/actions), use named slots (`<slot name="..." />`) — document them explicitly in the component's plan, don't infer from memory.

## Status legend

- **Not started** — no plan file yet.
- **Planned** — `plans/components/<slug>.md` exists.
- **Implemented** — component + stories exist in `packages/daisy-astro/src/components/`.

## Component checklist (68)

### Actions
| Component | Slug | Status |
|---|---|---|
| Button | `button` | Implemented (example) |
| Dropdown | `dropdown` | Not started |
| FAB / Speed Dial | `fab` | Not started |
| Modal | `modal` | Not started |
| Swap | `swap` | Not started |
| Theme Controller | `theme-controller` | Not started |

### Data Display
| Component | Slug | Status |
|---|---|---|
| Accordion | `accordion` | Not started |
| Avatar | `avatar` | Not started |
| Aura | `aura` | Not started |
| Badge | `badge` | Not started |
| Card | `card` | Not started |
| Carousel | `carousel` | Not started |
| Chat bubble | `chat-bubble` | Not started |
| Collapse | `collapse` | Not started |
| Countdown | `countdown` | Not started |
| Diff | `diff` | Not started |
| Hover 3D card | `hover-3d-card` | Not started |
| Hover Gallery | `hover-gallery` | Not started |
| Kbd | `kbd` | Not started |
| List | `list` | Not started |
| Stat | `stat` | Not started |
| Status | `status` | Not started |
| Table | `table` | Not started |
| Text Rotate | `text-rotate` | Not started |
| Timeline | `timeline` | Not started |

### Navigation
| Component | Slug | Status |
|---|---|---|
| Breadcrumbs | `breadcrumbs` | Not started |
| Dock | `dock` | Not started |
| Link | `link` | Not started |
| Megamenu | `megamenu` | Not started |
| Menu | `menu` | Not started |
| Navbar | `navbar` | Not started |
| Pagination | `pagination` | Not started |
| Steps | `steps` | Not started |
| Tab | `tab` | Not started |

### Feedback
| Component | Slug | Status |
|---|---|---|
| Alert | `alert` | Not started |
| Loading | `loading` | Not started |
| Progress | `progress` | Not started |
| Radial progress | `radial-progress` | Not started |
| Skeleton | `skeleton` | Not started |
| Toast | `toast` | Not started |
| Tooltip | `tooltip` | Not started |

### Data Input
| Component | Slug | Status |
|---|---|---|
| Calendar | `calendar` | Not started |
| Checkbox | `checkbox` | Not started |
| Fieldset | `fieldset` | Not started |
| File Input | `file-input` | Not started |
| Filter | `filter` | Not started |
| Label | `label` | Not started |
| Radio | `radio` | Not started |
| Range | `range` | Not started |
| Rating | `rating` | Not started |
| Select | `select` | Not started |
| Text Input | `text-input` | Not started |
| Textarea | `textarea` | Not started |
| Toggle | `toggle` | Not started |
| Validator | `validator` | Not started |
| OTP | `otp` | Not started |

### Layout
| Component | Slug | Status |
|---|---|---|
| Divider | `divider` | Not started |
| Drawer sidebar | `drawer` | Not started |
| Footer | `footer` | Not started |
| Hero | `hero` | Not started |
| Indicator | `indicator` | Not started |
| Join (group items) | `join` | Not started |
| Mask | `mask` | Not started |
| Stack | `stack` | Not started |

### Mockup
| Component | Slug | Status |
|---|---|---|
| Browser | `browser-mockup` | Not started |
| Code | `code-mockup` | Not started |
| Phone | `phone-mockup` | Not started |
| Window | `window-mockup` | Not started |

## Workflow for a new component

1. Copy `plans/TEMPLATE.md` to `plans/components/<slug>.md`.
2. Fill it in against the real daisyUI doc page for that component (`daisyui.com/components/<slug>/`) — read the actual modifier class list, don't guess from memory or from another component's axes.
3. Update this file's table row to **Planned**.
4. Implement per the plan (component + stories).
5. Update the table row to **Implemented**.
