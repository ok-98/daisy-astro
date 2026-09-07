---
description: Rating shows a row of clickable shapes, usually stars, for letting a user pick a score.
referenceUrl: https://daisyui.com/components/rating/
referenceLabel: View this component on daisyUI
---

`Rating` renders a `<div>` that wraps a radio group — the items themselves are yours. There's no
`value`/`max` API: each item is an `<input type="radio">` sharing one `name`, with its own `aria-label`
and shape. Radios that share a `name` fill left-to-right purely in CSS, with no JavaScript.

## Props

| Prop | Type | Notes |
|---|---|---|
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |
| `half` | `boolean` | Halves the width of every child — pair it with twice as many items (see below). |

Every native attribute of the rendered `<div>` forwards through as well.

## Items are slot content, not a `value`/`max` prop

The shapes come from daisyUI's `Mask` component (`mask mask-star-2`, for example), and items often carry
per-item colours or alternating half-star classes — none of which two numbers could express:

```astro
<Rating>
  <input type="radio" name="rating-1" class="mask mask-star-2" aria-label="1 star" />
  <input type="radio" name="rating-1" class="mask mask-star-2" aria-label="2 star" checked />
</Rating>
```

Because the radios are `appearance: none`, **`aria-label` is each item's only accessible name** —
without it a screen reader announces a row of unlabelled radios.

## Clearing and read-only ratings have no dedicated prop

To let a rating be cleared back to "no selection", add an invisible first item with class
`rating-hidden` and its own `aria-label` (`"clear"`, say). It must come first, since the fill rule lights
up everything *before* the checked item.

For a display-only rating, swap the radios for plain `<div>`s and mark the selected one with
`aria-current="true"` — same component, different children, no `readonly` prop.

## Colour is a class on each item, not a prop

There's no `color` prop. Every coloured example in daisyUI's docs gives each item its own `bg-*` class
(`bg-orange-400`, for instance) — unselected items sit at 20% opacity and selected ones at full, so one
class covers both states.
