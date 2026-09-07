---
description: A horizontal bar showing determinate or indeterminate progress toward completion.
referenceUrl: https://daisyui.com/components/progress/
referenceLabel: View this component on daisyUI
---

`Progress` renders a styled native `<progress>` element. `value` and `max` aren't declared as props —
they're the real native attributes, and pass straight through.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |

Every native `<progress>` attribute forwards as well, including `value`, `max`, `id`, `aria-label`,
`data-*`.

There's no `size` prop — the bar is a fixed `0.5rem` tall and full width by default; adjust it with
plain Tailwind (`class="w-56 h-4"`).

## Omitting `value` renders an indeterminate bar — on purpose

`<Progress class="w-56" />` with no `value` at all renders daisyUI's indeterminate animated stripe.
Don't pass `value={0}` expecting the same effect — a `value` of `0` renders a determinate, empty bar,
which looks similar but means something different to assistive technology. If you want the
indeterminate state, leave `value` out entirely (it must resolve to `undefined`, not `0` or `""`).

## Color controls both the fill and the track

Each color class sets `currentColor`, which drives the filled bar *and* the faint 20%-opacity track
behind it — there's no way to color them independently through daisyUI. `class="text-primary"` works
identically to `color="primary"`.
