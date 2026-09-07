---
description: Aura draws a rotating gradient light behind a card, button or other element to call attention to it.
referenceUrl: https://daisyui.com/components/aura/
referenceLabel: View this component on daisyUI
---

`Aura` is a wrapper that decorates whatever you put inside it — one child, styled with a rotating
conic-gradient border light. It renders no content of its own and has no meaning empty.

## Props

| Prop | Type | Notes |
|---|---|---|
| `variant` | `'dual' \| 'rainbow' \| 'holo' \| 'gold' \| 'silver' \| 'glow'` | The gradient style. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | Thickness of the light ring only — it doesn't resize the wrapped element. |

Every native `<div>` attribute forwards too.

## The child must be a single, direct element

`.aura` styles its child with `:has()` and `> *` selectors, so the slot content must sit directly
inside `Aura` with nothing wrapping it — one card, one button, one anything:

```astro
<Aura variant="rainbow">
  <button class="btn">Click me</button>
</Aura>
```

## Color comes from `currentColor`, not a prop

There's no `color` prop, because there's no `aura-primary` class to back it. Colour comes from a plain
Tailwind text utility on `Aura` itself, and only three variants respond to it:

- default, `dual`, and `glow` follow `currentColor` — `<Aura class="text-primary">` tints them.
- `rainbow`, `holo`, `gold` and `silver` use fixed palettes and ignore `text-*` entirely.

## It's inline by default

`Aura` renders `display: inline-block`, so wrapping a full-width card shrinks it to content size. Add
`class="block w-full"` (or size the child itself) when the wrapped element needs to stay full width.
