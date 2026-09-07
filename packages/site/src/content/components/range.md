---
description: A styled slider for picking a numeric value from a range.
referenceUrl: https://daisyui.com/components/range/
referenceLabel: View this component on daisyUI
---

`Range` renders a native `<input type="range">` — a void element with no slot. `min`, `max`, `step`, and
`value` are all plain attributes that forward straight through.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Shadows the native `size` attribute, which browsers ignore on ranges. Sets the thumb size. |
| `vertical` | `boolean` | daisyUI's only direction class — there's no `horizontal` counterpart. |

## Tick marks are your own markup, not a part

The "with steps and measure" look on daisyUI's docs is built from plain sibling `<div>`s below the input,
hand-aligned with `flex justify-between`. There's no `ticks` prop — daisyUI ships no class for them, so
this is markup you write yourself, matched to your `step` value.

## Fine-tuning beyond the color prop

`Range` exposes five CSS custom properties with no prop equivalents, set via arbitrary Tailwind values on
`class`:

| Property | Default | Effect |
|---|---|---|
| `--range-bg` | 10% of currentColor | the unfilled track |
| `--range-thumb` | `--color-base-100` | the thumb's center |
| `--range-progress` | `currentColor` | the filled portion |
| `--range-fill` | `1` | set to `0` to remove the fill entirely |

```astro
<Range class="text-blue-300 [--range-bg:orange] [--range-thumb:blue] [--range-fill:0]" />
```

`--range-fill: 0` is the only way to get an unfilled slider — there's no `range-unfilled` class for it.
