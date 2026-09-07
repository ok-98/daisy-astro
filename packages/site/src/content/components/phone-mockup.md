---
description: An iPhone-shaped device frame for previewing an app screen.
referenceUrl: https://daisyui.com/components/mockup-phone/
referenceLabel: View this component on daisyUI
---

`PhoneMockup` is a one-cell grid holding an optional `PhoneMockupCamera` (the notch pill) and a
`PhoneMockupDisplay` (the screen) — both occupy the same cell, so their order in the slot doesn't
matter.

## Props

None of the three components add any props beyond native `<div>` attributes — sizing and colour are
plain Tailwind classes.

## The aspect ratio is fixed — size it by width only

`PhoneMockup` has a fixed 462:978 aspect ratio, so set a width (`class="w-64"`) and let the height
follow. Setting a height instead fights the ratio.

## The bezel colour is a class, not a prop

The frame's grey border and black body are literal colours, not daisyUI theme tokens — a phone mockup
deliberately doesn't follow your theme. To recolour the bezel, use an arbitrary Tailwind value, the same
way daisyUI's own example does: `class="border-[#ff8938]"`.

## `PhoneMockupCamera` is empty by design

It takes no slot content — the element itself is the notch graphic, rendered above the display by
`z-index` rather than earlier in the flow.
