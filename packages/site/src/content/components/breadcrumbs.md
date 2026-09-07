---
description: Breadcrumbs show a user's current location as a trail of links back through a page hierarchy.
referenceUrl: https://daisyui.com/components/breadcrumbs/
referenceLabel: View this component on daisyUI
---

`Breadcrumbs` renders the required `<nav>` (or `<div>`) plus the inner list element for you; you
supply the `<li>` items directly as children. There's no `items` array prop, so each crumb can be a
link, a plain `<span>`, an icon-prefixed label — whatever the trail needs.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `HTMLTag` | Root element. Defaults to `nav`, a deliberate deviation from daisyUI's own `div` — see below. |
| `listAs` | `'ul' \| 'ol' \| 'menu'` | Which list element wraps the items. Defaults to `ul`; all three render identically. |
| `aria-label` | `string` | Defaults to `'Breadcrumb'`. Only meaningful when `as="nav"`. |

Every native attribute of the root forwards through as well.

## Why the root is `nav`, not `div`

daisyUI's own markup is a bare `<div class="breadcrumbs">` with no landmark and no indication of the
current page. `Breadcrumbs` defaults to `as="nav"` with `aria-label="Breadcrumb"` instead, so a
breadcrumb trail reads as navigation to assistive tech out of the box. Pass `as="div"` to match
daisyUI's literal markup if you need it.

## Marking the current page yourself

`aria-current="page"` isn't emitted automatically — it belongs on whichever item is the current page,
which is content you supply. daisyUI also gives every item `cursor: pointer` and a hover underline,
including a non-link last crumb, so a plain `<span>` for "you are here" still looks clickable unless
you add `class="cursor-default no-underline hover:no-underline"` yourself.

There's no `separator` prop either — the chevron between items has no daisyUI variable or modifier
class, so swapping it for `/` or similar is a plain CSS override on your end, not an API this
component could expose.
