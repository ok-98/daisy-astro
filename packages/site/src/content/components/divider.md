---
description: A thin rule, with optional text in the middle, that separates content into sections.
referenceUrl: https://daisyui.com/components/divider/
referenceLabel: View this component on daisyUI
---

`Divider` renders a `<div>`, never an `<hr>` — the line halves are `:before`/`:after` pseudo-elements,
which a void element can't generate, and it needs to hold text anyway. Content comes through the
default slot; an empty divider is a documented use, not a missing one.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | Colours the two line halves only — the text keeps its own colour. |
| `direction` | `'vertical' \| 'horizontal'` | `vertical` (default) divides stacked elements and draws a **horizontal** bar; `horizontal` divides side-by-side elements and draws a **vertical** bar. |
| `placement` | `'start' \| 'end'` | Pushes the text to one side by hiding the line half on that side. |

Every native `<div>` attribute forwards through `...rest` as well.

## An empty divider is a single unbroken line

`<Divider />` with no slot content renders as one continuous line — daisyUI only adds the 1rem gap
around the text when the element isn't empty. Don't put whitespace-only content in the slot; it renders
identically to text and reintroduces the gap.

## `direction` names the layout, not the line

It's easy to read `direction="horizontal"` as "draws a horizontal line" — it doesn't. The prop names
the layout being divided, so `horizontal` (dividing side-by-side elements) draws a **vertical** bar. For
the common responsive case, use a class instead of the prop: `class="lg:divider-horizontal"`.

## Colour applies to the lines, not the text

`<Divider color="primary">OR</Divider>` gives you a primary-coloured rule with plain-coloured text. To
colour both, add `class="text-primary"` alongside.
