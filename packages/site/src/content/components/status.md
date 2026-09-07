---
description: A small status indicator dot, useful for showing online/offline or other states.
referenceUrl: https://daisyui.com/components/status/
referenceLabel: View this component on daisyUI
---

`Status` renders a small filled dot with a subtle highlight and drop shadow. It takes no children — the
element *is* the dot.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'span' \| 'div' \| ...` | Defaults to `span`, since a status dot usually sits inside a sentence, a badge, or an indicator. |
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl` — see the size note below. |

Every native attribute of the rendered tag forwards, including `aria-label` and `aria-hidden`.

## It announces nothing by default

An empty dot has no accessible name on its own. Add `aria-label="Online"` when the dot's state *is* the
information, or `aria-hidden="true"` when it's merely decorating text that already says the same thing
(for example, next to a labelled indicator). Neither is set automatically — a generic
`aria-label="status"` would be worse than none, since it tells a screen reader something has a status
without saying which.

## The size steps are uneven

Unlike every other size axis in this library, `Status` sizes aren't even multiples of each other: `xs`
is 2px, `sm` 4px, `md` 8px, `lg` 12px, `xl` 16px. `xs` is a quarter of the default size and is nearly
invisible against most backgrounds — pick it deliberately, not by habit.

## Animation is a Tailwind class, not a prop

`class="animate-bounce"` works directly. For a "ping" pulse, stack **two** dots in a one-cell grid — one
animated, one static — or the pinging dot fades to nothing with no dot left behind:

```astro
<div class="inline-grid *:[grid-area:1/1]">
  <Status color="error" class="animate-ping" />
  <Status color="error" />
</div>
```
