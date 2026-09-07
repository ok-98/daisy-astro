---
description: A card groups a figure, a title, some text, and actions into one flexible container.
referenceUrl: https://daisyui.com/components/card/
referenceLabel: View this component on daisyUI
---

`Card` renders the outer container and nothing else — its parts (`CardBody`, `CardTitle`,
`CardActions`) are separate components you compose in whatever order the layout needs. This
composition-first shape is deliberate: daisyUI's own examples put the figure before *or* after the
body, and put the actions row first *or* last, so a fixed slot layout couldn't express every card.

## Props

### `Card`

| Prop | Type | Notes |
|---|---|---|
| `as` | `'div' \| 'label' \| ...` | `label` makes the card selectable, wrapping a direct-child `<input>`. Defaults to `div`. |
| `variant` | `'border' \| 'dash'` | |
| `size` | `DaisySize` | Sets the body padding and title size via descendant selectors — no size prop on the parts. |
| `side` | `boolean` | Lays the figure beside the body instead of above it. |
| `imageFull` | `boolean` | Makes the figure a full-bleed background behind the body text. |

### `CardBody` / `CardActions`

One class each, no props beyond native attributes — put alignment (`class="justify-end"`) or padding
directly on them.

### `CardTitle`

| Prop | Type | Notes |
|---|---|---|
| `as` | `'h2' \| 'h3' \| ...` | Heading level. Defaults to `h2`, matching daisyUI's own examples — override it to fit your page's outline. |

## No `CardFigure`

daisyUI styles the bare `<figure>` element, not a `card-figure` class, so you write `<figure>` directly
— no wrapper component needed. Its rounded corners come from its position: a `<figure>` that's the
*first* child of `Card` rounds its top corners, and one that's the *last* child rounds its bottom
corners. That's what makes "image on top" and "image on bottom" both work from the same markup.

## Composing a card

```astro
<Card class="w-96 bg-base-100 shadow-sm">
  <figure><img src="/shoes.webp" alt="Shoes" /></figure>
  <CardBody>
    <CardTitle>Card Title</CardTitle>
    <p>A card component has a figure, a body, and inside body a title and actions.</p>
    <CardActions class="justify-end">
      <Button color="primary">Buy Now</Button>
    </CardActions>
  </CardBody>
</Card>
```

There's no `color` prop — a coloured card is `class="bg-primary text-primary-content"`, plain Tailwind
on `Card` itself.
