---
description: Frames content inside an OS-window chrome, with three title-bar dots.
referenceUrl: https://daisyui.com/components/mockup-window/
referenceLabel: View this component on daisyUI
---

`WindowMockup` renders one `<div>` around whatever content you give it — no toolbar, no address bar,
just the title-bar dots and a frame you supply yourself.

## Props

`WindowMockup` accepts only native `<div>` attributes.

## The frame is yours to add

Like `BrowserMockup`, this component sets only a border radius and clipped overflow — no border,
background or width. Both daisyUI examples add `class="border border-base-300 w-full"`; without it,
you get three dots floating over unframed content. Its sibling `CodeMockup` is the opposite — that one
brings its own colours.

## The dots are unconditional

The three title-bar dots are painted directly on this element and can't be turned off — there's no
toolbar to omit and no modifier prop. There's also no room for a window title beside them; a first child
you add pushes the content down rather than sitting inline with the dots.

## Content clips vertically with no scrollbar

Content taller than a height you set is cut off silently rather than scrolled. Both daisyUI examples
give their content a fixed height (`h-80`) for this reason.
