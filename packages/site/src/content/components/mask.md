---
description: Crops an element into a shape — a heart, hexagon, star and more — using a CSS mask.
referenceUrl: https://daisyui.com/components/mask/
referenceLabel: View this component on daisyUI
---

`Mask` defaults to an `<img>` root, masking the image directly, matching daisyUI's own examples. Use
`as="div"` to mask a wrapper around other content instead — the shape Avatar uses internally.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'img' \| 'div' \| ...` | Defaults to `img`. With the default, the slot must stay empty — `<img>` is void. |
| `shape` | 15-value union (**required**) | `squircle`, `heart`, `hexagon`, `hexagon-2`, `decagon`, `pentagon`, `diamond`, `square`, `circle`, `star`, `star-2`, `triangle`, `triangle-2`, `triangle-3`, `triangle-4`. |
| `half` | `'1' \| '2'` | Shows one half of the shape. |

Every native attribute of the rendered tag — `src`, `alt`, `loading`, and so on — forwards through as
well.

## `shape` is required

The base `mask` class sets positioning but no actual mask image, so a `Mask` with no shape renders the
element completely unmasked — visually identical to not using the component at all, with no error to
catch it. There's no default shape; you have to pick one.

## `half` zooms the mask, it doesn't clip

`half="1"` and `half="2"` scale the mask to 200% and anchor it to one edge, showing that half of the
shape stretched across the element's full width — not a half-width crop. To get a visual "half star",
also halve the element's own width.

## Give it a square box

The mask scales to fit the element and centres, so a non-square box leaves the shape floating with
empty space around it rather than stretching to fill it. Every daisyUI example uses something like
`class="w-40 h-40"`.
