---
description: Select renders a styled native dropdown for choosing one option from a list.
referenceUrl: https://daisyui.com/components/select/
referenceLabel: View this component on daisyUI
---

`Select` renders a native `<select>` with daisyUI's styling — a coloured border and a background-drawn
dropdown arrow. Options are passed as slot content, exactly as you'd write plain HTML.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Shadows the native `size` attribute — see below. |
| `ghost` | `boolean` | No background, border, or shadow until focused. |

Every native attribute (`name`, `required`, `multiple`, `disabled`, `value`, ...) forwards through
`...rest`.

## The placeholder is just the first option

There's no `placeholder` prop. daisyUI's own convention is a disabled, selected first `<option>`:

```astro
<Select>
  <option disabled selected>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
</Select>
```

## `size` collides with a native attribute that actually means something here

Unlike on `TextInput` or `Checkbox`, the native `size` attribute is meaningful on a `<select>` — it turns
the dropdown into a scrolling list box of N rows, a structurally different control. `Select`'s `size`
prop is the daisyUI size scale (`xs`–`xl`), and it shadows that native meaning. This is a deliberate
trade for consistency across all six form controls in this library; daisyUI doesn't style the list-box
form anyway. If you genuinely need the native row-count behavior, drop down to a plain `<select>`.

## The arrow follows `currentColor`, not `color`

The dropdown arrow is drawn from background gradients rather than a pseudo-element, and it's coloured by
`currentColor` — so `class="text-primary"` tints the arrow independently of the `color` prop, which
controls the border instead. A background-image utility (or `bg-none`) will erase the arrow entirely.
