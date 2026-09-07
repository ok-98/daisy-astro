---
description: A trigger that reveals a floating panel — a menu, a card, or anything else — positioned beside it with CSS, no JavaScript.
referenceUrl: https://daisyui.com/components/dropdown/
referenceLabel: View this component on daisyUI
---

`Dropdown` renders a trigger plus a default slot for the panel. Two mechanisms are supported through
`method`: a CSS focus trick (the default) and native `<details>`/`<summary>`. Content for the trigger
goes in the named `trigger` slot; the panel is the default slot.

## Props

| Prop | Type | Notes |
|---|---|---|
| `method` | `'focus' \| 'details'` | `focus` renders `<div tabindex="0" role="button">`; `details` renders native `<details>`/`<summary>`. Defaults to `focus`. |
| `from` | `'top' \| 'bottom' \| 'left' \| 'right'` | Which side the panel opens on. Defaults to `bottom`. |
| `align` | `'start' \| 'center' \| 'end'` | Cross-axis alignment — see below. Defaults to `start`. |
| `hover` | `boolean` | Opens on hover **in addition to** click/focus, not instead of them. |
| `force` | `'open' \| 'close'` | Forces the state. `close` wins over hover, focus, and `force="open"` alike. |
| `triggerClass` | `string` | Classes for the trigger element the component renders (the `<summary>` or the `role="button"` div). |

Every native `<div>` attribute forwards through `...rest` as well.

## The panel needs its own `dropdown-content` class

`Dropdown` does not wrap the default slot in anything — the panel is rendered bare, as a direct sibling
of the trigger. That's deliberate: daisyUI's `dropdown-content` class is a positioning mixin meant to be
applied directly to a `Menu` or a `Card`, and two of daisyUI's show/hide rules are sibling selectors
between the trigger and the panel, so any wrapper around it breaks the dropdown. Give the panel element
`dropdown-content` and a `tabindex` yourself — `-1` for a menu, `0` for a card:

```astro
<Dropdown triggerClass="btn">
  <Fragment slot="trigger">Click to open</Fragment>
  <Menu tabindex="-1" class="dropdown-content bg-base-100 rounded-box w-52 p-2 shadow-sm">
    <li><a>Item 1</a></li>
  </Menu>
</Dropdown>
```

## Placement is two independent props

`from` and `align` combine freely rather than being one union — daisyUI supports all twelve
combinations. `align` means something different depending on `from`: it's the *horizontal* alignment
for `from="top"`/`"bottom"`, and the *vertical* alignment for `from="left"`/`"right"`.

## When the panel gets clipped

If the dropdown sits inside anything with `overflow: hidden` (a `Card`, a table cell), the panel gets
clipped and no `z-index` fixes it. daisyUI's answer is a separate popover-based method that renders in
the browser's top layer — it's two sibling elements wired by matching ids with no wrapper at all, so it
isn't something this component can render; use raw markup for it when you hit that case.
