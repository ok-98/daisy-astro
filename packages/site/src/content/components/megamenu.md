---
description: Megamenu is a horizontal navigation bar where each item opens a popover panel of rich content.
referenceUrl: https://daisyui.com/components/megamenu/
referenceLabel: View this component on daisyUI
---

`Megamenu` renders the bar; `MegamenuItem` renders one trigger-and-panel pair, wired together by a
shared id you provide. Under the hood this is the Popover API plus CSS anchor positioning — a sliding
indicator tracks whichever item is hovered or open.

## Props

| Component | Prop | Type | Notes |
|---|---|---|---|
| `Megamenu` | `id` | `string` | **Required.** The popover target a mobile trigger button (which you write yourself, outside the component) references. |
| `Megamenu` | `width` | `'wide' \| 'full'` | Makes every panel as wide as the bar, or the whole page. |
| `Megamenu` | `vertical` | `boolean` | Prefer the responsive class `class="max-sm:megamenu-vertical"` instead — see below. |
| `Megamenu` | `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |
| `MegamenuItem` | `itemId` | `string` | **Required.** Unique id linking the trigger to its panel. |
| `MegamenuItem` | `triggerClass` | `string` | Classes for the trigger `<button>`, e.g. `after:content-none` to drop the chevron. |

## Items must be bare siblings, and there's a cap of ten

`MegamenuItem` renders its trigger and panel as two unwrapped sibling elements — never wrap one in an
extra `<div>`. The sliding indicator's position is computed from each trigger's order among its
siblings, so a wrapper would collapse every indicator onto the first item. For the same reason, a
`Megamenu` supports **at most ten items**; an eleventh one silently reuses the first item's position.

## The mobile trigger lives outside the component

`Megamenu`'s root doubles as a popover, so on small screens it needs a button somewhere else on the
page to open it: `<button class="btn sm:hidden" popovertarget="main-menu">Menu</button>`, referencing
the same `id` you pass to `Megamenu`. This library can't write that button for you, since it has to sit
wherever your layout needs it — often inside a `Navbar`.
