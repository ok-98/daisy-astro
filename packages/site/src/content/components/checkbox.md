---
description: A styled checkbox input for toggling a single boolean option on or off.
referenceUrl: https://daisyui.com/components/checkbox/
referenceLabel: View this component on daisyUI
---

`Checkbox` renders a native `<input type="checkbox">` — a void element, so it takes no children and no
`label` prop. The label text is a sibling, typically inside a `Label` wrapping both:
`<Label as="label"><Checkbox /> Remember me</Label>`.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Shadows the native `size` attribute, which browsers ignore on checkboxes anyway. |

Every native `<input>` attribute forwards through as well — `checked`, `disabled`, `name`, `value`,
`required`, `aria-checked`, ...

## No `indeterminate` prop

Indeterminate isn't an HTML attribute — it's a DOM property with no markup equivalent, so there's nothing
for a prop to render. Set it the same way daisyUI's own docs do, from a small script:

```html
<input id="my-checkbox" class="checkbox" />
<script>document.getElementById("my-checkbox").indeterminate = true</script>
```

## Driving the checked look without `checked`

`aria-checked="true"` gets every visual rule `checked` does, which is handy when state is driven from
JavaScript rather than the native attribute. And `disabled` needs no branching on your end — daisyUI
styles `:disabled` directly, so it just works when forwarded.
