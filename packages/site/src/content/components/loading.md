---
description: A loading spinner or animated shape that shows an operation is in progress.
referenceUrl: https://daisyui.com/components/loading/
referenceLabel: View this component on daisyUI
---

`Loading` renders an empty `<span>` — the element itself is the animated graphic, drawn with an
animated SVG mask. It takes no children and has no `color` prop.

## Props

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'spinner' \| 'dots' \| 'ring' \| 'ball' \| 'bars' \| 'infinity'` | Omitting this still renders a spinner — see below. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |

Every native `<span>` attribute forwards as well (`id`, `class`, `aria-label`, `data-*`, ...).

## Color comes from text color, not a prop

The graphic is painted with `currentColor`, so recoloring it is a plain Tailwind text utility:
`<Loading class="text-primary" />`. Inside a `Button`, it automatically inherits the button's own
foreground color with no class needed at all — that's the most common use.

## `<Loading />` with no `variant` is already a spinner

The base class carries the full spinner animation by itself; `variant="spinner"` is just the explicit
spelling of the default. A typo'd or unset `variant` never renders nothing — it always falls back to a
spinner.

## It's decorative — add your own accessible name

Every instance renders as an empty, `pointer-events: none` span, so a screen reader gets nothing from
it by default. That's usually fine inside a button whose own label still reads ("Saving..."), but for a
standalone loading indicator, pass `aria-label="Loading"` yourself.
