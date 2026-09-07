---
description: Menu is a styled list of links, typically used inside a sidebar, navbar or dropdown.
referenceUrl: https://daisyui.com/components/menu/
referenceLabel: View this component on daisyUI
---

`Menu` renders the `<ul>`; `MenuTitle` renders a non-interactive label row or group heading. There's no
`MenuItem` component — daisyUI styles menu rows by shape, not by class, so items are plain
`<li><a>...</a></li>` you write directly as children.

## Props

| Component | Prop | Type | Notes |
|---|---|---|---|
| `Menu` | `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |
| `Menu` | `direction` | `'horizontal' \| 'vertical'` | `vertical` is the default. For the common responsive case, prefer the class `lg:menu-horizontal`. |
| `Menu` | `paged` | `boolean` | Shows one level of a nested menu at a time, turning an open submenu into a back button. |
| `MenuTitle` | `as` | `'li' \| 'h2' \| ...` | Defaults to `li` for a standalone label row; use `as="h2"` for a heading over a nested `<ul>`. |

## Items are bare `<li>`, no wrapper component

Any single element inside an `<li>` — a `<button>`, `<a>`, `<span>` — becomes a styled menu row
automatically, except a nested list, a `<details>`, or a `.btn` (which stays a normal button). Because
of that, state is expressed with plain caller classes rather than props: `menu-active` and `menu-focus`
go on the item's inner element, while `menu-disabled` goes on the `<li>` itself — the doc page and this
distinction are easy to mix up, so it's worth checking which one you're setting.

## Submenus are just nested `<ul>`s

Nest a `<ul>` inside an `<li>` for an indented submenu with no extra class needed, or wrap it in
`<details><summary>` for a collapsible one — daisyUI styles both automatically, and it's the
recommended no-JavaScript alternative to the `menu-dropdown-*` classes.
