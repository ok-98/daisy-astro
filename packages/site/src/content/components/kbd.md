---
description: Displays a keyboard key or shortcut.
referenceUrl: https://daisyui.com/components/kbd/
referenceLabel: View this component on daisyUI
---

`Kbd` renders a native `<kbd>` element — the tag a screen reader announces as user input. Content comes
through the default slot: a single character, a word, or a symbol.

## Props

| Prop | Type | Notes |
|---|---|---|
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. `md` is the default. |

Every native `<kbd>` attribute forwards as well (`id`, `class`, `data-*`, `style`, ...). There is no
`as` prop — daisyUI's every example is a `<kbd>`, and that's the correct element for the content.

## A shortcut is several `Kbd`s, not one

daisyUI models a key combination as separate `<kbd>` elements with plain text between them, matching the
HTML spec's guidance:

```astro
<Kbd>ctrl</Kbd> + <Kbd>shift</Kbd> + <Kbd>del</Kbd>
```

There's no `combo` or `keys` prop — the `+` is just text you write between the components.

## Single keys are square automatically

A key's `min-width` equals its height, so a one-character key renders as a square and longer text grows
the width while the height stays fixed. Nothing to configure — it just works out for both `Kbd>K</Kbd>`
and `<Kbd>Ctrl</Kbd>`.

## The keycap edge is a slightly thicker bottom border

That asymmetry is the whole "pressed key" illusion, and daisyUI explicitly zeroes `box-shadow` so a
theme's shadow doesn't compete with it. Adding your own `class="shadow-md"` flattens the effect rather
than deepening it.
