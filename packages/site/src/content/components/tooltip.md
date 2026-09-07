---
description: A small popup label that appears when hovering or focusing an element, explaining what it does.
referenceUrl: https://daisyui.com/components/tooltip/
referenceLabel: View this component on daisyUI
---

`Tooltip` renders a `<div>` wrapping its trigger, with the bubble text supplied either as a `tip` prop
or as rich markup in the `content` slot. The trigger itself goes in the default slot.

## Props

| Prop | Type | Notes |
|---|---|---|
| `tip` | `string` | Bubble text, rendered as `data-tip`. An empty string shows no tooltip at all. |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | Which side the bubble appears on. Defaults to `top`. |
| `align` | `'start' \| 'center' \| 'end'` | Cross-axis alignment — see below. Defaults to `center`. |
| `open` | `boolean` | Forces the bubble visible without hover or focus. |
| `color` | `Exclude<DaisyColor, 'neutral'>` | Seven colors — no `neutral`, since neutral is already the default. |

Every native `<div>` attribute forwards as well (`id`, `class`, `aria-*`, `data-*`, ...). For markup
instead of plain text, fill the `content` slot instead of passing `tip`.

## `align`'s axis flips depending on `position`

`align` always means the *cross* axis relative to the bubble's side — which is horizontal when the
bubble sits on `top`/`bottom`, but **vertical** when it sits on `left`/`right`. So
`<Tooltip position="left" align="start">` aligns the bubble to the top, not the left — easy to get
wrong by guessing.

## It shows on hover and on keyboard focus, but screen readers get nothing

The bubble is drawn with a CSS pseudo-element fed by `data-tip`, which isn't reliably read by
assistive technology. Give the trigger element itself its own `aria-label` or `aria-describedby` if
the tooltip conveys information a screen-reader user needs.
