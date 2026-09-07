---
description: Collapse hides content behind a title that expands it on focus, click, or as a native disclosure.
referenceUrl: https://daisyui.com/components/collapse/
referenceLabel: View this component on daisyUI
---

`Collapse` covers all four of daisyUI's trigger mechanisms — focus, checkbox, radio, and native
`<details>` — through one `trigger` prop, since they all render the same seven CSS classes. It's also
the item used to build an [Accordion](/components/accordion): a group of `Collapse`s with `trigger="radio"`
and a shared `name`.

## Props

| Prop | Type | Notes |
|---|---|---|
| `trigger` | `'focus' \| 'checkbox' \| 'radio' \| 'details'` | Which interaction opens it. Defaults to `focus`. |
| `name` | `string` | The radio group (for `trigger="radio"`), or the `<details name>` for an exclusive group. |
| `open` | `boolean` | `checked` on the input, or `open` on the `<details>`. No effect in focus mode. |
| `icon` | `'arrow' \| 'plus'` | |
| `force` | `'open' \| 'close'` | Forces the state regardless of the trigger. Doesn't work with `trigger="details"` — use `open` instead. |
| `titleClass` | `string` | Classes for the title wrapper. |
| `contentClass` | `string` | Classes for the content wrapper. |

Content goes in two named slots: `title` and the default slot for the body.

## Picking a trigger

- **`focus`** (the default) opens while focused and closes on blur — good for plain text, wrong for
  anything clickable inside, since focus leaves the panel and it closes underneath the click.
- **`checkbox`** toggles on click and stays open until clicked again.
- **`radio`** makes a group of collapses mutually exclusive — this is what powers `Accordion`.
- **`details`** renders a native `<details>`/`<summary>` pair, which the browser's find-in-page can
  search even while closed.

```astro
<Collapse trigger="checkbox" icon="arrow" class="bg-base-100 border border-base-300">
  <Fragment slot="title">Click to open</Fragment>
  Content revealed on click.
</Collapse>
```
