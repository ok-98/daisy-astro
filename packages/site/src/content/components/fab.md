---
description: A floating action button that reveals a stack of related actions when focused.
referenceUrl: https://daisyui.com/components/fab/
referenceLabel: View this component on daisyUI
---

`Fab` renders a fixed-position trigger via the named `trigger` slot, plus a default slot for the action
buttons that appear around it. There's no `open` prop and no JavaScript — it opens purely on
`:focus-within`.

## Props

| Prop | Type | Notes |
|---|---|---|
| `flower` | `boolean` | Arranges actions in a quarter-circle instead of a vertical stack. Caps at 4 action buttons — see below. |
| `triggerClass` | `string` | Classes for the trigger element the component renders, e.g. `"btn btn-lg btn-circle btn-primary"`. |

Every native `<div>` attribute forwards through `...rest` as well.

## It opens on focus, not click

Clicking or tabbing to the trigger opens the dial; anything that moves focus elsewhere — including
clicking an action, or a dialog opening — closes it. That's usually what you want (clicking an action
should close the dial), but it also means the trigger stops receiving clicks while open, so a second
click lands on whatever's positioned over it instead.

## Fixed positioning, and demo containment

`Fab` is `position: fixed` by default, anchored to the bottom-right corner of the page. To show one
inside a bounded box (a demo, a card), add `class="absolute z-1"` to a relatively-positioned wrapper —
exactly what daisyUI's own rendered examples do.

## Action order matters, and `flower` caps at four

Actions are direct children of the default slot, and their order drives both the stagger-in animation
and, in `flower` mode, the arc angle each one lands at. daisyUI only computes angles for up to four
action buttons (six children counting the trigger and an optional main action) — anything past that is
hidden outright with no error. Use `class="fab-close"` or `class="fab-main-action"` on one action (never
both) to have it visually replace the trigger while the dial is open.
