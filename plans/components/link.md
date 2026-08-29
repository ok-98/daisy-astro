# Link Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/link/
**Root element:** `a` by default, polymorphic — see §3a
**Target file:** `packages/daisy-astro/src/components/Link/Link.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Link/Link.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/link.css` and the doc page source. §3d lists what is **unverified**.

---

## 0. Ten classes, and daisyUI's own subtitle explains the whole component

*"Link adds the missing underline style to links."* Tailwind's preflight strips `text-decoration` from `<a>`; `.link` puts it back.

```css
.link { cursor:pointer; text-decoration-line:underline }
.link:focus { outline-style:none; @media (forced-colors:active) { outline:2px solid #0000; outline-offset:2px } }
.link:focus-visible { outline:2px solid; outline-offset:2px }
.link-hover { text-decoration-line:none }
@media (hover:hover) { .link-hover:hover { text-decoration-line:underline } }
.link-primary { color:var(--color-primary) }
@media (hover:hover) { .link-primary:hover { color:color-mix(in oklab, var(--color-primary) 80%, #000) } }
… one pair per colour …
```

**[all verified]**. No layout, no sizing, no parts.

## 1. Variant audit

**10 classes: 1 base + 1 style + 8 colour**, matching the doc page's frontmatter. `grep -oE '\.link[a-z0-9-]*' link.css | sort -u` returns exactly those 10 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `link` | — | — | Always applied. |
| Style | `link-hover` | `hover` | `boolean` | **One class → boolean**, not a `variant` union. Same call as `file-input-ghost` (`plans/components/file-input.md` §1) and `card-side`. The name is a slight lie — §3b. |
| Colour | `link-neutral` `-primary` `-secondary` `-accent` `-success` `-info` `-warning` `-error` | `color` | `DaisyColor` | Matches `DaisyColor` exactly — import it. |

**No size axis** — there is no `link-lg` **[verified]**; a link inherits its surroundings' font size, which is the point.

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — the link is the root | no | `Click me`, `normal link` |

Single default slot, no gating, no fallback content. No `href` prop — `href` arrives through `...rest` and is type-narrowed by `as` (§3a).

## 3. Four things the naive implementation gets wrong

### 3a. The doc page renders `<button>`, the copy-paste HTML says `<a>`

Every rendered example on the page is `<button class="link">`, while every code block beside it is `<a class="link">` **[verified]** — the docs site substitutes buttons so its demos do not navigate.

**The default is `<a>`**, matching the published markup and the component's entire purpose. It is `Polymorphic<{ as: Tag }>` so `as="button"` is available, which is the right element for a link-styled control that performs an action rather than navigating — a genuinely common case, and one the doc page's own demos illustrate by accident.

Same mechanism as `plans/components/badge.md` §3a, including `plans/README.md` §5c's silent generic-inference failure. The probe in §4 is mandatory.

Note what `as="button"` does **not** bring: `.link` sets only `cursor`, `text-decoration` and `color` **[verified]**, so a `<button class="link">` keeps the browser's default button padding and background unless the caller resets them. Tailwind's preflight already removes the background and border, so in a Tailwind project this is a non-issue — worth one JSDoc line rather than a workaround.

### 3b. `link-hover` removes the underline; it does not add a hover effect

```css
.link-hover { text-decoration-line: none }
@media (hover:hover) { .link-hover:hover { text-decoration-line: underline } }
```

**[verified]**. The class's job is to *suppress* the base underline and restore it only on hover — the reverse of what the name suggests to someone who has not read the CSS, and the reason the prop's JSDoc spells it out.

Two consequences worth stating:

- **On a touch device there is no hover**, and the `@media (hover: hover)` guard **[verified]** means the underline never appears at all. A `link-hover` link on a phone is styled text with no affordance beyond its colour. daisyUI ships it that way; the JSDoc notes it so it is a deliberate choice rather than a surprise.
- Combined with no `color`, a `hover` link is **visually identical to surrounding text** at rest. Fine inside a Footer (where every doc example pairs `link link-hover`), risky in body copy.

### 3c. Colours darken on hover, and only where hover exists

Each colour class is a pair: a base `color` and a `@media (hover: hover)` rule mixing 80% of it with black **[verified]**. So the hover feedback is a **darkening**, which is inverted on dark themes — a dark-theme primary link gets darker, not lighter, on hover. That is daisyUI's CSS across all eight colours; note it, do not patch it.

Without a `color`, `.link` sets no colour at all **[verified]** — the link inherits, which is why the "normal link" example blends into the paragraph apart from the underline.

`:focus-visible` gets a real 2px outline while `:focus` explicitly clears it **[verified]**, so keyboard focus is visible and mouse focus is not. Nothing to add.

### 3d. Unverified assumptions

1. **Nothing structural.** There are no child selectors, no parts and no `:nth-child` rules **[verified]**, so the shared slot-wrapping question that gates seventeen sibling plans does not apply — the same conclusion as `plans/components/kbd.md` §3d and `plans/components/divider.md` §3f.
2. **Generic prop inference** — `Polymorphic` brings §5c's silent failure. The probe is mandatory (§3a).
3. **Hover-media behaviour in the canvas.** `hover` and every colour's hover state are behind `@media (hover: hover)` **[verified]**; Storybook's device emulation can switch that off, which would make `LinkHover` look broken. Check before reporting one.

## 4. Component implementation

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';
import type { DaisyColor } from '../../lib/variants';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * Restores the underline Tailwind's preflight removes from `<a>`.
 *
 * Defaults to `<a>`; use `as="button"` for a link-styled control that acts
 * rather than navigates (plan §3a).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  color?: DaisyColor;
  /**
   * **Removes** the underline and shows it on hover only — not an extra hover
   * effect (plan §3b). Behind `@media (hover: hover)`, so on touch devices the
   * underline never appears.
   */
  hover?: boolean;
}>;

// Full literal class names. NEVER `link-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'link-primary', secondary: 'link-secondary', accent: 'link-accent',
  neutral: 'link-neutral', info: 'link-info', success: 'link-success',
  warning: 'link-warning', error: 'link-error',
};

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'a', color, hover = false, class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['link', color && COLOR[color], { 'link-hover': hover }, className]} {...rest}>
  <slot />
</Tag>
```

No `<script>`: pure CSS, including the forced-colors and focus-visible handling (§3c).

### Astro idioms gate

- [ ] Content arrives via the default slot — no `text` or `href` prop (§2).
- [ ] Default root is `a`, with `as` via `Polymorphic` (§3a).
- [ ] No `Astro.slots.has()` gating, no fallback content.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root — carries `href`, `target`, `rel`, `download`, and `type`/`disabled` when `as="button"`.
- [ ] `hover` is a boolean, not a one-value union (§1).
- [ ] No variant prop collides with a native attribute: `color` shadows only the obsolete non-standard `color` attribute (`astro-jsx.d.ts:602`) **[verified]**, the tradeoff Button already accepted; `hover` is not an attribute.
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` (§3d.2).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Link href="/docs">Click me</Link>
  <Link color="primary" hover class="text-lg">Click me</Link>
  <Link as="button" type="button">Click me</Link>
  <Link href="/nope" as="button">must error — href needs as="a"</Link>
  <Link color="banana">must error — not a DaisyColor</Link>
  <Link size="lg">must error — no size axis (§1)</Link>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default`, `InParagraph`, then one per colour — `Primary`, `Secondary`, `Accent`, `Success`, `Info`, `Warning`, `Error` — and `LinkHover`. (`Neutral` has no example of its own on the page but exists as a class; it is folded into the `Colors` story below.)

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`Colors`** — all eight side by side, since the page shows seven of them one at a time and omits `neutral`.
- **`AsButton`** — `as="button"`, the case the page's own demos use without documenting (§3a).
- **`HoverInText`** — a `hover` link inside a paragraph, showing §3b's "invisible until hovered" tradeoff next to a plain one.

## 6. Steps

- [ ] **Step 1:** Nothing to re-read. Note §3d.1 removes the slot-wrapping unknown.
- [ ] **Step 2:** No new shared unions — `DaisyColor` reused unchanged. `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate. **Run the probe** — the generic failure is silent.
- [ ] **Step 4:** Replace `Link.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` is underlined and inherits the surrounding colour; `Colors` shows eight distinct hues that **darken** on hover (§3c); `LinkHover` has no underline until hovered (§3b); `AsButton` renders a `<button>` that looks identical; tabbing shows a focus ring, clicking does not (§3c). Check §3d.3 if `LinkHover` looks inert.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<(a|button)[^>]*class="link[^"]*"' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Link` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 10 daisyUI classes reachable: base, `hover`, 8 colours.
- [ ] `color` uses `DaisyColor`, imported, not redeclared.
- [ ] Default root is `a`; `as="button"` works and narrows `href` away; probe passes (§3a).
- [ ] `hover`'s JSDoc states that it **removes** the underline and is hover-media gated (§3b).
- [ ] JSDoc notes the hover darkening across themes (§3c).
- [ ] No invented axis — no size, no `href` prop.
- [ ] One story per doc-page example, plus `Colors`, `AsButton` and `HoverInText`.
- [ ] Every box in §4's gate ticked.
