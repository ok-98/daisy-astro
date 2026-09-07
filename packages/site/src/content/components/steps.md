---
description: Steps display a numbered progress trail through a sequence of stages.
referenceUrl: https://daisyui.com/components/steps/
referenceLabel: View this component on daisyUI
---

`Steps` renders the list; `Step` renders each node; `StepIcon` swaps a step's number for custom content.
Numbers come from a CSS counter, so there's no index prop to manage — the order of your `Step`s is the
order they're numbered in.

## Props

| Component | Prop | Type | Notes |
|---|---|---|---|
| `Steps` | `direction` | `'horizontal' \| 'vertical'` | `horizontal` is the default. For the common responsive case, prefer the class `class="steps-vertical lg:steps-horizontal"`. |
| `Step` | `color` | `DaisyColor` | Colours this step's circle **and** the connecting bar leading into it — see below. |
| `StepIcon` | — | — | No props beyond native `<span>` attributes. Must be a direct child of its `Step`. |

## Colour needs two consecutive steps to colour the bar

A step's incoming bar is only coloured when the step *before* it shares the same `color`. Two
consecutive `color="primary"` steps give you one coloured circle, one coloured bar, and one more
coloured circle; mixing colours (or leaving a gap) breaks the trail on purpose — that's how a partial
progress indicator reads correctly. There's no `progress` prop that colours everything up to some index.

## Replacing the number

Two ways to swap out a step's number, both shown in the example below: pass `data-content="✓"` as a
plain attribute for a literal symbol (an empty string gives a deliberately blank circle), or nest a
`StepIcon` for arbitrary content. Either way the underlying counter still increments, so numbering
stays consistent for steps around it.
