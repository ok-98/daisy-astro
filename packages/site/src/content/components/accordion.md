---
description: An accordion groups several collapsible sections so opening one closes the others.
referenceUrl: https://daisyui.com/components/accordion/
referenceLabel: View this component on daisyUI
---

daisyUI has no `accordion` class — an accordion is just several `Collapse` items that share a radio
`name`, so opening one closes the rest. `Accordion` is a thin grouping wrapper around those items; the
items themselves are the same `Collapse` component used on its own.

## Props

| Prop | Type | Notes |
|---|---|---|
| `join` | `boolean` | Renders the items as one bordered stack instead of separate boxes. When set, the wrapper classes its own children — the items need no matching prop. |

Every native `<div>` attribute forwards through `Accordion` as well.

## Composing items

Each item is a `Collapse` with `trigger="radio"` and a shared `name`. Because Astro components can't
reach into their own slotted children, `name` has to repeat on every item — that's expected, not a
mistake:

```astro
<Accordion join>
  <Collapse trigger="radio" name="faq" open>
    <Fragment slot="title">How do I create an account?</Fragment>
    Click the "Sign Up" button and follow the registration process.
  </Collapse>
  <Collapse trigger="radio" name="faq">
    <Fragment slot="title">I forgot my password. What should I do?</Fragment>
    Click "Forgot Password" on the login page.
  </Collapse>
</Accordion>
```

## No `AccordionItem`

There's only `Accordion` — every per-item prop (`icon`, `force`, `open`, the trigger mode) lives on
`Collapse`, which is documented on its own page. `Collapse` also supports `trigger="details"`,
`"checkbox"` and `"focus"` for non-accordion use, and any of those can be grouped the same way as long
as `name` is shared.
