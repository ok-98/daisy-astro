---
description: A themed date picker, built by styling the third-party Cally web component rather than shipping daisyUI's own markup.
referenceUrl: https://daisyui.com/components/calendar/
referenceLabel: View this component on daisyUI
---

daisyUI's "Calendar" isn't really a component — it's theme CSS for other people's calendar libraries.
`Calendar` wraps [Cally](https://github.com/WickyNilliams/cally), the one library on that list that's
framework-agnostic and needs no per-instance JavaScript. Cally is an **optional peer dependency**: install
`cally` and `import 'cally'` once in your layout, or the component renders as an empty gap with no error.

For a date picker with zero dependencies, daisyUI itself recommends `<input type="date">` instead —
`TextInput` already styles it.

## Props

| Prop | Type | Notes |
|---|---|---|
| `previous` (slot) | — | Overrides the "previous month" arrow. Falls back to daisyUI's own SVG. |
| `next` (slot) | — | Overrides the "next month" arrow. Falls back to daisyUI's own SVG. |
| default slot | — | Holds the `<calendar-month>` grid; defaults to a single month. |

Every other Cally attribute (`value`, `min`, `max`, `locale`, `months`, `first-day-of-week`, ...) forwards
as a plain attribute on the rendered `<calendar-date>` element.

## The registration step is not optional

Forgetting `import 'cally'` doesn't error — it just renders nothing, because an unregistered custom
element is an unknown inline tag as far as the browser is concerned. Do the import once, at the layout
level, not per page.

## Overriding the arrows: one attribute, two meanings

```astro
<Calendar>
  <MyIcon slot="previous" />
</Calendar>
```

`slot="previous"` here does double duty: it's both Astro's mechanism for targeting the component's named
slot *and* the web-components attribute that tells Cally's shadow DOM where the icon goes. You only ever
write it once, on your own element, but it's worth knowing it isn't a coincidence you can drop.

## Styling only reaches the host element

The calendar grid, headers and day cells live inside Cally's shadow DOM, and daisyUI styles them through
`::part()` selectors. A `class` you pass to `Calendar` lands on the host only (`bg-base-100 border
rounded-box` works great) — there's no way to reach individual days with Tailwind, and no `innerClass`
escape hatch, because there's no light-DOM element to attach one to.
