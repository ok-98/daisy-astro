---
description: Groups items into one control with shared outer corners and single-width borders between them.
referenceUrl: https://daisyui.com/components/join/
referenceLabel: View this component on daisyUI
---

`Join` is a layout utility, not a component with parts — daisyUI ships no `.join-item` sub-component,
so you add `class="join-item"` directly to whatever you're grouping: buttons, text inputs, a select.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'div' \| 'nav' \| ...` | Defaults to `div`. Use `as="nav"` when building a pager out of `Join` + `Button`, since `.join` has no semantics of its own. |
| `direction` | `'horizontal' \| 'vertical'` | Unconditional direction. `horizontal` is daisyUI's default. |

Every native attribute of the rendered tag forwards through as well.

## There's no `JoinItem` component

`join-item` is a class you add to a component you already have, not a wrapper — a `JoinItem` would have
to re-expose every prop of whatever it wrapped. Write `<Button class="join-item">` directly.

## Items don't have to be direct children

Unlike most layout components here, daisyUI designed `join-item` to work through wrapper elements: the
corner radii are passed down as inherited CSS custom properties, so a joined item nested a couple of
`<div>`s deep still gets the right corners.

## Responsive grouping is a class, not a prop

For the common "stacked on mobile, joined horizontally on desktop" layout, skip the `direction` prop and
write the class directly: `class="join-vertical lg:join-horizontal"`.
