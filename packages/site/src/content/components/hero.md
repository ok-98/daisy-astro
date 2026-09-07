---
description: A full-width banner for a page's main heading, message and call to action.
referenceUrl: https://daisyui.com/components/hero/
referenceLabel: View this component on daisyUI
---

`Hero` is a single-cell grid: an optional `HeroOverlay` and a `HeroContent` are stacked in the same
cell, which is how a tint sits behind the content with no `z-index` involved. All three components are
plain `<div>`s with no variant classes at all.

## Props

None of `Hero`, `HeroContent` or `HeroOverlay` add any props beyond native `<div>` attributes — every
axis in this component is a plain Tailwind class.

## Give it a height

daisyUI sets a width for `Hero` but no height, so without one the hero collapses to exactly the size of
its content and the centring has nothing to centre in. Add `class="min-h-screen"` or a fixed value like
`class="min-h-[30rem]"`.

## A background image is an inline style, not a prop

There's no `image` prop — daisyUI has no class for a background photo, so it's a `style` attribute on
`Hero` itself:

```astro
<Hero style="background-image: url(/photo.webp)">
```

## `HeroOverlay` takes no children

It's an intentionally empty tint layer — passing it content throws at build time, because anything
placed inside would render behind `HeroContent`'s stacking context and never be visible. Put your
heading, text and buttons in `HeroContent` instead.
