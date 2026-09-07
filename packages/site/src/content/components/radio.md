---
description: A styled radio input for choosing one option from a mutually exclusive group.
referenceUrl: https://daisyui.com/components/radio/
referenceLabel: View this component on daisyUI
---

`Radio` renders a native `<input type="radio">` — a void element with no slot. As with `Checkbox`, the
label text is a sibling, usually inside a `Label` wrapping both.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Shadows the native `size` attribute, which browsers ignore on radios. |

Every native `<input>` attribute forwards through as well — `name`, `checked`, `value`, `required`,
`disabled`, ...

## Give every group a unique `name`

This is the one thing that makes a set of radios actually behave as a group — `name` is what HTML uses to
decide which radios are mutually exclusive. Two radios with different `name`s never affect each other, and
two *different* groups sharing a `name` become one group, where choosing in either clears the other. A
single radio outside a group is legal too; there's no required-prop enforcement, but it's the first thing
worth checking when a group doesn't behave as expected.
