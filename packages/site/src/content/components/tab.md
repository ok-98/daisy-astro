---
description: Tabs let users switch between panels of content without leaving the current view.
referenceUrl: https://daisyui.com/components/tab/
referenceLabel: View this component on daisyUI
---

The container component is `Tabs` even though daisyUI's own doc page and class name are singular
("tab") — daisyUI's stylesheet calls the container `tabs` and the item `tab`, so this library follows
that split: `Tabs` is the container, `Tab` is one item, and `TabContent` is a panel.

## Props

| Component | Prop | Type | Notes |
|---|---|---|---|
| `Tabs` | `variant` | `'box' \| 'border' \| 'lift'` | |
| `Tabs` | `placement` | `'top' \| 'bottom'` | |
| `Tabs` | `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |
| `Tab` | `as` | `'button' \| 'a' \| 'input' \| 'label'` | Defaults to `button` — see below for the other shapes. |
| `Tab` | `active` | `boolean` | Visual only. |
| `Tab` | `disabled` | `boolean` | Visual only — add the native `disabled` too for a real `<button>`. |

## A tab can be four different elements

`Tab` supports whichever shape fits how you're managing selection: a `<button>` or `<a>` you toggle
`active` on yourself; an `<input type="radio">`, whose visible label comes from `aria-label` rather
than slot content (an input with no `aria-label` renders a blank tab); or a `<label>` wrapping a hidden
radio, which takes its label from the slot as usual.

## Panels only work with the radio shape

`TabContent` reveals itself through a `:checked + .tab-content` CSS rule, so it only works when its
preceding `Tab` is one of the radio shapes, and — critically — **the panel must be the tab's immediate
next sibling**: interleave tab, panel, tab, panel, not all tabs followed by all panels. Button and link
tabs have no checked state, so a tab set built from those needs your own show/hide logic instead.
Radio-shaped tab groups also need a unique `name` per group, or two `Tabs` on the same page fight over
selection.
