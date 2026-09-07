---
description: TextInput is a styled single-line text field for things like emails, passwords, and search boxes.
referenceUrl: https://daisyui.com/components/input/
referenceLabel: View this component on daisyUI
---

`TextInput` renders in one of two shapes: a plain `<input>` by default, or a `<label>` wrapper (via
`as="label"`) that holds an icon, a bare `<input>` you write yourself, and affixes like a `Kbd` or
`Badge`. Both are documented daisyUI patterns — the wrapper form covers roughly half of daisyUI's own
examples, so it isn't an edge case.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'input' \| 'label'` | Which element carries the `.input` class. Defaults to `'input'`. |
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Shadows the native `size` attribute — see below. |
| `ghost` | `boolean` | No background, border, or shadow until focused. |
| `type` | narrowed union | daisyUI's documented twelve: `text`, `password`, `email`, `number`, `date`, `datetime-local`, `week`, `month`, `tel`, `url`, `search`, `time`. |

Every other native `<input>` attribute forwards through `...rest`.

## Two shapes, not one polymorphic tag

`as="input"` renders a plain `<input class="input">` — the field itself carries the class, and it has no
slot, since `<input>` is a void element. Passing children without `as="label"` **throws** at build time
rather than silently dropping them, because there's no other signal that an icon went missing.

`as="label"` renders `<label class="input">` with a required default slot: an icon, a bare `<input>`
(which you write yourself, not another `TextInput`), and optional affixes.

```astro
<TextInput as="label">
  <svg class="h-[1em] opacity-50">...</svg>
  <input type="search" placeholder="Search" />
</TextInput>
```

`type` deliberately excludes `checkbox`, `radio`, `file`, and `range` — those have their own components
in this library (`Checkbox`, `Radio`, `FileInput`, `Range`), and `.input`'s styling actively breaks them.

## `size` collides with a native attribute — accepted anyway

`size` on a plain `<input>` is a native character-width hint. `TextInput`'s `size` prop shadows it with
daisyUI's size scale instead, for consistency with the rest of the form controls. In practice this costs
little: daisyUI's own width (`clamp(3rem, 20rem, 100%)`) already overrides the native hint, and any `w-*`
utility replaces it exactly. If you need the native attribute, use the `as="label"` form and put it on
your own inner `<input>`.

## Validation styling is a caller class, not a prop

Add `class="validator"` to a `TextInput` and place a `ValidatorHint` **after** it as a sibling — see the
Validator component for details.
