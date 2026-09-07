---
description: A styled HTML table for displaying tabular data.
referenceUrl: https://daisyui.com/components/table/
referenceLabel: View this component on daisyUI
---

`Table` renders a styled `<table>` and nothing else. daisyUI gives `thead`, `tbody`, `tr`, `th`, and
`td` no classes of their own, so there are no sub-components — the default slot takes your own table
markup verbatim.

## Props

| Prop | Type | Notes |
|---|---|---|
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Changes body font size and cell padding. |
| `zebra` | `boolean` | Stripes even `tbody` rows. `thead`/`tfoot` are unaffected. |
| `pinRows` | `boolean` | Sticky `thead` and `tfoot`. Needs a scrolling wrapper with an explicit height. |
| `pinCols` | `boolean` | Sticky columns — read the note below before using it. |

Every native `<table>` attribute forwards as well (`summary`, `id`, `class`, ...).

## You supply the scroll wrapper

Every daisyUI example wraps its table in `<div class="overflow-x-auto">`, with the height, width,
border, and background varying per example. `Table` doesn't bake one in — wrap it yourself, and add a
height (`class="h-96"`) whenever `pinRows` is set.

## `pinCols` pins every `<th>`, not "the first/last column"

The underlying selector targets every `<th>` in the table and sticks it to both edges at once. To use
pinned columns, write your **header cells as `<td>`** and reserve `<th>` only for the columns you
actually want pinned — the opposite of normal semantic HTML, and exactly what daisyUI's own pinned-
columns example does.

## No `TableRow` sub-component

Rows, cells, and heads are plain HTML with no styling hooks, so they're written directly inside the
slot — there's nothing a wrapper component would add beyond ceremony.
