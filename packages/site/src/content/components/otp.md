---
description: Otp shows a one-time-passcode field as a row of boxes that behave as a single input.
referenceUrl: https://daisyui.com/components/otp/
referenceLabel: View this component on daisyUI
---

`Otp` (exported as `Otp`, not `OTP`) renders a `<label>` wrapping one real `<input>` stretched across a
row of empty `<span>` boxes — there is only ever one input underneath, positioned with letter-spacing so
each typed character lands over its own box. The root has to be a `<label>` rather than a `<div>`: the
input is `pointer-events: none`, so clicking a box only focuses the field because the label wraps it.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |
| `joined` | `boolean` | Connects the boxes into one continuous field instead of separate ones. |

Every native attribute of the rendered `<label>` forwards through `...rest`. There is no `length` prop
and no input props (`maxlength`, `pattern`, `name`, ...) on this component — see below.

## The boxes and the input are both yours, and they must agree

```astro
<Otp>
  <span></span><span></span><span></span><span></span>
  <input
    type="text"
    autocomplete="one-time-code"
    inputmode="numeric"
    maxlength="4"
    pattern="[0-9]{4}"
    required
  />
</Otp>
```

There's deliberately no `length` prop that would generate the spans for you: the real `<input>` sits
alongside them as a direct child and carries its own `maxlength`, `pattern`, `name`, and so on, so
generating the boxes from a number would still leave you keeping that number in sync with the input's
`maxlength` somewhere else. **The number of `<span>`s must match the input's `maxlength`** — nothing
enforces this automatically. Too many spans leaves trailing boxes that can never be filled; too few
leaves typed characters landing outside the last box. daisyUI only has box-positioning rules for up to
eight spans, so that's the practical maximum.

## Two behaviors that look like bugs

- **The caret disappears once the value is valid.** While you're still typing, the caret is visible and
  tracks the active box; once the full code is entered it hides, since a caret parked after the last
  character would otherwise sit outside the boxes.
- **Don't override the font family.** The box alignment depends on daisyUI's monospace metrics — a
  different font will throw off the letter-spacing that lines characters up with their boxes.
