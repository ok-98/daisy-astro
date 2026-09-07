---
description: Pagination isn't a component here — daisyUI has no pagination class, only a recipe using Join and Button.
referenceUrl: https://daisyui.com/components/pagination/
referenceLabel: View this component on daisyUI
---

**There is no `Pagination` component in this library, and there never will be one** — daisyUI itself has
no `.pagination` class. Its own "Pagination" doc page says so directly: it's built entirely from the
[`Join`](/components/join) component wrapping [`Button`](/components/button)s, and that's exactly what
you compose here too.

## Relevant props

| Component | Prop | Notes |
|---|---|---|
| `Join` | `direction` | `'horizontal' \| 'vertical'`. Horizontal is the default and what a page-number row wants. |
| `Button` | `class="join-item"` | Required on each page button so it connects to its neighbours. |
| `Button` | `active` | Highlights the current page. Visual only — see below. |

Everything else about a page button — `disabled` for an ellipsis placeholder, `size` for a compact
pager, `variant="outline"` — is plain `Button` API. See the [Join](/components/join) and
[Button](/components/button) pages for their full prop tables.

## Mark the current page for accessibility too

`active` only applies daisyUI's visual highlight. For a real pager, also add
`aria-current="page"` to the current button yourself — it passes straight through as a native
attribute, the same way it would on any other link or button.

## Equal-width prev/next is a grid on the `Join`

For two equal-width "Previous" / "Next" buttons instead of number buttons, put `class="grid
grid-cols-2"` on the `Join` itself rather than sizing the buttons individually — that's daisyUI's own
answer to the layout, and the one non-obvious trick on the page.
