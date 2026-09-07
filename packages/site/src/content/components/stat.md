---
description: Displays a labeled number, like a dashboard metric, with an optional icon and actions.
referenceUrl: https://daisyui.com/components/stat/
referenceLabel: View this component on daisyUI
---

daisyUI names the *container* `stats` and the individual block `stat` — the reverse of what the plural
suggests. This library follows that: `Stats` is the outer wrapper, and it holds one or more `Stat`
blocks, each built from `StatTitle`, `StatValue`, `StatDesc`, `StatFigure`, and `StatActions`.

## Props

| Component | Prop | Type | Notes |
|---|---|---|---|
| `Stats` | `as` | `'div' \| 'dl' \| ...` | Defaults to `div`. Use `dl` (with `StatTitle as="dt"` / `StatValue as="dd"`) for a real description list. |
| `Stats` | `direction` | `'horizontal' \| 'vertical'` | `horizontal` is the default. |
| `Stat`, `StatTitle`, `StatValue`, `StatDesc`, `StatFigure`, `StatActions` | `as` | tag name | All seven components are polymorphic; each defaults to `div`. |

All seven forward native attributes for whatever tag they render.

## `StatFigure` always lands in the second column, regardless of source order

Each `Stat` is a two-column grid: `StatFigure` is pinned to column two and vertically centered no matter
where you write it in the slot, while `StatTitle`, `StatValue`, `StatDesc`, and `StatActions` all stack
in column one **in the order you write them**. That's why there's no `title`/`value`/`desc` props on
`Stat` — daisyUI's own examples reorder them freely (one puts the value before the title), and fixed
named slots would break that.

## `Stats` has no background or shadow by default

It's an unframed, horizontally-scrolling row by default — every real example adds `class="shadow"` or
`class="bg-base-100 border border-base-300"`. For the common "stack on mobile, row on desktop" layout,
use a caller class rather than the `direction` prop alone: `class="stats-vertical lg:stats-horizontal"`.

## No colour or size axis

None of the seven components has a `color` or `size` prop — daisyUI defines none for this component.
Colour on a value or figure (`class="text-primary"`) is plain Tailwind on the part itself. The dashed
divider between blocks is automatic and switches edge (trailing vs. bottom) along with `direction`.
