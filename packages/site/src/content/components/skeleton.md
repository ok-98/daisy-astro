---
description: A shimmering placeholder shape shown in place of content while it loads.
referenceUrl: https://daisyui.com/components/skeleton/
referenceLabel: View this component on daisyUI
---

`Skeleton` renders a `<div>` by default and is polymorphic via `as`. Content is optional — leave it
empty for a placeholder shape, or fill it for the text-shimmer mode described below.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `HTMLTag` | Changes the rendered tag. Defaults to `div`. |
| `text` | `boolean` | Shimmers the text itself instead of a background box — see below. |

Every native attribute of the rendered tag forwards as well (`id`, `class`, `style`, `data-*`, ...).

## It has no size of its own

`Skeleton` sets no width or height — a bare `<Skeleton />` with no size classes is a zero-height block
and renders nothing at all. Every real use needs a `class` like `h-4 w-28` or `h-16 w-16 rounded-full`.

## `text` shimmers the glyphs, and needs real content

Setting `text` makes the text color transparent and clips the shimmer gradient to the letters
themselves, rather than drawing a background box. That means:

- With no children, `text` mode renders **nothing visible at all** — there's no fallback text.
- The content is real, selectable, screen-reader-visible text — this mode is for animating actual
  copy (like "AI is thinking..."), not a generic placeholder shape.
- Pair `text` with `as="span"` for an inline shimmering phrase inside a sentence; `Skeleton` doesn't
  switch the tag for you automatically.
