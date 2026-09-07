---
description: A styled native file picker for uploading one or more files.
referenceUrl: https://daisyui.com/components/file-input/
referenceLabel: View this component on daisyUI
---

`FileInput` renders a native `<input type="file">` — a void element, so there's no slot and no way to
customize its "Choose file" button from markup.

## Props

| Prop | Type | Notes |
|---|---|---|
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. Shadows the native `size` attribute, which browsers ignore on file inputs. |
| `ghost` | `boolean` | No border until focused. |

Every native `<input>` attribute forwards through as well — `accept`, `multiple`, `disabled`, `name`,
`required`, ...

## The "Choose file" button is not an element

That button is the browser's built-in `::file-selector-button` pseudo-element, which daisyUI styles to
match its own `Button` component. There's nothing to slot into it and no way to change its text — that's
entirely browser- and locale-controlled. If you need a custom trigger, build the usual pattern of a
`<label>` wrapping a visually-hidden input yourself; `FileInput` stays the plain native control.

## `multiple` is normalized so `false` behaves correctly

`multiple` isn't in the small set of HTML attributes whose mere presence toggles a boolean off when set to
`false` — passing `multiple={false}` naively would still render `multiple="false"` in the DOM, and HTML
treats *any* value of `multiple` as enabling it. `FileInput` normalizes this for you, so `multiple={false}`
correctly emits no `multiple` attribute at all.

## Sizing and composition

`FileInput` is about 20rem wide by default, not full width — add `class="w-full"` if you want it to fill
its container. Inside a `Join`, it squares off its edges automatically with no extra prop needed.
