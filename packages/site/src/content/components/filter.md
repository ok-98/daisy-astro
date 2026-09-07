---
description: A group of radio (or checkbox) buttons where choosing one collapses the rest and reveals a reset control.
referenceUrl: https://daisyui.com/components/filter/
referenceLabel: View this component on daisyUI
---

`Filter` is a thin container — the options themselves are just `Button` rendered `as="input"`. Choosing a
radio option collapses every sibling to nothing and reveals a reset control; checkboxes are exempt from
the collapse, so the same container serves single- and multi-select filters with no prop to switch modes.
It's pure CSS: no script, no state prop.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'form' \| 'div'` | Defaults to `form`. Determines which reset mechanism applies — see below. |

There's no `options` array prop — each option is a full `Button as="input">` with its own `name`, `value`,
and `aria-label`, composed directly in the default slot.

## An input has no children, so its label is `aria-label`

```astro
<Filter>
  <Button as="input" type="reset" shape="square" value="×" />
  <Button as="input" type="radio" name="frameworks" aria-label="Svelte" />
</Filter>
```

`aria-label` isn't optional polish here — it's the *only* way an `<input>` gets visible text, since
daisyUI draws it through a pseudo-element. Omit it and the option renders as an empty, zero-width pill
with no error.

## Two reset mechanisms, and they aren't interchangeable

| Root | Reset control |
|---|---|
| `as="form"` (default) | `<Button as="input" type="reset" value="×" />` — a real native form reset |
| `as="div"` | an extra radio in the same group carrying `class="filter-reset"`, which draws its own `×` from CSS |

Put `value="×"` on a `filter-reset` radio and it does nothing (radios render no value); leave it off an
`<input type="reset">` and the browser labels it "Reset" instead of showing an `×`. Use the pair that
matches your `as`.
