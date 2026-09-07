---
description: A responsive grid of link columns, typically placed at the bottom of a page.
referenceUrl: https://daisyui.com/components/footer/
referenceLabel: View this component on daisyUI
---

`Footer` lays out its direct children as columns, and each column is itself a small grid laying out its
own links. Columns are bare `<nav>`, `<aside>` or `<form>` elements with no class at all — daisyUI
styles them by position, so there's no `FooterColumn` component. `FooterTitle` is the column heading.

## Props

### `Footer`

| Prop | Type | Notes |
|---|---|---|
| `direction` | `'horizontal' \| 'vertical'` | Unconditional direction. For the common responsive footer, use a class instead — see below. |
| `center` | `boolean` | Centres the columns. Changes what `direction` means when combined — see below. |

### `FooterTitle`

| Prop | Type | Notes |
|---|---|---|
| `as` | `'h6' \| 'p' \| ...` | Heading level. Defaults to `h6`, matching daisyUI's own examples; the styling is presentational so any tag works. |

## Most footers want the responsive class, not the prop

Nearly every daisyUI example stacks columns on mobile and spreads them horizontally above a breakpoint:

```astro
<Footer class="sm:footer-horizontal bg-neutral text-neutral-content p-10">
```

The `direction` prop only covers the unconditional case — there's no responsive prop, since a single
value can't express a breakpoint change.

## `center` changes what `direction` means

`center` isn't a plain alignment tweak: on its own it already flows in columns, and adding
`direction="horizontal"` on top of it *flips the flow back to rows*. Test the exact combination you
want rather than assuming the two stack predictably.

## Every direct child becomes a column

Because daisyUI styles `.footer`'s direct children, wrapping a group of links in an extra `<div>` makes
that div the column instead of the links inside it — the wrapper takes the column styling and collapses
everything inside into one cell.
