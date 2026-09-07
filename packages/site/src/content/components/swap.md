---
description: Swaps between two (or three) pieces of content, driven by a hidden checkbox or a class toggle.
referenceUrl: https://daisyui.com/components/swap/
referenceLabel: View this component on daisyUI
---

`Swap`, `SwapOn`, and `SwapOff` compose together: `Swap` is the container, and `SwapOn` / `SwapOff` are
the two states it flips between, stacked in the same spot and switched by opacity. `SwapIndeterminate`
covers the same idea for a third, indeterminate state.

## Props

### `Swap`

| Prop | Type | Notes |
|---|---|---|
| `as` | `'label' \| 'div' \| ...` | Defaults to `label`. Use `div` for the class-driven mode — see below. |
| `active` | `boolean` | Shows the "on" state directly, with no checkbox involved. |
| `effect` | `'rotate' \| 'flip'` | An animated transition between states. |

### `SwapOn` / `SwapOff` / `SwapIndeterminate`

Just `HTMLAttributes<'div'>` — no variant props.

## Two drivers, and don't mix them

`Swap` can be toggled two ways:

- **A checkbox.** Put your own `<input type="checkbox">` as the *first* child, before `SwapOn` /
  `SwapOff`. The default `label` root is what makes clicking anywhere in the swap toggle that checkbox.
- **The `active` prop.** Use `as="div"` and flip `active` from your own code — there's no checkbox
  involved at all.

Don't combine them: `active` overrides the checkbox unconditionally, so a swap with both `active` and a
checkbox stops responding to clicks, silently.

## The checkbox must come first

Every state rule daisyUI ships (`input:checked ~ .swap-on`, etc.) is a general-sibling selector, so the
checkbox has to precede `SwapOn`/`SwapOff`/`SwapIndeterminate` in the default slot, and all of them must
be direct children of `Swap` — nothing should wrap them.

## `SwapOn` starts hidden

The "on" state is hidden by default and only revealed once the swap is toggled. A `Swap` containing only
a `SwapOn` renders empty until then, and one containing only a `SwapOff` never visibly changes — both are
valid but easy to mistake for a bug if you're only rendering one side.

`SwapIndeterminate` has no HTML-attribute equivalent to set it — `indeterminate` is a DOM property only,
so it must be set from your own script (`inputEl.indeterminate = true`), not through markup.
