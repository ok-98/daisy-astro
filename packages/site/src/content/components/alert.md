---
description: Alerts call out an important message — an info notice, a success confirmation, a warning, or an error — inline in the page.
referenceUrl: https://daisyui.com/components/alert/
referenceLabel: View this component on daisyUI
---

`Alert` renders a `<div role="alert">`. Content is passed through the default slot as siblings — an
icon plus a `<span>` of text is the usual shape — and `role="alert"` is set for you, though you can
override it.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `'info' \| 'success' \| 'warning' \| 'error'` | Only four colors exist for alerts — not the full 8-color palette other components use. |
| `variant` | `'outline' \| 'dash' \| 'soft'` | |
| `direction` | `'vertical' \| 'horizontal'` | |
| `role` | `AriaRole` | Defaults to `'alert'`. Pass `role="status"` for a less urgent, "polite" announcement. |

Every native `<div>` attribute forwards as well (`id`, `class`, `data-*`, event handlers, ...).

## Layout depends on how many children you pass

`Alert` lays out its content with CSS grid, and the grid's column template changes based on how many
direct children the element has. That means **wrapping your content in an extra `<div>`** collapses it
to a single child and silently breaks the icon/text/actions layout — always pass the icon, text, and
any action buttons as separate top-level children of `Alert`, not nested inside one wrapper:

```astro
<Alert color="info">
  <svg>...</svg>
  <span>New software update available.</span>
</Alert>
```

## No `size` prop, no `primary`/`secondary`/`accent`/`neutral` colors

Unlike `Button` or `Progress`, `Alert` only has four color options and no size axis at all — those
classes simply don't exist in daisyUI's alert CSS. If you need a fifth color, style with plain Tailwind
classes on the children instead.
