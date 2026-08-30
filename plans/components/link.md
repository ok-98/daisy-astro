# Link Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/link/
**Root element:** `a` by default, polymorphic — see §3a
**Target file:** `packages/daisy-astro/src/components/Link/Link.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Link/Link.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Link.astro` and 15 stories are in the repo per §4/§5; markup, type probe and CSS coverage verified (§8). Two deviations from §4's listing, both from `plans/README.md` §5c: the frontmatter comment carries no angle brackets, and `Props` takes the `= 'a'` default type parameter. Step 5 (visual pass) is open — every claim in §3b and §3c is a hover state, which markup cannot show. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/link.css` and the doc page source. §3d lists what is **unverified**.

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

- [x] **Step 1: done.** §3d.1 holds — no structural risk, and the slot-wrapping question is settled library-wide anyway (`plans/IMPLEMENTATION-ORDER.md` §2, Tier 0.3).
- [x] **Step 2: skipped as planned.** `DaisyColor` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4 and the gate walked. The probe errored on exactly three lines — `href` with `as="button"`, `color="banana"`, `size="lg"` — and passed every valid one, including native attributes with no `as`.
- [x] **Step 4: done.** `Link.stories.ts`, 15 stories per §5, markup copied from the doc page.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and this component needs them more than most: every remaining claim is a hover or focus state.** Verify: `Default` is underlined and inherits the surrounding colour; `Colors` shows eight distinct hues that **darken** on hover, including on a dark theme (§3c); `LinkHover` has no underline until hovered (§3b); `AsButton`'s two rows look identical; tabbing shows a focus ring while clicking does not (§3c). If `LinkHover` looks inert, check §3d.3 — Storybook's device emulation can turn off `@media (hover: hover)` — before reporting a bug.
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `href`, `target`, `rel`, `id`, `data-*` and `style` on the anchor with `class` merged as `link link-accent link-hover mine`. Full output in §8.
- [x] **Step 7: done — the `Link` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 10 daisyUI classes reachable: base, `hover`, 8 colours.
- [x] `color` uses `DaisyColor`, imported, not redeclared.
- [x] Default root is `a`; `as="button"` works and narrows `href` away; probe passes (§3a).
- [x] `hover`'s JSDoc states that it **removes** the underline and is hover-media gated (§3b).
- [x] JSDoc notes the hover darkening across themes (§3c).
- [x] No invented axis — no size, no `href` prop.
- [x] One story per doc-page example, plus `Colors`, `AsButton` and `HoverInText`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default      → <a href="#" class="link">Click me</a>
InParagraph  → <p>Tailwind CSS resets the style of links by default.<br />Add "link" class to make it
               look like a <a href="#" class="link">normal link</a> again.</p>
Primary…Error → <a href="#" class="link link-primary">Click me</a>  … one per colour example
LinkHover    → <a href="#" class="link link-hover">Click me</a>
Colors       → all eight, neutral included — the page shows seven, one at a time
AsButton     → <a href="#" class="link link-primary">Anchor</a>
               <button type="button" class="link link-primary">Button</button>
HoverInText  → <p>A plain <a href="#" class="link">link</a> is underlined at rest. A
               <a href="#" class="link link-hover">hover link</a> is not…</p>
Passthrough  → <a href="https://example.com" target="_blank" rel="noreferrer" id="link-1"
               data-test="yes" style="letter-spacing:2px" class="link link-accent link-hover mine">
```

What this settles: the anchor default holds and `as="button"` produces a real `button` with `type` narrowed to it; `href`, `target` and `rel` ride `...rest` rather than being props; all 10 classes have rules in the built stylesheet.

Not settled here, and it is most of the component: the underline behaviour of `hover`, the hover darkening, and the focus ring are all states no static markup can show. Step 5.
