---
description: Frames content inside a browser-window chrome, with an optional address-bar toolbar.
referenceUrl: https://daisyui.com/components/mockup-browser/
referenceLabel: View this component on daisyUI
---

`BrowserMockup` renders one `<div>` with an optional named `toolbar` slot. It has no variant props at
all — the frame, background and width are entirely up to you.

## Props

`BrowserMockup` accepts only native `<div>` attributes. There's no `url` prop for the address bar; it
comes from the `toolbar` slot instead, as a `<div class="input">`.

## The frame is yours to add

daisyUI supplies only a border radius and clipped overflow — no border, background or width. Both
daisyUI examples add `class="border border-base-300 w-full"`, and a bare mockup with no class looks like
an unframed, content-width box.

## The three dots belong to the toolbar

The traffic-light dots are painted by the toolbar wrapper, not the mockup itself — omit the `toolbar`
slot and you get no dots at all, with no separate prop to control them. This is the opposite of
`CodeMockup` and `WindowMockup`, where the dots are unconditional.

## Content is clipped vertically, not scrolled

The mockup clips overflow on the vertical axis with no scrollbar, so content taller than a height you
set is silently cut off. Every daisyUI example gives its content a fixed height for this reason.
