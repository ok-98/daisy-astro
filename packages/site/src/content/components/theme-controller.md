---
description: A checkbox or radio input that switches the page's daisyUI theme while it's checked, with no JavaScript.
referenceUrl: https://daisyui.com/components/theme-controller/
referenceLabel: View this component on daisyUI
---

`ThemeController` renders a single `<input>`. It has no appearance of its own — daisyUI has no CSS rule
that styles `.theme-controller` directly; the class only acts as a hook inside each theme's own
`:root:has(input.theme-controller[value="..."]:checked)` selector. Give it a look by pairing it with
another daisyUI class through `class`, such as `toggle`, `checkbox`, or `btn`.

## Props

| Prop | Type | Notes |
|---|---|---|
| `theme` | `string` | **Required.** The theme to activate while checked, rendered as the `value` attribute. |
| `type` | `'checkbox' \| 'radio'` | Defaults to `checkbox`. These are the only two input types that can be `:checked`, which is what the theme selector matches on. |

Every native `<input>` attribute (`name`, `checked`, `aria-label`, `autocomplete`, ...) forwards through
`...rest`. `ThemeController` takes no children — `<input>` is a void element, so passing content throws
rather than silently disappearing.

## The theme must actually be built into the site

This is the gotcha that matters most: daisyUI only generates CSS for the themes listed in its
`@plugin "daisyui"` config. A `ThemeController` naming a theme that isn't enabled compiles to an input
that ticks normally but changes nothing — no error, no warning, just a silent no-op. This site only
builds the default `light` and `dark` themes, so the example below uses `theme="dark"`; naming any other
theme here would visibly do nothing.

## Two spellings, identical output

Because the appearance is just another component's class, these two are byte-for-byte the same element:

```astro
<ThemeController theme="dark" class="toggle" />
<Toggle class="theme-controller" value="dark" />
```

Reach for `ThemeController` when theming is the point of the control; reach for the other component's
`theme-controller` class when an existing toggle or checkbox is gaining theme-switching behavior.
