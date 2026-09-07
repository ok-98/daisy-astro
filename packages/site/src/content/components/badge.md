---
description: A badge is a small pill used to label, count, or flag a piece of content.
referenceUrl: https://daisyui.com/components/badge/
referenceLabel: View this component on daisyUI
---

`Badge` renders a `<span>` by default and is polymorphic via `as`. Content is passed through the
default slot — icon-plus-label badges are just `<Badge><svg .../> Info</Badge>`.

## Props

| Prop | Type | Notes |
|---|---|---|
| `as` | `'span' \| 'div' \| ...` | Changes the rendered tag. Defaults to `span` — see below. |
| `color` | `DaisyColor` | `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`. |
| `size` | `DaisySize` | `xs`, `sm`, `md`, `lg`, `xl`. |
| `variant` | `'outline' \| 'dash' \| 'soft' \| 'ghost'` | |

Every native attribute of the rendered tag forwards through as well.

## Why the default is `span`, not `div`

The doc page uses a badge inside `<p>` and heading text. A `<div>` isn't valid inside `<p>` — the
browser closes the paragraph early and the badge drops out of the text flow. `span` is phrasing
content, so it nests correctly everywhere, including inside a `<button>`. Pass `as="div"` when you
don't need inline flow.

## `ghost` ignores `color`

`outline`, `dash` and `soft` all combine with `color` normally. `variant="ghost"` sets its own base
colours directly and never reads the colour variable, so `<Badge variant="ghost" color="primary">`
renders identically to a plain ghost badge — the colour is silently dropped. This isn't a bug to work
around; just don't expect `ghost` and `color` to combine.

## An empty badge is valid

`<Badge color="primary" size="lg" />` with no content is a documented use — a small coloured dot used
as a status marker. There's no fallback text, so this renders correctly rather than as an empty-looking
mistake. A bare dot conveys nothing to a screen reader, so add your own `aria-label` when it carries
meaning.
