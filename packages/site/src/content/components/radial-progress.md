---
description: A circular ring showing progress toward completion, with room for a label in the center.
referenceUrl: https://daisyui.com/components/radial-progress/
referenceLabel: View this component on daisyUI
---

`RadialProgress` renders a `<div role="progressbar">` — a `div`, not `<progress>`, because browsers
can't render text inside a `<progress>` element. Content is passed through the default slot and is
centered inside the ring automatically.

## Props

| Prop | Type | Notes |
|---|---|---|
| `value` | `number` | **Required.** 0–100, drives the ring and `aria-valuenow` together. |
| `size` | `string` | Any CSS length, e.g. `'12rem'`. Defaults to `5rem`. |
| `thickness` | `string` | Any CSS length. Defaults to 10% of `size`. |

Every native `<div>` attribute forwards as well (`id`, `class`, `style`, `data-*`, ...). `role` and
`aria-valuenow` are set automatically and always stay in sync with `value`.

## `value` is required — there's no indeterminate state here

Unlike `Progress`'s native `<progress>` element, a `div` has no built-in "unknown progress" state, so
an omitted value has no sensible meaning. `value` isn't clamped either — pushing it past 100 keeps the
ring's leading dot rotating past the top rather than stopping, which is daisyUI's own behavior.

## Color is `currentColor`, and the background disc is separate

Recolor the ring with a text utility: `class="text-primary"`. Filling the disc behind it needs its own
utilities too — `class="bg-primary text-primary-content border-4 border-primary"` — there's no single
prop for both. Note that the element uses `box-sizing: content-box`, so a `border` grows the element
outward rather than eating into the ring; that's what keeps the geometry correct.
