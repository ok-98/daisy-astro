---
description: Navbar is a horizontal bar for page-level navigation, typically holding a logo, links and actions.
referenceUrl: https://daisyui.com/components/navbar/
referenceLabel: View this component on daisyUI
---

`Navbar` renders the bar itself; `NavbarStart`, `NavbarCenter` and `NavbarEnd` are optional region
components you compose inside it. None of the four take any variant props — daisyUI defines exactly one
class per component here, so styling comes entirely from `class` and ordinary Tailwind utilities.

## Props

| Component | Notes |
|---|---|
| `Navbar` | A 4rem flex row. Every native `<div>` attribute forwards. |
| `NavbarStart` | The leading region — exactly 50% wide when paired with `NavbarEnd`. |
| `NavbarCenter` | The middle region. Does **not** shrink — see below. |
| `NavbarEnd` | The trailing region — exactly 50% wide when paired with `NavbarStart`. |

## It has no background of its own

A bare `Navbar` is an invisible 4rem-tall row — daisyUI sets no `background-color`. Every real example
adds one, typically `class="bg-base-100 shadow-sm"`.

## Two layout idioms, and they answer different questions

`NavbarStart` / `NavbarCenter` / `NavbarEnd` give you two exact 50% halves with a centre pinned between
them. If you want a growing region plus a fixed one instead — a split that isn't 50/50 — daisyUI's own
examples reach for plain `<div class="flex-1">` and `<div class="flex-none">` children instead of the
region components. Both are valid; pick based on which split you actually want.

Because `NavbarCenter` doesn't shrink, long content in `NavbarStart` or `NavbarEnd` pushes the centre
off to one side rather than squeezing it — which is why real centre-logo navbars usually pair it with
icon-only, not text-heavy, side regions.
