---
description: Dock is a bottom-anchored navigation bar for switching between top-level sections of an app.
referenceUrl: https://daisyui.com/components/dock/
referenceLabel: View this component on daisyUI
---

`Dock` renders the bar; `DockItem` renders each button (or link); `DockLabel` renders the text under an
icon. There's no `items` array prop on `Dock` — each item needs its own icon markup, its own link or
handler, and its own active state, so they come in as children.

## Props

| Component | Prop | Type | Notes |
|---|---|---|---|
| `Dock` | `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Also sets the label's font size. |
| `DockItem` | `as` | `'button' \| 'a' \| ...` | Defaults to `button`. Use `as="a"` with `href` for a navigation dock. |
| `DockItem` | `active` | `boolean` | Highlights the item's pill indicator. Visual only — see below. |
| `DockLabel` | — | — | No props beyond native `<span>` attributes; its size comes from the parent `Dock`. |

## `position: fixed` is built in

There's no static variant — a `Dock` always pins itself to the bottom of the viewport. In a real page
that's the point, but it also means your page needs its own bottom padding so content isn't covered,
and any container previewing one in place (like this page) typically adds `class="relative"` to the
`Dock` to keep it contained. On iOS, the dock's safe-area padding also needs
`<meta name="viewport" content="viewport-fit=cover">` in your document head, which is a page-level
change no component can make for you.

## `active` marks the pill, not the page

`active` is purely visual — it doesn't add any ARIA state. For a real navigation dock, also set
`aria-current="page"` on the current item yourself; it passes straight through as a native attribute.
