---
description: Link restores the underline styling Tailwind's preflight strips from anchors.
referenceUrl: https://daisyui.com/components/link/
referenceLabel: View this component on daisyUI
---

`Link` renders an `<a>` by default and is polymorphic via `as`. Content is passed through the default
slot — there's no `text` or `href` prop; `href` arrives through the normal native attribute passthrough.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'a' \| 'button' \| ...` | Defaults to `a`. Use `as="button"` for a link-styled control that performs an action rather than navigating. |
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `hover` | `boolean` | See below — the name is a bit misleading. |

Every native attribute of the rendered tag forwards through as well (`href`, `target`, `rel`, `type`
when `as="button"`, ...).

## `hover` removes the underline, it doesn't add one

`hover` doesn't add extra hover styling — it *suppresses* the base underline and brings it back only on
hover. On a touch device, where there's no hover state at all, a `hover` link never shows an underline.
Combined with no `color`, a `hover` link is visually identical to surrounding text at rest — fine inside
a footer, riskier in body copy.

## Colours darken on hover

Each colour's hover state mixes in black, which means a link on a dark theme gets *darker*, not
lighter, when hovered. That's daisyUI's own CSS across every colour, not something to work around.
