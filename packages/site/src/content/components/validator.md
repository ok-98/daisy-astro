---
description: Validator shows red/green form-control styling and a hint message once a field has been interacted with.
referenceUrl: https://daisyui.com/components/validator/
referenceLabel: View this component on daisyUI
---

**There is no `Validator` component.** daisyUI's `.validator` class doesn't have any styling of its own
— it just sets a CSS variable (`--input-color`) that the other form controls (`TextInput`, `Select`,
`Textarea`, `Checkbox`, `Toggle`, `Radio`, `FileInput`, `Range`) already read for their border and focus
colour. So `validator` is a plain `class="validator"` you add to one of those components — never its own
element. The one piece this library does export is `ValidatorHint`, the message shown below an invalid
field.

## Props (`ValidatorHint`)

| Prop | Type | Notes |
|---|---|---|
| `as` | any HTML tag | Polymorphic — defaults to `'p'`. daisyUI's own examples also use `div` and `span`. |
| `collapse` | `boolean` | Adds Tailwind's `hidden`, so the hint reserves no space while valid. |

Every native attribute of the rendered tag forwards through `...rest`.

## Compose it, don't look for a `Validator` component

Put `class="validator"` on a real form control, and place `ValidatorHint` immediately **after** it, as a
sibling in the same parent:

```astro
<TextInput type="email" required class="validator" placeholder="mail@site.com" />
<ValidatorHint>Enter valid email address</ValidatorHint>
```

daisyUI reveals the hint using a *general* sibling combinator (`~`), which has a real consequence: any
earlier invalid `.validator` control in the same parent reveals **every** later `ValidatorHint` in that
parent, not just the one that belongs to it. Wrap each field (and its hint) in its own `Fieldset` or
`Label` to scope them correctly — this is exactly what daisyUI's own multi-field form example does.

## The error state only appears after interaction

daisyUI matches on `:user-valid` / `:user-invalid`, not the plain `:valid` / `:invalid` pseudo-classes —
so a fresh page load never shows red on a `required` field the user hasn't touched yet. To see the
invalid state you have to type something invalid and blur the field, or submit the form. The one
exception is setting `aria-invalid="true"` directly on the control, which daisyUI treats as an equally
valid trigger for the error styling.

## A hidden hint still takes up space, unless you opt out

By default `ValidatorHint` is `visibility: hidden` while valid — not `display: none` — so the layout
doesn't jump when the message appears. Pass `collapse` if you'd rather the hint take up no space until
it's shown.
