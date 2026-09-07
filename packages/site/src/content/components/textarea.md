---
description: Textarea is a styled multi-line text field for longer free-form input like bios or comments.
referenceUrl: https://daisyui.com/components/textarea/
referenceLabel: View this component on daisyUI
---

`Textarea` renders a native `<textarea>` styled with daisyUI's colour, size, and ghost variants. Its
initial value comes from the default slot, not a `value` prop.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Changes font size only — see below. |
| `ghost` | `boolean` | No background, border, or shadow until focused. |

Every native `<textarea>` attribute (`placeholder`, `rows`, `disabled`, `required`, `maxlength`, ...)
forwards through `...rest`.

## The initial value is the slot, never a `value` prop

Astro's typings declare a `value` attribute for textareas, but HTML has no such attribute — passing one
renders as an inert attribute and leaves the field empty. Set the initial text between the tags instead:

```astro
<Textarea placeholder="Bio">Already filled in</Textarea>
```

Leave the slot empty and use `placeholder` for the common case; this component is careful not to add any
stray whitespace around the slot, since `<textarea>` treats surrounding whitespace as real content that
would silently suppress the placeholder.

## Size changes the font, not the box

Unlike most other sized components here, `size` on `Textarea` only scales the font size — the height and
padding are fixed. Use a `class="h-24"` (or similar) if you want a taller box; there's no separate `rows`
convenience prop since `rows` already forwards natively.

## Validation styling is a caller class, not a prop

Add `class="validator"` to a `Textarea` and place a `ValidatorHint` **after** it as a sibling — see the
Validator component for details.
