---
description: A carousel scrolls a row of items with CSS scroll-snap, no JavaScript required.
referenceUrl: https://daisyui.com/components/carousel/
referenceLabel: View this component on daisyUI
---

`Carousel` is a scroll-snap container, not a slider widget — daisyUI implements the whole thing in
CSS, with `overflow-x: scroll` and `scroll-snap-type`. There's no autoplay, no current-index state, and
no `<script>` anywhere in this component or the ones it wraps.

## Props

### `Carousel`

| Prop | Type | Notes |
|---|---|---|
| `snap` | `'start' \| 'center' \| 'end'` | Where items snap. Goes on the container — daisyUI reaches the items through a descendant selector. |
| `direction` | `'horizontal' \| 'vertical'` | `vertical` needs a height on `Carousel` and `h-full` on each item, instead of a width. |

### `CarouselItem`

No variant props — the snap behaviour lives entirely on the parent `Carousel`.

## The container needs a width (or height)

`Carousel` is `inline-flex` and has no width of its own. Without one it shrinks to fit its content and
never scrolls — give it `class="w-96"` or similar (`h-96` for a vertical carousel).

## Items don't shrink, and padding adds to their width

Each `CarouselItem` is `flex: none` — size it explicitly with a Tailwind width class. It's also
`box-sizing: content-box`, the one place in this library that departs from Tailwind's default border-box
sizing, so padding or a border on an item adds to its width instead of fitting inside it. That's why a
"full-bleed" carousel puts padding on the `Carousel` itself and never on an item.

## The scrollbar is hidden

daisyUI hides the native scrollbar entirely, which also removes the usual visual cue that more content
exists. Give the carousel `tabindex="0"` and an `aria-label` if its items aren't independently
focusable, or provide your own prev/next controls as anchor links to each item's `id`.
