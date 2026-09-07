---
description: A vertical list of rows, each laid out as a grid of auto-sized and growing columns.
referenceUrl: https://daisyui.com/components/list/
referenceLabel: View this component on daisyUI
---

`List` renders a `<ul>` and `ListRow` an `<li>`. Rows aren't a plain default slot handed an array — a
`List` can mix `ListRow`s with plain `<li>` section headers, exactly like daisyUI's own examples do.

## Props

| Prop | Type | Notes |
|---|---|---|
| — | — | Neither component has a variant prop — no colour, size, or style axis exists. Styling (`bg-base-100 rounded-box shadow-md`) is plain Tailwind on `List`. |

Both extend their native element's attributes (`List` → `<ul>`, `ListRow` → `<li>`).

## The second child in a row grows by default

Each `ListRow` is a single-row grid where the **second** child takes up the remaining space and every
other child sizes to its content. That's why a row of avatar / text / buttons lays out correctly with no
configuration — the text block is the second element. Get the order wrong and the wrong child stretches,
silently. To move the growth elsewhere, put the daisyUI class `list-col-grow` directly on one of the
row's own children (it only works for the first six positions) — this isn't a prop, since it targets
markup you write inside the row.

## `list-col-wrap` drops a child to a second row

Also a caller class, not a prop: `class="list-col-wrap"` on one of a row's children moves it to a second
grid row while keeping its original column position — so a wrapped description starts under the text
block, not under the avatar.

## Rows need real `<li>` children

`List`'s children must be `<li>` elements — a stray `<div>` inside a `<ul>` is invalid HTML. This is why
section headers in the examples are plain `<li>`s rather than `<div>`s.
