---
description: Piles elements on top of each other with a peeking offset, like a stack of cards.
referenceUrl: https://daisyui.com/components/stack/
referenceLabel: View this component on daisyUI
---

`Stack` places its direct children in a 5×5 grid so they overlap with a small peeking edge. There's no
`items` prop — pass however many children you need through the default slot.

## Props

| Prop | Type | Notes |
|---|---|---|
| `direction` | `'top' \| 'bottom' \| 'start' \| 'end'` | Which way the pile leans — the direction of the peeking edges, not of the front card. `bottom` is daisyUI's default. |

Every native `<div>` attribute forwards through as well.

## The first child is the front of the pile

Source order runs front to back — the opposite of the usual "later elements paint on top" instinct. To
add something to the top of the stack, prepend it rather than append it.

## Only the first three children get their own position

A fourth child and beyond all land in exactly the same spot as the third, at the same opacity. They
still render — they're just visually indistinguishable from it. Every daisyUI example stacks exactly
three.

## Size the stack, not the children

`Stack` is `inline-grid` with no size of its own, and every child is stretched to fill it — a child's
own `w-*`/`h-*` is overridden. Either give the stack a size (`class="size-28"`), or leave it unsized and
let it take the size of its tallest child.
