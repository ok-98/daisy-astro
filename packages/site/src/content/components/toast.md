---
description: A fixed-position stack for showing brief messages — usually built from Alert — anchored to a corner of the screen.
referenceUrl: https://daisyui.com/components/toast/
referenceLabel: View this component on daisyUI
---

`Toast` renders a `<div>` that positions and stacks whatever you put inside it — typically one or more
`Alert` components. It has no styling of its own beyond layout: content supplies all the visible color.

## Props

| Prop | Type | Notes |
|---|---|---|
| `align` | `'start' \| 'center' \| 'end'` | Horizontal placement. Defaults to `end`. |
| `position` | `'top' \| 'middle' \| 'bottom'` | Vertical placement. Defaults to `bottom`. |

Every native `<div>` attribute forwards as well (`id`, `class`, `role`, `aria-live`, `data-*`, ...).

## It's `position: fixed` — that's correct, not a bug

`Toast` anchors to the viewport, not to any parent element, which is exactly what daisyUI's published
markup does. On this documentation page, that means the live example below will visually escape its
bounded preview box rather than staying contained inside it — that's expected behavior for a real
toast on a real page, not something to work around.

## Stacking order follows document order, not placement

Multiple children stack top-to-bottom in the order you write them, regardless of whether the toast is
anchored to the top or bottom of the screen. `Toast` also adds no live-region attributes by default —
if you're injecting toasts client-side, add `aria-live="polite"` yourself, or rely on `Alert`'s own
built-in `role="alert"` on each message.
