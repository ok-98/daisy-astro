---
description: A vertical or horizontal sequence of events, connected by lines.
referenceUrl: https://daisyui.com/components/timeline/
referenceLabel: View this component on daisyUI
---

`Timeline` renders a `<ul>` of `TimelineItem`s (`<li>`). Each item holds up to three parts —
`TimelineStart`, `TimelineMiddle`, `TimelineEnd` — placed in whatever combination the event needs.

## Props

| Component | Prop | Type | Notes |
|---|---|---|---|
| `Timeline` | `direction` | `'horizontal' \| 'vertical'` | `horizontal` is the default. |
| `Timeline` | `compact` | `boolean` | Folds both sides of every item onto one side. |
| `Timeline` | `snapIcon` | `boolean` | Snaps `TimelineMiddle` to the start edge instead of centering it. |
| `TimelineItem` | `lineBefore` / `lineAfter` | `boolean` | Both default to `true` — whether to draw the connector line on that side. |
| `TimelineItem` | `lineBeforeClass` / `lineAfterClass` | `string` | Classes for the connector line itself — the only way to style it (see below). |
| `TimelineStart`, `TimelineEnd` | `box` | `boolean` | Applies the bordered/padded box style. Not available on `TimelineMiddle`. |

## Connector lines are generated — turn them off at the ends

`TimelineItem` renders the connecting lines automatically, before and after your content. Set
`lineBefore={false}` on the first item and `lineAfter={false}` on the last, or the line overhangs the
ends of the strip with nothing to connect to.

## Coloring a line needs a prop, not a class

The connector lines are elements the component generates, so a `class` on `TimelineItem` can't reach
them. Use `lineBeforeClass` / `lineAfterClass` instead — for example `lineAfterClass="bg-primary"` to
color just the outgoing line of one item.

## `direction`, `compact`, and `snapIcon` interact

`compact` and `snapIcon` behave differently depending on `direction` — they're not independent switches.
The common responsive pattern (stacked on mobile, side-by-side on desktop) is a caller class rather than
a second prop: `class="lg:timeline-horizontal"` alongside `direction="vertical"`.
