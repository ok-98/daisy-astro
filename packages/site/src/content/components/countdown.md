---
description: Countdown renders a number 0–999 with an animated rolling-digit transition when the value changes.
referenceUrl: https://daisyui.com/components/countdown/
referenceLabel: View this component on daisyUI
---

Countdown is a **transition effect, not a timer**. It renders a number with daisyUI's rolling-digit
style; making that number actually count down is your own script's job, on your own interval. There's
no `to`/`from`/`interval` prop and no `<script>` in this component.

## Props

### `Countdown`

Just a plain `<span>` wrapper — no variant props. Font size (`text-2xl`) and `font-mono` (which keeps
the digits from shifting width) are your own classes.

### `CountdownValue`

| Prop | Type | Notes |
|---|---|---|
| `value` | `number` — **required** | 0–999. Out-of-range values are clamped or wrapped by daisyUI's CSS. |
| `digits` | `1 \| 2 \| 3` | Minimum digits shown, so the box doesn't resize when the value crosses 10 or 100. |

## One prop, three synced outputs

`CountdownValue` writes the number in three places from a single `value` prop: the `--value` CSS custom
property that drives the animation, the visible text node, and an `aria-label`. The label matters more
than it looks — the visible digits are drawn with CSS `content`, and the underlying text node is
`visibility: hidden`, so `aria-label` is the *only* thing a screen reader gets.

```astro
<Countdown class="font-mono text-2xl">
  <CountdownValue value={59} />
</Countdown>
```

## Updating it yourself

To actually count down, update all three together — `--value`, `aria-label`, and the text — on an
interval in your own script:

```html
<script>
  const el = document.getElementById('secs');
  setInterval(() => {
    const n = (Number(el.style.getPropertyValue('--value')) + 59) % 60;
    el.style.setProperty('--value', String(n));
    el.setAttribute('aria-label', String(n));
    el.textContent = String(n);
  }, 1000);
</script>
```
