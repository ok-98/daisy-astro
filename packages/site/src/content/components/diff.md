---
description: Diff shows two pieces of content side by side with a draggable divider for comparison.
referenceUrl: https://daisyui.com/components/diff/
referenceLabel: View this component on daisyUI
---

`Diff` renders a fixed three-part structure — two content panes and a drag handle — with no
JavaScript. The divider is a native CSS `resize` handle made invisible and stretched to fill the
height, so there's nothing to configure and no way to read or set the split position from markup.

## Props

| Prop | Type | Notes |
|---|---|---|
| `item1Label` | `string` | `aria-label` for the first (clipped, overlay) pane. |
| `item2Label` | `string` | `aria-label` for the second (full-width, base) pane. |

Content goes in two named slots, `item1` and `item2` — there's no default slot and no `DiffItem`
component, since both panes carry fixed attributes the component always supplies.

## Give it a size

`Diff` has a width but no height of its own — without an aspect ratio or an explicit height, the grid
collapses to a thin strip with nothing visible. Every real use needs one or the other:

```astro
<Diff class="aspect-16/9 rounded-field" item1Label="Sharp version" item2Label="Blurred version">
  <img slot="item1" src="/sharp.webp" alt="daisy" />
  <img slot="item2" src="/blurred.webp" alt="daisy" />
</Diff>
```

## `item1` is the one that gets clipped

`item1` sits on top and is cropped to whatever width the divider is dragged to; `item2` is the
full-width base shown underneath. Dragging the handle left reveals more of `item2`. Which pane reads as
"before" depends entirely on your content — daisyUI doesn't assume an order.

## Content inside is inert

Both panes set `pointer-events: none` on their children, since the whole surface is a drag target —
buttons or links placed inside won't receive clicks. Keyboard users get a two-position toggle instead of
a slider: focusing the `Diff` snaps the split to 95%, and focusing the first pane snaps it to 5%.
