---
description: Text attached to a form field — either a bordered affix inside it, or a floating caption above it.
referenceUrl: https://daisyui.com/components/label/
referenceLabel: View this component on daisyUI
---

daisyUI's "Label" isn't a form-field label in the usual sense — it's two unrelated components that happen
to share a doc page. `Label` renders an in-field affix (like the `https://` before a URL field); `FloatingLabel`
wraps a field so its caption animates up above it on focus.

## Props

### `Label`

| Prop | Type | Notes |
|---|---|---|
| `as` | `'span' \| 'label' \| ...` | Defaults to `span`. |

### `FloatingLabel`

No variant props — just a `<label>` wrapping a `<span>` and a field, with every native `<label>` attribute
forwarding through.

## `Label` defaults to `span`, not `label`, on purpose

When used as an affix, `Label` sits inside daisyUI's own `<label class="input">` wrapper around the field
— nesting a second `<label>` in there would be invalid HTML. That's the default shape:

```astro
<label class="input">
  <Label>https://</Label>
  <input type="text" placeholder="URL" />
</label>
```

For the more familiar "text above a field" usage seen on the Fieldset and Checkbox pages, switch to
`as="label"` with a `for`, which makes it a genuine form label:

```astro
<Label as="label" for="email">Email</Label>
<input id="email" type="email" class="input" />
```

Outside a field wrapper, the same class is just dimmed inline text rather than a bordered affix — the two
usages look nothing alike, and the position (first, last, or a direct child at all) is what decides which
you get.

## `FloatingLabel` needs a placeholder to work

The floating animation is driven entirely by `:placeholder-shown` — the caption is up whenever the field
isn't showing its placeholder. Without a `placeholder` attribute on the field, `:placeholder-shown` never
matches and the label starts (and stays) floated. There's no `size` prop on `FloatingLabel` either: sizing
comes from the field's own `input-*` class.
