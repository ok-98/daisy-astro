---
description: Buttons let the user take an action or make a choice with a single click or tap.
referenceUrl: https://daisyui.com/components/button/
referenceLabel: View this component on daisyUI
---

`Button` renders a `<button>` by default and is polymorphic via `as` (`a`, `input`, and other
button-shaped tags daisyUI documents are also valid). Content is passed through the default slot, so
icon-plus-label buttons are just `<Button><Icon /> Save</Button>` — there's no separate `label` prop.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'button' \| 'a' \| 'input' \| ...` | Changes the rendered tag and the accepted attribute set. Defaults to `button`. |
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |
| `variant` | `'outline' \| 'dash' \| 'soft' \| 'ghost' \| 'link'` | |
| `shape` | `'square' \| 'circle'` | |
| `width` | `'wide' \| 'block'` | |
| `active` | `boolean` | Forces the pressed-looking state. |
| `disabled` | `boolean` | See below — the underlying element decides how this renders. |

Every native attribute of the rendered tag forwards through as well (`type`, `href`, `id`, `data-*`,
`style`, event handlers, ...).

## Disabling a button that isn't a `<button>`

`<button>` and `<input>` support the native `disabled` attribute, which blocks interaction and is
announced by screen readers for free. `<a>` and `<div>` don't — daisyUI's `btn-disabled` class for
those is a *visual style only*, so `Button` adds `tabindex="-1"`, `role="button"`, and
`aria-disabled="true"` automatically whenever `disabled` is set on a non-native-disableable tag. You
never have to remember the difference — just set `disabled`, on any `as`.

## Responsive sizing

There's no responsive `size` prop — daisyUI's responsive button example stacks breakpoint-prefixed size
classes (`btn-xs sm:btn-sm md:btn-md ...`), which a single-value union can't express. Pass those through
`class` instead:

```astro
<Button size="xs" class="sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">Responsive</Button>
```
