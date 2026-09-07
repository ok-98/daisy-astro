---
description: A group of images that swap into view as the pointer moves across them.
referenceUrl: https://daisyui.com/components/hover-gallery/
referenceLabel: View this component on daisyUI
---

`HoverGallery` lays its children out as vertical strips over a resting image; hovering a strip swaps it
into full view. Children are your own `<img>` elements — there's no `images` array prop, since each
image needs its own `alt` and loading behaviour.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'div' \| 'figure' \| ...` | Changes the rendered tag. Defaults to `div`. Use `figure` when the gallery is a self-contained illustration. |

Every native attribute of the rendered tag forwards as well.

## The first image is a resting frame, not a hover target

The first child is shown at rest and is removed the instant the pointer enters — it isn't reachable by
hovering. An N-image gallery therefore gives N−1 hover targets. Duplicate your first image
(`[cover, cover, B, C]`) so every photo is reachable, or use a distinct cover image on purpose. Passing
three images expecting three hover targets actually gives two, with the first stuck unreachable.

## It caps at ten children

The eleventh child and beyond render as `display: none` with no warning — a gallery holds a resting
frame plus at most nine hoverable images.

## Give it a height

The root has no height of its own and its children stretch to fill it, so an unsized gallery collapses.
Set an explicit height (`class="h-64"`) on the component. If you use `as="figure"`, put any
`<figcaption>` **outside** the gallery — anything placed inside becomes another hover strip.
