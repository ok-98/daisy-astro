---
description: An avatar displays a user's picture, or a placeholder, in a consistently sized box.
referenceUrl: https://daisyui.com/components/avatar/
referenceLabel: View this component on daisyUI
---

`Avatar` renders daisyUI's required two-element structure for you — a root and a mandatory inner
`div` — so you never have to hand-write it. The image (or placeholder content) goes in the default
slot; everything else is a prop.

## Props

| Prop | Type | Notes |
|---|---|---|
| `presence` | `'online' \| 'offline'` | Adds a status dot. It's decoration only — no accessible name — so pair it with `aria-label` when the state matters. |
| `placeholder` | `boolean` | Centers the slot content, for letter avatars like `<span>D</span>`. |
| `innerClass` | `string` | Classes for the **inner** div, where sizing, rounding and masks go. |

`class` and every other native attribute (`id`, `data-*`, event handlers, ...) target the root `div`,
not the inner one — see below.

## Two class props, on purpose

daisyUI puts no width or rounding on the root — only on the inner div. Because this component renders
that inner div for you, `class` alone isn't enough to reach it, so there's a second prop:

```astro
<Avatar innerClass="w-24 rounded-full">
  <img src="/user.webp" alt="A user" />
</Avatar>
```

`class` still merges onto the root the same way it does on every other component in this library.
There's no default rounding — an `Avatar` with no `innerClass` sizing renders as a plain square,
matching daisyUI exactly.

## `AvatarGroup`

`AvatarGroup` wraps several `Avatar`s and forces each member into a bordered circle, regardless of its
own `innerClass`. The overlapping look comes from a plain Tailwind class, not from the component:

```astro
<AvatarGroup class="-space-x-6">
  <Avatar innerClass="w-12"><img src="/a.webp" alt="A" /></Avatar>
  <Avatar innerClass="w-12"><img src="/b.webp" alt="B" /></Avatar>
</AvatarGroup>
```
