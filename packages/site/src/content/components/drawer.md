---
description: A collapsible sidebar toggled by a hidden checkbox, with no JavaScript required.
referenceUrl: https://daisyui.com/components/drawer/
referenceLabel: View this component on daisyUI
---

`Drawer` renders the whole skeleton — the hidden toggle, the content wrapper, the side wrapper and the
click-to-close overlay — because daisyUI's open/close rules depend on those elements being siblings in a
fixed order. You fill two named slots: `content` for the page, `side` for the sidebar. `DrawerButton`
renders the `<label>` that opens it.

## Props

### `Drawer`

| Prop | Type | Notes |
|---|---|---|
| `toggleId` | `string` (**required**) | The hidden checkbox's `id`. Every `DrawerButton` for this drawer must repeat it. |
| `end` | `boolean` | Puts the sidebar on the trailing edge instead of the leading one. |
| `open` | `boolean` | Makes the sidebar a **permanent column** rather than an openable overlay — see below. |
| `overlayLabel` | `string` | Accessible name for the empty click-to-close overlay. Defaults to `'close sidebar'`. |
| `contentClass` | `string` | Classes for the `.drawer-content` wrapper. |
| `sideClass` | `string` | Classes for the `.drawer-side` wrapper. |
| `toggleClass` | `string` | Classes for the hidden toggle `<input>` itself — needed for things like `lg:hidden`. |

### `DrawerButton`

| Prop | Type | Notes |
|---|---|---|
| `toggleId` | `string` (**required**) | Must match the `Drawer`'s `toggleId`. |

Both extend their native element's attributes. `DrawerButton` is always a `<label>` — there's no `as`.

## `toggleId` repeats by necessity

Astro has no way to pass a generated id from `Drawer` into slotted content, so `toggleId` is a required
prop you write twice: once on `Drawer`, once on every `DrawerButton` that opens it. Give each drawer on
a page its own id — ids are global, and a duplicate silently wires one drawer's button to another's
checkbox.

## `open` means "permanent", not "opened"

`open` doesn't pop the sidebar open and leave it closable — it turns the sidebar into a sticky column
with the toggle hidden, so there's nothing left to click. The layout you actually want is usually
responsive, which is a class rather than this prop: `class="lg:drawer-open"` gives you a sidebar that's
permanent on desktop and an overlay on mobile.

## `DrawerButton` isn't just styling

The hidden checkbox is invisible but focusable, and `drawer-button` is what transfers its focus ring
onto the visible label when a keyboard user tabs to it. A plain `<label for>` would leave the drawer
with no visible focus indicator at all.
