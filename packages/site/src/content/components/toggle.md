---
description: Toggle is a switch-styled checkbox for flipping a setting on or off.
referenceUrl: https://daisyui.com/components/toggle/
referenceLabel: View this component on daisyUI
---

`Toggle` renders a native checkbox styled as a pill switch, with no JavaScript involved — everything is
CSS. Like `TextInput`, it comes in two shapes.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'input' \| 'label'` | Which element carries the `.toggle` class. Defaults to `'input'` — the common case here. |
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. Only visible while checked — see below. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |

`type="checkbox"` is always rendered automatically; it isn't a prop. Every other native attribute
(`checked`, `disabled`, `name`, `value`, ...) forwards through `...rest`.

## Colour only shows up once checked

Every colour class is gated on `:checked` in daisyUI's CSS, so an unchecked `color="primary"` looks
identical to an unchecked `color="error"` — both fall back to the same neutral grey. If you want a
"Colors" demo to actually show colour, mark the inputs `checked`.

## The two-icon wrapper form is positional

`as="label"` wraps a bare checkbox plus **exactly two icons**:

```astro
<Toggle as="label" class="text-base-content">
  <input type="checkbox" />
  <svg aria-label="enabled">...</svg>
  <svg aria-label="disabled">...</svg>
</Toggle>
```

The icons are addressed by position, not by label: the checkbox is child 1, so the first icon (child 2)
is shown while the toggle is **off**, and the second icon (child 3) is shown once it's **on**. A third
icon, or wrapping the icons in another element, breaks this silently — so match daisyUI's markup exactly
and put whichever icon means "off" first.

## There's no `indeterminate` prop

`indeterminate` is a DOM property, not an HTML attribute, so there's nothing here for a prop to render.
Set it the same way daisyUI's own docs do — from your own script, after render:

```js
document.getElementById('my-toggle').indeterminate = true;
```
