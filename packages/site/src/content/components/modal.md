---
description: A dialog box that overlays the page, for confirmations, forms, and other focused tasks.
referenceUrl: https://daisyui.com/components/modal/
referenceLabel: View this component on daisyUI
---

`Modal`, `ModalBox`, and `ModalAction` compose together: `Modal` is the overlay root, `ModalBox` is the
content panel inside it, and `ModalAction` is the right-aligned row for its buttons. daisyUI documents
four ways to open a modal; `Modal` covers all of them by rendering the same markup and letting you choose
the root element and the opening mechanism.

## Props

### `Modal`

| Prop | Type | Notes |
|---|---|---|
| `as` | `'dialog' \| 'div' \| ...` | Defaults to `dialog` — daisyUI's recommended method. See below for the others. |
| `open` | `boolean` | Forces visibility from CSS. **Not** the same as a dialog being open — see below. |
| `position` | `'top' \| 'middle' \| 'bottom'` | Vertical placement. Defaults to `middle`. |
| `align` | `'start' \| 'end'` | Horizontal placement, independent of `position`. |

### `ModalBox` / `ModalAction`

Both just extend `HTMLAttributes<'div'>` — no variant props. `ModalBox` is the panel (`modal-box`);
`ModalAction` is the button row (`modal-action`). Any native `<div>` attribute forwards.

## Opening it: a real `<dialog>`, with no library JavaScript

The default `as="dialog"` renders a native `<dialog class="modal">`. This library ships no script, so you
open and close it the normal DOM way — an `id` plus `element.showModal()` / `element.close()`:

```astro
<button class="btn" onclick="my_modal.showModal()">Open</button>
<Modal id="my_modal">
  <ModalBox>
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Press ESC or click the button below to close.</p>
    <ModalAction>
      <form method="dialog"><button class="btn">Close</button></form>
    </ModalAction>
  </ModalBox>
</Modal>
```

The `<form method="dialog">` around the close button is daisyUI's trick, not a mistake — submitting a
form with `method="dialog"` closes the enclosing dialog with **no JavaScript at all**. It's how every
doc-page example closes its modal, including the backdrop click-to-close variant (there, the form is a
sibling of `ModalBox` acting as the backdrop).

For the three other methods — popover, checkbox, and anchor-link — render `as="div"` and drive it with
daisyUI's own attributes (`popover`/`popovertarget`, a hidden `input.modal-toggle`, or a URL fragment);
`Modal` adds `role="dialog"` automatically whenever `as` isn't `dialog`, since a bare `<div>` has no
built-in dialog semantics.

## `open` doesn't mean "open"

The `open` prop forces the modal visible purely from CSS — useful if something else manages open/closed
state for you. It is **not equivalent** to calling `showModal()`: a `<dialog open>` that was never
`showModal()`ed is visible but not modal — no top layer, no focus trap, and the background stays
clickable. For a real `<dialog>`, always open it with `showModal()`; reach for `open` only on a `div`
root or when your own state management already handles the CSS toggle.

## Width goes on the box, not the modal

`ModalBox` has a default width (`91.67%`, capped at `32rem`). To make a modal wider or narrower, pass
`class` to `ModalBox` (e.g. `class="w-11/12 max-w-5xl"`) — not to `Modal`, which has no size axis of its
own.
