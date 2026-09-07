---
description: Pins a small badge or status dot to the corner of another element.
referenceUrl: https://daisyui.com/components/indicator/
referenceLabel: View this component on daisyUI
---

`Indicator` wraps an element so one or more `IndicatorItem`s can be pinned to its corners. `Indicator`
itself has no props — placement lives entirely on `IndicatorItem`, matching where daisyUI writes the
classes.

## Props

`Indicator` accepts only native `<div>` attributes.

### `IndicatorItem`

| Prop | Type | Notes |
|---|---|---|
| `align` | `'start' \| 'center' \| 'end'` | Horizontal placement. Defaults to daisyUI's `end`. |
| `position` | `'top' \| 'middle' \| 'bottom'` | Vertical placement. Defaults to daisyUI's `top`. |

`align` and `position` are independent props rather than one combined union, because they compose
freely — nine placements from six classes.

## `IndicatorItem` is a positioning mixin, not a visible thing on its own

Combine it with whatever you actually want to show, by adding classes: `class="badge badge-primary"`,
`class="status status-success"`, or wrap a `Button` in it. An empty item (no slot content) is a
documented use — it renders as a plain dot.

## It also works as a class on another component

Two of daisyUI's own examples put `indicator` directly on the root of the element being decorated
instead of wrapping it — `<Avatar class="indicator">`, `<Tab class="indicator">` — since the class only
adds `position: relative` and `inline-flex`. Use whichever composition reads better for your markup.
