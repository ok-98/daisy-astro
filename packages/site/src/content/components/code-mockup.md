---
description: A terminal- or code-block-styled frame for displaying commands or snippets.
referenceUrl: https://daisyui.com/components/mockup-code/
referenceLabel: View this component on daisyUI
---

`CodeMockup` renders one `<div>` around whatever content you give it. Lines are bare `<pre>` elements —
daisyUI styles the element directly, so there's no line sub-component to import.

## Props

`CodeMockup` accepts only native `<div>` attributes.

```astro
<CodeMockup class="w-full">
  <pre data-prefix="$"><code>npm i daisyui</code></pre>
</CodeMockup>
```

`data-prefix` is the whole API for the line gutter, and it passes through natively — no prop needed. For
per-line styling, put a class directly on that line's `<pre>`.

## It brings its own colours, unlike `BrowserMockup`

`CodeMockup` sets a neutral background and matching text colour by default, so a bare instance already
looks like a terminal. What it doesn't set is a width — every daisyUI example adds `class="w-full"`. To
recolour it, use plain Tailwind (`class="bg-primary text-primary-content"`) — there's no colour prop.

## Don't mix prefixed and unprefixed lines

An unprefixed `<pre>` is indented less than a prefixed one, so combining them in the same mockup
misaligns the code by roughly 2rem. Keep a mockup either all-prefixed or all-unprefixed.

The three title-bar dots are unconditional here and can't be turned off — the opposite of
`BrowserMockup`, where they live on an optional toolbar.
