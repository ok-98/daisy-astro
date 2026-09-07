---
description: Cycles through a list of words or phrases in place, like an animated headline.
referenceUrl: https://daisyui.com/components/text-rotate/
referenceLabel: View this component on daisyUI
---

`TextRotate` renders a `<span>` that loops through its children, showing one at a time. It generates two
wrapper levels internally (a clipping viewport, then an animated track) — you only write the items that
go inside.

## Props

| Prop | Type | Notes |
|---|---|---|
| `align` | `'start' \| 'center' \| 'end'` | Horizontal alignment of the items. Defaults to `start`. |

Native `<span>` attributes forward as well. `align` is a prop (not a caller class) because it targets
the generated inner track, which a caller's `class` can't reach.

## Six items is a hard ceiling

daisyUI's CSS only defines counting rules for up to six items — a seventh item is silently clipped and
the animation loop skips, with no error at build time or runtime. Keep rotating items to six or fewer.

## Speed, size, and line height are Tailwind classes, not props

There's no `duration` prop: pass a duration utility directly, alongside whatever font size or line
height you want:

```astro
<TextRotate class="text-4xl duration-2000" align="center">
  <span>FAST</span>
  <span>FREE</span>
</TextRotate>
```

## Reduced motion only degrades cleanly at two items

Above two items, `prefers-reduced-motion: reduce` still shows a static first item rather than stepping
through them — this is daisyUI's own behavior, not something this library patches.
