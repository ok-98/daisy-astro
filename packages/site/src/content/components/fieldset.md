---
description: Groups related form controls under a heading, with proper native semantics for assistive tech.
referenceUrl: https://daisyui.com/components/fieldset/
referenceLabel: View this component on daisyUI
---

`Fieldset` renders a real `<fieldset>` and `FieldsetLegend` a real `<legend>` — never divs. That buys you
two things for free through plain HTML attributes: `disabled` on the `Fieldset` disables every control
inside it, and `form="…"` associates the whole group with a form elsewhere in the document.

## Props

| Prop | Type | Notes |
|---|---|---|
| — | — | Neither component has variant props. Every native attribute of `fieldset` / `legend` forwards through `...rest`. |

There's no `legend` prop on `Fieldset` — a `<legend>` must be the first child of its `<fieldset>` in HTML,
so it comes in through the default slot like everything else, as a `FieldsetLegend` you put first.

## Keep children flat

`Fieldset` is a single-column CSS grid, and **its direct children are the rows**. Wrapping a label/input
pair in your own `<div>` for convenience turns that pair into one grid row and collapses the spacing
between them:

```astro
<!-- correct: even spacing between every element -->
<Fieldset>
  <FieldsetLegend>Login</FieldsetLegend>
  <Label>Email</Label>
  <input class="input" />
</Fieldset>

<!-- wrong: the wrapped pair loses the gap around it -->
<Fieldset>
  <FieldsetLegend>Login</FieldsetLegend>
  <div><Label>Email</Label><input class="input" /></div>
</Fieldset>
```

## No box by default

daisyUI gives `Fieldset` no background, border, or padding of its own — a bare `<Fieldset>` is an
unstyled column, which is correct rather than broken. Add `class="bg-base-200 border border-base-300 p-4
rounded-box"` yourself when you want the boxed look from the daisyUI docs.
